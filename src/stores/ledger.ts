/**
 * Ledger Store
 * Manages drink session tracking, history, and statistics
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { db } from "@/services/database";
import type {
  LedgerSession,
  LedgerEntry,
  LedgerIngredientUsage,
  SessionWithEntries,
  SessionStats,
  GlobalLedgerStats,
  CocktailWithDetails,
} from "@/types";
import { useAchievementsStore } from "./achievements";

// ============================================
// Helper: Generate session name from date
// ============================================

function generateSessionName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return `Session - ${date.toLocaleDateString("en-US", options)}`;
}

// ============================================
// Store Definition
// ============================================

export const useLedgerStore = defineStore("ledger", () => {
  const achievementsStore = useAchievementsStore();

  // ============================================
  // State
  // ============================================

  const sessions = ref<LedgerSession[]>([]);
  const activeSession = ref<LedgerSession | null>(null);
  const currentSessionEntries = ref<LedgerEntry[]>([]);
  const isLoading = ref(false);
  const previousSessionId = ref<number | null>(null);

  // ============================================
  // Computed
  // ============================================

  const hasActiveSession = computed(() => activeSession.value !== null);

  const sessionCount = computed(() => sessions.value.length);

  const hasPreviousSession = computed(() => previousSessionId.value !== null);

  const currentSessionDrinkCount = computed(
    () => currentSessionEntries.value.length
  );

  const sortedSessions = computed(() =>
    [...sessions.value].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  // ============================================
  // Actions - Session Management
  // ============================================

  /**
   * Load all sessions from database
   */
  async function loadSessions(): Promise<void> {
    isLoading.value = true;
    try {
      sessions.value = await db.ledgerSessions.toArray();

      // Check for active session
      const active = sessions.value.find((s) => s.isActive);
      if (active) {
        activeSession.value = active;
        await loadSessionEntries(active.id!);
      }

      // Load previous session ID from metadata
      const meta = await db.metadata.get("lastSessionId");
      if (meta) {
        previousSessionId.value = meta.value;
      }

      // Track session count
      const completedSessions = sessions.value.filter(
        (s) => !s.isActive && s.totalDrinks > 0
      ).length;
      achievementsStore.trackEvent(
        "sessions_completed",
        completedSessions,
        "set"
      );
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load entries for a specific session
   */
  async function loadSessionEntries(sessionId: number): Promise<void> {
    currentSessionEntries.value = await db.ledgerEntries
      .where("sessionId")
      .equals(sessionId)
      .sortBy("createdAt");
  }

  /**
   * Create a new session
   */
  async function createSession(name?: string): Promise<LedgerSession> {
    const now = new Date();
    const session: LedgerSession = {
      name: name || generateSessionName(now),
      createdAt: now,
      updatedAt: now,
      isActive: true,
      totalDrinks: 0,
      totalVolumeMl: 0,
    };

    // Deactivate any existing active session
    if (activeSession.value) {
      await db.ledgerSessions.update(activeSession.value.id!, {
        isActive: false,
        updatedAt: new Date(),
      });
    }

    const id = (await db.ledgerSessions.add(session)) as number;
    session.id = id;

    // Update metadata
    await db.metadata.put({ key: "lastSessionId", value: id });
    previousSessionId.value = id as number;

    activeSession.value = session;
    currentSessionEntries.value = [];
    sessions.value.push(session);

    return session;
  }

  /**
   * Resume a previous session
   */
  async function resumeSession(sessionId: number): Promise<void> {
    // Deactivate current session if exists
    if (activeSession.value && activeSession.value.id !== sessionId) {
      await db.ledgerSessions.update(activeSession.value.id!, {
        isActive: false,
        updatedAt: new Date(),
      });
    }

    // Activate the target session
    await db.ledgerSessions.update(sessionId, {
      isActive: true,
      updatedAt: new Date(),
    });

    const session = await db.ledgerSessions.get(sessionId);
    if (session) {
      activeSession.value = session;
      await loadSessionEntries(sessionId);

      // Update metadata
      await db.metadata.put({ key: "lastSessionId", value: sessionId });
      previousSessionId.value = sessionId;
    }

    // Refresh sessions list
    await loadSessions();
  }

  /**
   * End a session (deactivate). If no sessionId provided, ends the active session.
   */
  async function endSession(sessionId?: number): Promise<void> {
    const targetId = sessionId ?? activeSession.value?.id;
    if (!targetId) return;

    await db.ledgerSessions.update(targetId, {
      isActive: false,
      updatedAt: new Date(),
    });

    // If we ended the active session, clear it
    if (activeSession.value?.id === targetId) {
      activeSession.value = null;
      currentSessionEntries.value = [];
    }

    await loadSessions();
  }

  /**
   * Rename a session
   */
  async function renameSession(
    sessionId: number,
    newName: string
  ): Promise<void> {
    await db.ledgerSessions.update(sessionId, {
      name: newName,
      updatedAt: new Date(),
    });

    // Update local state
    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) {
      session.name = newName;
    }
    if (activeSession.value?.id === sessionId) {
      activeSession.value.name = newName;
    }
  }

  /**
   * Delete a session and all its entries
   */
  async function deleteSession(sessionId: number): Promise<void> {
    await db.transaction(
      "rw",
      [db.ledgerSessions, db.ledgerEntries],
      async () => {
        await db.ledgerEntries.where("sessionId").equals(sessionId).delete();
        await db.ledgerSessions.delete(sessionId);
      }
    );

    // Update local state
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);

    if (activeSession.value?.id === sessionId) {
      activeSession.value = null;
      currentSessionEntries.value = [];
    }

    // Clear previous session if it was deleted
    if (previousSessionId.value === sessionId) {
      previousSessionId.value = null;
      await db.metadata.delete("lastSessionId");
    }
  }

  /**
   * Merge multiple sessions into one
   */
  async function mergeSessions(
    sourceIds: number[],
    targetName: string
  ): Promise<LedgerSession> {
    // Get all entries from source sessions
    const allEntries: LedgerEntry[] = [];
    let totalDrinks = 0;
    let totalVolumeMl = 0;
    let earliestDate = new Date();

    for (const id of sourceIds) {
      const entries = await db.ledgerEntries
        .where("sessionId")
        .equals(id)
        .toArray();
      allEntries.push(...entries);

      const session = await db.ledgerSessions.get(id);
      if (session) {
        totalDrinks += session.totalDrinks;
        totalVolumeMl += session.totalVolumeMl;
        if (new Date(session.createdAt) < earliestDate) {
          earliestDate = new Date(session.createdAt);
        }
      }
    }

    // Create new merged session
    const now = new Date();
    const mergedSession: LedgerSession = {
      name: targetName,
      createdAt: earliestDate,
      updatedAt: now,
      isActive: false,
      totalDrinks,
      totalVolumeMl,
    };

    const newId = await db.ledgerSessions.add(mergedSession);
    mergedSession.id = newId;

    // Update all entries to point to new session
    for (const entry of allEntries) {
      await db.ledgerEntries.update(entry.id!, { sessionId: newId });
    }

    // Delete old sessions (entries already reassigned)
    for (const id of sourceIds) {
      await db.ledgerSessions.delete(id);
    }

    await loadSessions();
    return mergedSession;
  }

  // ============================================
  // Actions - Entry Management
  // ============================================

  /**
   * Record a completed drink
   */
  async function recordDrink(
    cocktail: CocktailWithDetails,
    scale: number,
    ingredientsUsed: LedgerIngredientUsage[]
  ): Promise<LedgerEntry> {
    // Create session if none exists
    if (!activeSession.value) {
      await createSession();
    }

    const now = new Date();
    const entry: LedgerEntry = {
      sessionId: activeSession.value!.id!,
      cocktailId: cocktail.id!,
      cocktailName: cocktail.name,
      cocktailSlug: cocktail.slug,
      quantity: 1,
      scale,
      createdAt: now,
      ingredientsUsed,
    };

    const id = await db.ledgerEntries.add(entry);
    entry.id = id;

    // Update session totals
    const volumeUsed = ingredientsUsed.reduce(
      (sum, ing) => sum + ing.quantityMl,
      0
    );

    await db.ledgerSessions.update(activeSession.value!.id!, {
      totalDrinks: activeSession.value!.totalDrinks + 1,
      totalVolumeMl: activeSession.value!.totalVolumeMl + volumeUsed,
      updatedAt: now,
    });

    // Update local state
    // Update local state
    activeSession.value!.totalDrinks += 1;
    activeSession.value!.totalVolumeMl += volumeUsed;
    currentSessionEntries.value.push(entry);

    // Track achievements
    achievementsStore.trackEvent("recipes_prepped");
    achievementsStore.trackEvent("total_volume_ml", volumeUsed);

    return entry;
  }

  /**
   * Delete a single entry
   */
  async function deleteEntry(entryId: number): Promise<void> {
    const entry = await db.ledgerEntries.get(entryId);
    if (!entry) return;

    // Update session totals
    const session = await db.ledgerSessions.get(entry.sessionId);
    if (session) {
      const volumeRemoved = entry.ingredientsUsed.reduce(
        (sum, ing) => sum + ing.quantityMl,
        0
      );
      await db.ledgerSessions.update(session.id!, {
        totalDrinks: Math.max(0, session.totalDrinks - 1),
        totalVolumeMl: Math.max(0, session.totalVolumeMl - volumeRemoved),
        updatedAt: new Date(),
      });
    }

    await db.ledgerEntries.delete(entryId);

    // Update local state
    currentSessionEntries.value = currentSessionEntries.value.filter(
      (e) => e.id !== entryId
    );
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  /**
   * Get detailed statistics for a session
   */
  async function getSessionStats(sessionId: number): Promise<SessionStats> {
    const session = await db.ledgerSessions.get(sessionId);
    const entries = await db.ledgerEntries
      .where("sessionId")
      .equals(sessionId)
      .toArray();

    if (!session || entries.length === 0) {
      return {
        totalDrinks: 0,
        uniqueCocktails: 0,
        totalVolumeMl: 0,
        durationMinutes: 0,
        averageDrinksPerHour: 0,
        mostPopularCocktail: null,
        ingredientBreakdown: [],
        drinkTimeline: [],
      };
    }

    // Calculate duration
    // Sort entries by time
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstEntryTime = new Date(sortedEntries[0].createdAt).getTime();

    // For ended sessions, use session.updatedAt; for active sessions or if only first to last entry
    // makes more sense, use last entry time
    const endTime = session.isActive
      ? new Date(sortedEntries[sortedEntries.length - 1].createdAt).getTime()
      : new Date(session.updatedAt).getTime();

    const durationMinutes = Math.max(
      0,
      Math.round((endTime - firstEntryTime) / (1000 * 60))
    );

    // Unique cocktails
    const cocktailCounts = new Map<string, number>();
    for (const entry of entries) {
      const count = cocktailCounts.get(entry.cocktailName) || 0;
      cocktailCounts.set(entry.cocktailName, count + entry.quantity);
    }

    // Most popular
    let mostPopular: { name: string; count: number } | null = null;
    cocktailCounts.forEach((count, name) => {
      if (!mostPopular || count > mostPopular.count) {
        mostPopular = { name, count };
      }
    });

    // Ingredient breakdown
    const ingredientTotals = new Map<string, number>();
    for (const entry of entries) {
      for (const ing of entry.ingredientsUsed) {
        const current = ingredientTotals.get(ing.ingredientName) || 0;
        ingredientTotals.set(ing.ingredientName, current + ing.quantityMl);
      }
    }
    const ingredientBreakdown = Array.from(ingredientTotals.entries())
      .map(([ingredientName, totalMl]) => ({ ingredientName, totalMl }))
      .sort((a, b) => b.totalMl - a.totalMl);

    // Timeline
    const drinkTimeline = entries.map((e) => ({
      time: new Date(e.createdAt),
      cocktailName: e.cocktailName,
      quantity: e.quantity,
    }));

    return {
      totalDrinks: session.totalDrinks,
      uniqueCocktails: cocktailCounts.size,
      totalVolumeMl: session.totalVolumeMl,
      durationMinutes,
      averageDrinksPerHour:
        durationMinutes > 0
          ? (session.totalDrinks / durationMinutes) * 60
          : session.totalDrinks,
      mostPopularCocktail: mostPopular,
      ingredientBreakdown,
      drinkTimeline,
    };
  }

  /**
   * Get global statistics across all sessions
   */
  async function getGlobalStats(): Promise<GlobalLedgerStats> {
    const allSessions = await db.ledgerSessions.toArray();
    const allEntries = await db.ledgerEntries.toArray();

    if (allSessions.length === 0) {
      return {
        totalSessions: 0,
        totalDrinks: 0,
        totalVolumeMl: 0,
        averageDrinksPerSession: 0,
        averageSessionDurationMinutes: 0,
        mostMadeCocktail: null,
        topIngredients: [],
        drinksByDay: [],
        drinksByWeekday: [],
        drinksByHour: [],
      };
    }

    const totalDrinks = allSessions.reduce((sum, s) => sum + s.totalDrinks, 0);
    const totalVolumeMl = allSessions.reduce(
      (sum, s) => sum + s.totalVolumeMl,
      0
    );

    // Most made cocktail
    const cocktailCounts = new Map<string, number>();
    for (const entry of allEntries) {
      const count = cocktailCounts.get(entry.cocktailName) || 0;
      cocktailCounts.set(entry.cocktailName, count + entry.quantity);
    }
    let mostMade: { name: string; count: number } | null = null;
    cocktailCounts.forEach((count, name) => {
      if (!mostMade || count > mostMade.count) {
        mostMade = { name, count };
      }
    });

    // Top ingredients
    const ingredientStats = new Map<
      string,
      { totalMl: number; usageCount: number }
    >();
    for (const entry of allEntries) {
      for (const ing of entry.ingredientsUsed) {
        const current = ingredientStats.get(ing.ingredientName) || {
          totalMl: 0,
          usageCount: 0,
        };
        ingredientStats.set(ing.ingredientName, {
          totalMl: current.totalMl + ing.quantityMl,
          usageCount: current.usageCount + 1,
        });
      }
    }
    const topIngredients = Array.from(ingredientStats.entries())
      .map(([ingredientName, stats]) => ({ ingredientName, ...stats }))
      .sort((a, b) => b.totalMl - a.totalMl)
      .slice(0, 10);

    // Drinks by day
    const dayStats = new Map<string, number>();
    for (const entry of allEntries) {
      const date = new Date(entry.createdAt).toLocaleDateString();
      dayStats.set(date, (dayStats.get(date) || 0) + entry.quantity);
    }
    const drinksByDay = Array.from(dayStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    // Drinks by weekday
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayStats = new Map<number, number>();
    for (const entry of allEntries) {
      const weekday = new Date(entry.createdAt).getDay();
      weekdayStats.set(weekday, (weekdayStats.get(weekday) || 0) + 1);
    }
    const drinksByWeekday = weekdayNames.map((weekday, i) => ({
      weekday,
      count: weekdayStats.get(i) || 0,
    }));

    // Drinks by hour
    const hourStats = new Map<number, number>();
    for (const entry of allEntries) {
      const hour = new Date(entry.createdAt).getHours();
      hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
    }
    const drinksByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourStats.get(hour) || 0,
    }));

    // Average session duration
    let totalDuration = 0;
    for (const session of allSessions) {
      const sessionEntries = allEntries.filter(
        (e) => e.sessionId === session.id
      );
      if (sessionEntries.length > 1) {
        const times = sessionEntries.map((e) =>
          new Date(e.createdAt).getTime()
        );
        totalDuration += Math.max(...times) - Math.min(...times);
      }
    }
    const averageSessionDurationMinutes = Math.round(
      totalDuration / (1000 * 60 * allSessions.length)
    );

    return {
      totalSessions: allSessions.length,
      totalDrinks,
      totalVolumeMl,
      averageDrinksPerSession: totalDrinks / allSessions.length,
      averageSessionDurationMinutes,
      mostMadeCocktail: mostMade,
      topIngredients,
      drinksByDay,
      drinksByWeekday,
      drinksByHour,
    };
  }

  /**
   * Get session with all entries
   */
  async function getSessionWithEntries(
    sessionId: number
  ): Promise<SessionWithEntries | null> {
    const session = await db.ledgerSessions.get(sessionId);
    if (!session) return null;

    const entries = await db.ledgerEntries
      .where("sessionId")
      .equals(sessionId)
      .sortBy("createdAt");

    return { ...session, entries };
  }

  /**
   * Get the previous session (for resume prompt)
   */
  async function getPreviousSession(): Promise<LedgerSession | null> {
    if (!previousSessionId.value) return null;
    return (await db.ledgerSessions.get(previousSessionId.value)) || null;
  }

  return {
    // State
    sessions,
    activeSession,
    currentSessionEntries,
    isLoading,
    previousSessionId,

    // Computed
    hasActiveSession,
    sessionCount,
    hasPreviousSession,
    currentSessionDrinkCount,
    sortedSessions,

    // Session Actions
    loadSessions,
    loadSessionEntries,
    createSession,
    resumeSession,
    endSession,
    renameSession,
    deleteSession,
    mergeSessions,

    // Entry Actions
    recordDrink,
    deleteEntry,

    // Statistics
    getSessionStats,
    getGlobalStats,
    getSessionWithEntries,
    getPreviousSession,
  };
});

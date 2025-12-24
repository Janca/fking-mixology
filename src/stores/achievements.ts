/**
 * Achievements Store
 * Manages user progression, metrics, and achievement unlocks
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { db } from "@/services/database";
import { ACHIEVEMENTS } from "@/config/achievements";
import { useToastStore } from "./toast";
import { triggerBurst } from "@/utils/confetti";
import type { UserAchievement, Achievement } from "@/types";

import { router } from "@/router";

export const useAchievementsStore = defineStore("achievements", () => {
  // ============================================
  // State
  // ============================================

  const unlockedAchievements = ref<UserAchievement[]>([]);
  const unlockedIds = ref<Set<string>>(new Set());
  const metrics = ref<Map<string, number>>(new Map());
  const recentUnlocks = ref<Achievement[]>([]); // For toast/notification queue
  const isLoading = ref(false);

  // ============================================
  // Computed
  // ============================================

  const totalAchievements = computed(() => ACHIEVEMENTS.length);
  const totalUnlocked = computed(() => unlockedAchievements.value.length);
  const progressPercentage = computed(() =>
    totalAchievements.value > 0
      ? Math.round((totalUnlocked.value / totalAchievements.value) * 100)
      : 0
  );

  const achievementsList = computed(() => {
    return ACHIEVEMENTS.map((ach) => {
      const isUnlocked = unlockedIds.value.has(ach.id);
      const unlockedData = unlockedAchievements.value.find(
        (ua) => ua.achievementId === ach.id
      );

      // Calculate progress if metric condition exists
      let currentProgress = 0;
      if (ach.condition) {
        currentProgress = metrics.value.get(ach.condition.metric) || 0;
      }

      return {
        ...ach,
        isUnlocked,
        unlockedAt: unlockedData?.unlockedAt,
        currentProgress,
      };
    });
  });

  // ============================================
  // Actions
  // ============================================

  async function loadData() {
    isLoading.value = true;
    try {
      // Load unlocks
      const unlocks = await db.userAchievements.toArray();
      unlockedAchievements.value = unlocks;
      unlockedIds.value = new Set(unlocks.map((u) => u.achievementId));

      // Load metrics
      const metricEntries = await db.achievementMetrics.toArray();
      metrics.value = new Map(metricEntries.map((m) => [m.key, m.value]));
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Track a metric event and check for unlocks
   */
  async function trackEvent(
    metricKey: string,
    value: number = 1,
    operation: "add" | "set" = "add"
  ) {
    const currentVal = metrics.value.get(metricKey) || 0;
    const newVal = operation === "add" ? currentVal + value : value;

    // Update state
    metrics.value.set(metricKey, newVal);

    // Update DB (debounced loosely or just await it)
    await db.achievementMetrics.put({ key: metricKey, value: newVal });

    // Check achievements
    await checkAchievements();
  }

  let checkTimeout: any = null;

  async function checkAchievements() {
    if (checkTimeout) clearTimeout(checkTimeout);

    checkTimeout = setTimeout(async () => {
      const toUnlock: Achievement[] = [];

      for (const ach of ACHIEVEMENTS) {
        if (unlockedIds.value.has(ach.id)) continue;

        let shouldUnlock = false;

        // Check automated condition
        if (ach.condition) {
          const val = metrics.value.get(ach.condition.metric) || 0;
          const target = ach.condition.threshold;
          const op = ach.condition.operator || ">=";

          if (op === ">=" && val >= target) shouldUnlock = true;
          else if (op === "<=" && val <= target) shouldUnlock = true;
          else if (op === "==" && val === target) shouldUnlock = true;
        }

        // Custom checks
        if (ach.id === "night_owl") {
          const hour = new Date().getHours();
          if (hour >= 3 && hour < 5) shouldUnlock = true;
        }
        if (ach.id === "early_bird") {
          const hour = new Date().getHours();
          if (hour >= 6 && hour < 9) shouldUnlock = true;
        }

        if (shouldUnlock) {
          toUnlock.push(ach);
        }
      }

      if (toUnlock.length > 0) {
        console.log("Unlocking achievements:", toUnlock);
        await unlockAchievements(toUnlock);
      }
    }, 100);
  }

  async function unlockAchievements(achievements: Achievement[]) {
    const now = new Date();
    const toastStore = useToastStore();

    for (const ach of achievements) {
      // Optimistic lock: immediately mark as handled to prevent race conditions
      if (unlockedIds.value.has(ach.id)) continue;
      unlockedIds.value.add(ach.id);

      const userAch: UserAchievement = {
        achievementId: ach.id,
        unlockedAt: now,
      };

      try {
        await db.userAchievements.add(userAch);
        unlockedAchievements.value.push(userAch);
        recentUnlocks.value.push(ach);

        // Notification
        toastStore.addToast({
          title: "Achievement Unlocked!",
          message: ach.name,
          badge: ach.icon || "🏆",
          sticky: true,
          onDismiss: (e) => {
            const origin = e
              ? {
                  x: e.clientX / window.innerWidth,
                  y: e.clientY / window.innerHeight,
                }
              : undefined;
            triggerBurst(origin);
          },
          onClick: () => {
            router.push({ name: "achievements", hash: `#ach-${ach.id}` });
          },
        });

        // Track total unlocked as a metric for meta-achievements
        await trackEvent("cheevos_unlocked", 1, "add");
      } catch (error) {
        console.error("Failed to unlock achievement", error);
        // Rollback optimistic lock if it was a genuine error (not duplicate)
        // Check if error is constraint violation?
        // For now, if DB fails, we assume it might be locked next time or is already there.
        // If we remove from unlockedIds, it might re-toast on refresh.
        // Safest is to leave it 'locked' in memory to suppress noise?
        // Or remove it so it tries again?
        // Let's remove it to allow retry.
        unlockedIds.value.delete(ach.id);
      }
    }
  }

  function clearRecentUnlocks() {
    recentUnlocks.value = [];
  }

  return {
    unlockedAchievements,
    metrics,
    recentUnlocks,
    isLoading,
    totalAchievements,
    totalUnlocked,
    progressPercentage,
    achievementsList,
    loadData,
    trackEvent,
    clearRecentUnlocks,
  };
});

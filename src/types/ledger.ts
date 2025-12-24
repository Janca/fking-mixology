/**
 * Ledger Types - Session tracking for drink history
 */

// ============================================
// Session Entity
// ============================================

export interface LedgerSession {
  id?: number;
  name: string; // Auto-generated from date/time, can be renamed
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // Only one session can be active at a time
  totalDrinks: number; // Cached count for performance
  totalVolumeMl: number; // Total volume consumed in session
}

// ============================================
// Session Entry (Individual Drink)
// ============================================

export interface LedgerEntry {
  id?: number;
  sessionId: number;
  cocktailId: number;
  cocktailName: string; // Denormalized for quick display
  cocktailSlug: string; // For navigation
  quantity: number; // Number of servings made
  scale: number; // Scale factor used (1x, 2x, etc.)
  createdAt: Date;
  ingredientsUsed: LedgerIngredientUsage[]; // Snapshot of ingredients used
}

export interface LedgerIngredientUsage {
  ingredientId: number;
  ingredientName: string;
  quantityMl: number;
  originalUnit: string;
  originalQuantity: number;
}

// ============================================
// Computed/Display Types
// ============================================

export interface SessionWithEntries extends LedgerSession {
  entries: LedgerEntry[];
}

export interface SessionStats {
  totalDrinks: number;
  uniqueCocktails: number;
  totalVolumeMl: number;
  durationMinutes: number;
  averageDrinksPerHour: number;
  mostPopularCocktail: {
    name: string;
    count: number;
  } | null;
  ingredientBreakdown: {
    ingredientName: string;
    totalMl: number;
  }[];
  drinkTimeline: {
    time: Date;
    cocktailName: string;
    quantity: number;
  }[];
}

export interface GlobalLedgerStats {
  totalSessions: number;
  totalDrinks: number;
  totalVolumeMl: number;
  averageDrinksPerSession: number;
  averageSessionDurationMinutes: number;
  mostMadeCocktail: {
    name: string;
    count: number;
  } | null;
  topIngredients: {
    ingredientName: string;
    totalMl: number;
    usageCount: number;
  }[];
  drinksByDay: {
    date: string;
    count: number;
  }[];
  drinksByWeekday: {
    weekday: string;
    count: number;
  }[];
  drinksByHour: {
    hour: number;
    count: number;
  }[];
}

// ============================================
// Utility Types
// ============================================

export interface MergeSessionsPayload {
  sourceIds: number[];
  targetName: string;
}

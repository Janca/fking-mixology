/**
 * Dexie-based IndexedDB database for Mixology Matcher
 * Stores cocktail data locally for offline use
 */

import Dexie, { type EntityTable } from "dexie";
import type {
  Category,
  Cocktail,
  Ingredient,
  RecipeIngredient,
  PantryItem,
  LedgerSession,
  LedgerEntry,
  Favorite,
  UserAchievement,
  AchievementMetric,
} from "@/types";

// ============================================
// Database Schema Definition
// ============================================

export class MixologyDatabase extends Dexie {
  categories!: EntityTable<Category, "id">;
  cocktails!: EntityTable<Cocktail, "id">;
  ingredients!: EntityTable<Ingredient, "id">;
  recipeIngredients!: EntityTable<RecipeIngredient, "id">;
  pantryItems!: EntityTable<PantryItem, "id">;
  metadata!: EntityTable<{ key: string; value: any }, "key">;
  ledgerSessions!: EntityTable<LedgerSession, "id">;

  ledgerEntries!: EntityTable<LedgerEntry, "id">;
  favorites!: EntityTable<Favorite, "id">;
  userAchievements!: EntityTable<UserAchievement, "id">;
  achievementMetrics!: EntityTable<AchievementMetric, "key">;

  constructor() {
    super("MixologyMatcherDB");

    // Version 1: Initial schema
    this.version(1).stores({
      categories: "++id, name, slug",
      cocktails: "++id, name, slug, categoryId",
      ingredients: "++id, name, normalizedName",
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
    });

    // Version 2: Add pantry
    this.version(2).stores({
      categories: "++id, name, slug",
      cocktails: "++id, name, slug, categoryId",
      ingredients: "++id, name, normalizedName",
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
      pantryItems: "++id, ingredientId, updatedAt",
    });

    // Version 3: Add metadata for version tracking
    this.version(3).stores({
      categories: "++id, name, slug",
      cocktails: "++id, name, slug, categoryId",
      ingredients: "++id, name, normalizedName",
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
      pantryItems: "++id, ingredientId, updatedAt",
      metadata: "key", // key-value store
    });

    // Version 4: Add ledger for session tracking
    this.version(4).stores({
      categories: "++id, name, slug",
      cocktails: "++id, name, slug, categoryId",
      ingredients: "++id, name, normalizedName",
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
      pantryItems: "++id, ingredientId, updatedAt",
      metadata: "key",
      ledgerSessions: "++id, createdAt, isActive",
      ledgerEntries: "++id, sessionId, cocktailId, createdAt",
    });

    // Version 5: Add favorites and achievements
    this.version(5).stores({
      categories: "++id, name, slug",
      cocktails: "++id, name, slug, categoryId",
      ingredients: "++id, name, normalizedName",
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
      pantryItems: "++id, ingredientId, updatedAt",
      metadata: "key",
      ledgerSessions: "++id, createdAt, isActive",
      ledgerEntries: "++id, sessionId, cocktailId, createdAt",
      favorites: "++id, cocktailId, addedAt",
      userAchievements: "++id, achievementId, unlockedAt",
      achievementMetrics: "key", // key-value store for counters
    });

    // Version 6: Use source IDs from JSON files for cocktails and ingredients
    this.version(6).stores({
      categories: "++id, name, slug",
      cocktails: "id, name, slug, categoryId", // Removed ++ to use JSON source IDs
      ingredients: "id, name, normalizedName", // Removed ++ to use JSON source IDs
      recipeIngredients: "++id, cocktailId, ingredientId, sortOrder",
      pantryItems: "++id, ingredientId, updatedAt",
      metadata: "key",
      ledgerSessions: "++id, createdAt, isActive",
      ledgerEntries: "++id, sessionId, cocktailId, createdAt",
      favorites: "++id, cocktailId, addedAt",
      userAchievements: "++id, achievementId, unlockedAt",
      achievementMetrics: "key",
    });
  }
}

// Singleton database instance
export const db = new MixologyDatabase();

// ============================================
// Database Helper Functions
// ============================================

/**
 * Check if the database has been populated with data
 */
export async function isDatabasePopulated(): Promise<boolean> {
  const cocktailCount = await db.cocktails.count();
  return cocktailCount > 0;
}

/**
 * Clear all data from the database (preserves pantry)
 */
export async function clearDatabase(): Promise<void> {
  await db.transaction(
    "rw",
    [db.categories, db.cocktails, db.ingredients, db.recipeIngredients],
    async () => {
      await db.recipeIngredients.clear();
      await db.cocktails.clear();
      await db.ingredients.clear();
      await db.categories.clear();
    }
  );
}

/**
 * Clear pantry only
 */
export async function clearPantry(): Promise<void> {
  await db.pantryItems.clear();
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  categories: number;
  cocktails: number;
  ingredients: number;
  recipeIngredients: number;
  pantryItems: number;
}> {
  const [categories, cocktails, ingredients, recipeIngredients, pantryItems] =
    await Promise.all([
      db.categories.count(),
      db.cocktails.count(),
      db.ingredients.count(),
      db.recipeIngredients.count(),
      db.pantryItems.count(),
    ]);

  return { categories, cocktails, ingredients, recipeIngredients, pantryItems };
}

/**
 * Completely wipe the database and recreate it
 * This is used when upgrading from incompatible schema versions
 */
export async function wipeDatabase(): Promise<void> {
  try {
    console.warn("[Database] Wiping database due to incompatible schema...");

    // Close the database connection
    db.close();

    // Delete the entire database
    await Dexie.delete("MixologyMatcherDB");

    console.log("[Database] Database wiped successfully");
  } catch (error) {
    console.error("[Database] Error wiping database:", error);
    throw error;
  }
}

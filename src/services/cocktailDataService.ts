/**
 * Service for fetching and importing cocktail data from local JSON sources
 */

import {
  db,
  isDatabasePopulated,
  clearDatabase,
  wipeDatabase,
} from "./database";
import type { JsonCocktail, JsonIngredient } from "@/types";

// Import local JSON data
// Note: In a real build these would be imported dynamically to save bundle size,
// but for this app we want them available offline immediately.
import cocktailsDataRaw from "@/assets/data/cocktails_full.json";
import ingredientsDataRaw from "@/assets/data/ingredients_detailed.json";

// Cast imported JSONs to typed interfaces
const cocktailsData = cocktailsDataRaw as unknown as JsonCocktail[];
const ingredientsData = ingredientsDataRaw as unknown as JsonIngredient[];

// Import images
const cocktailImages = import.meta.glob("@/assets/images/drinks/*.jpg", {
  eager: true,
});
const ingredientImages = import.meta.glob("@/assets/images/ingredients/*.jpg", {
  eager: true,
});

// ============================================
// Data Transformation Utilities
// ============================================

/**
 * Create a URL-safe slug from a string
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize an ingredient name for matching purposes
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/fresh\s+/i, "")
    .replace(/\s+/g, " ");
}

/**
 * Parse quantity string to a number (handles fractions, ranges, etc.)
 */
/**
 * Parse a string into a number, handling mixed numbers ("1 1/2") and fractions ("1/2")
 */
function parseNumericValue(str: string): number | null {
  const clean = str.trim();

  // Handle mixed numbers like "1 1/2"
  // Look for Digit Space Digit/Digit
  const mixedMatch = clean.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const num = parseFloat(mixedMatch[2]);
    const denom = parseFloat(mixedMatch[3]);
    return whole + num / denom;
  }

  // Handle fractions like "1/2"
  const fractionMatch = clean.match(/^(\d+)\/(\d+)/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const denom = parseFloat(fractionMatch[2]);
    if (denom !== 0) return num / denom;
  }

  // Handle plain numbers
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse measurement string into structured object
 */
function parseMeasure(measureStr: string | null): {
  quantity: number | null;
  quantityMax: number | null;
  unit: string;
} {
  const result = {
    quantity: null as number | null,
    quantityMax: null as number | null,
    unit: "piece",
  };

  if (!measureStr) return result;

  let cleanStr = measureStr.trim();
  const lowerStr = cleanStr.toLowerCase();

  // 1. Determine Unit
  // Special case: "Juice of"
  if (lowerStr.startsWith("juice of")) {
    result.unit = "juice of";
    cleanStr = lowerStr.replace("juice of", "").trim();
  } else {
    result.unit = parseUnit(measureStr);
  }

  // 2. Parse Quantity (and Range)
  // Check for range "X-Y" or "X - Y"
  // Ensure the dash is surrounded by numbers or spaces, not inside a word
  if (cleanStr.includes("-")) {
    const parts = cleanStr.split("-");
    if (parts.length === 2) {
      const min = parseNumericValue(parts[0]);
      const max = parseNumericValue(parts[1]);

      if (min !== null && max !== null) {
        result.quantity = min;
        result.quantityMax = max;
        return result;
      }
    }
  }

  // Single Value
  result.quantity = parseNumericValue(cleanStr);

  return result;
}

// ... parseUnit function remains, but I need to make sure I don't delete it or duplicates
// Wait, I am replacing the block including parseQuantity usage.

// I need to be careful with where parseUnit is defined.
// It was defined AFTER parseQuantity in original file.
// In my replacement below, I am REPLACING parseQuantity and the loop usage?
// No, the instruction says replace lines 56 and loop?
// I will split this into two replacements if possible, or one big one.

// Let's replace parseQuantity first with helper functions.
// Then update the loop.

// Actually I'll DO IT ALL in one replace if I target carefully.
// But parseUnit is below parseQuantity.

// Let's Replace parseQuantity with the new helpers.
// And update the loop.

// First Replace: remove parseQuantity and insert helpers.
// The chunk below targets parseQuantity function block.

// Second Replace: update the loop usage.

/**
 * Check if a measure string indicates a garnish
 */
function isGarnishMeasure(measureStr: string | null): boolean {
  if (!measureStr) return false;
  const lower = measureStr.toLowerCase();
  return lower.includes("garnish");
}

/**
 * Extract unit from measurement string
 */
function parseUnit(measureStr: string | null): string {
  if (!measureStr) return "piece";

  const lower = measureStr.toLowerCase();

  // Check for garnish first
  if (isGarnishMeasure(measureStr)) return "garnish";

  if (lower.includes("ml")) return "ml";
  if (lower.includes("cl")) return "cl";
  if (lower.includes("oz")) return "oz";
  if (lower.includes("tsp") || lower.includes("teaspoon")) return "tsp";
  if (lower.includes("tbsp") || lower.includes("tablespoon")) return "tbsp";
  if (lower.includes("dash")) return "dash";
  if (lower.includes("drop")) return "drop";
  if (lower.includes("cup")) return "cup";
  if (lower.includes("splash")) return "splash";
  if (lower.includes("pinch")) return "pinch";
  if (lower.includes("pint")) return "pint";
  if (lower.includes("shot")) return "shot";
  if (lower.includes("part")) return "part";
  if (lower.includes("bottle")) return "bottle";
  if (lower.includes("can")) return "can";
  if (
    lower.includes("slice") ||
    lower.includes("wedge") ||
    lower.includes("peel")
  )
    return "piece";

  return "piece"; // Default fallback
}

// ============================================
// Data Import
// ============================================

/**
 * Import raw cocktail data into the IndexedDB database
 */
export async function importCocktailData(): Promise<void> {
  // Maps to track IDs
  const categoryMap = new Map<string, number>();
  const ingredientMap = new Map<string, number>();
  // Counter for dynamically created ingredients (not in detailed JSON)
  // Start at 10000 to avoid conflicts with source IDs (max is 579)
  let nextDynamicIngredientId = 10000;

  await db.transaction(
    "rw",
    [db.categories, db.cocktails, db.ingredients, db.recipeIngredients],
    async () => {
      // 1. Process Categories
      const uniqueCategories = new Set<string>();
      cocktailsData.forEach((c) => {
        if (c.strCategory) uniqueCategories.add(c.strCategory);
      });

      for (const catName of uniqueCategories) {
        const id = (await db.categories.add({
          name: catName,
          slug: slugify(catName),
        })) as number;
        categoryMap.set(catName, id);
      }

      // 2. Process Detailed Ingredients First
      // We prioritize these because they have descriptions and ABV
      for (const detailedIng of ingredientsData) {
        if (!detailedIng.strIngredient) continue;

        const name = detailedIng.strIngredient;
        const normalized = normalizeIngredientName(name);

        // Check image existence
        // Expecting keys like '/src/assets/images/ingredients/1.jpg'
        // detailedIng.idIngredient
        let imageUrl = undefined;
        const imageKey = Object.keys(ingredientImages).find((k) =>
          k.includes(`/${detailedIng.idIngredient}.jpg`)
        );
        if (imageKey) {
          const mod = ingredientImages[imageKey] as any;
          imageUrl = mod.default || mod;
        }

        // Use the ID from the JSON source file
        const id = parseInt(detailedIng.idIngredient, 10);

        await db.ingredients.put({
          id: id, // Explicitly set ID from source
          name: name,
          normalizedName: normalized,
          description: detailedIng.strDescription || undefined,
          type: detailedIng.strType || undefined,
          isAlcoholic: detailedIng.strAlcohol === "Yes",
          abv: detailedIng.strABV ? parseFloat(detailedIng.strABV) : undefined,
          imageUrl: imageUrl,
        });

        ingredientMap.set(normalized, id);
      }

      // 3. Process Cocktails
      for (const rawCocktail of cocktailsData) {
        if (!rawCocktail.strDrink) continue;

        const catId = categoryMap.get(rawCocktail.strCategory);
        if (!catId) continue; // Should not happen

        // Resolve Image
        let imageUrl = rawCocktail.strDrinkThumb || undefined;
        // Try local image
        const localImageKey = Object.keys(cocktailImages).find((k) =>
          k.includes(`/${rawCocktail.idDrink}.jpg`)
        );
        if (localImageKey) {
          const mod = cocktailImages[localImageKey] as any;
          imageUrl = mod.default || mod;
        }

        // Add Cocktail
        // Use the ID from the JSON source file
        const cocktailId = parseInt(rawCocktail.idDrink, 10);

        await db.cocktails.put({
          id: cocktailId, // Explicitly set ID from source
          name: rawCocktail.strDrink,
          slug: slugify(rawCocktail.strDrink),
          categoryId: catId,
          method: rawCocktail.strInstructions, // defaulting to EN instructions
          garnish: undefined, // data doesn't explicitly have garnish field, usually in instructions
          imageUrl: imageUrl,
          glass: rawCocktail.strGlass || undefined,
          tags: rawCocktail.strTags
            ? rawCocktail.strTags.split(",").map((t) => t.trim())
            : [],
          isAlcoholic: rawCocktail.strAlcoholic === "Alcoholic",
          ibaCategory: rawCocktail.strIBA || undefined,
        });

        // Process Ingredients
        // strIngredient1 ... strIngredient15
        for (let i = 1; i <= 15; i++) {
          const ingName = rawCocktail[`strIngredient${i}`];
          const measure = rawCocktail[`strMeasure${i}`];

          if (!ingName) continue;

          const normalizedIng = normalizeIngredientName(ingName);
          let ingId = ingredientMap.get(normalizedIng);

          // If ingredient not found from detailed list, this indicates a data inconsistency
          // All ingredients should be in the source JSON
          if (!ingId) {
            console.warn(
              `Data inconsistency: Ingredient "${ingName}" in cocktail "${rawCocktail.strDrink}" not found in ingredients_detailed.json`
            );
            // Create it anyway to maintain data integrity for the cocktail
            ingId = nextDynamicIngredientId++;
            await db.ingredients.put({
              id: ingId, // Explicitly set ID to avoid conflicts with source IDs
              name: ingName,
              normalizedName: normalizedIng,
              description: undefined,
              type: undefined,
              isAlcoholic: undefined, // unknown
            });
            ingredientMap.set(normalizedIng, ingId);
          }

          // Add Recipe Ingredient
          // Add Recipe Ingredient
          const parsedMeasure = parseMeasure(measure || null);

          await db.recipeIngredients.add({
            cocktailId,
            ingredientId: ingId,
            direction: measure || "", // Original text
            quantity: parsedMeasure.quantity,
            quantityMax: parsedMeasure.quantityMax,
            unit: parsedMeasure.unit,
            sortOrder: i,
            isGarnish: isGarnishMeasure(measure || null),
          });
        }
      }
    }
  );
}

// Data version - Increment this when JSON data changes to force client-side DB refresh
const DATA_VERSION = "2.0"; // Updated to use source IDs from JSON files

/**
 * Initialize the database with cocktail data if not already populated
 */
export async function initializeCocktailData(forceRefresh = false): Promise<{
  success: boolean;
  message: string;
  stats?: {
    categories: number;
    cocktails: number;
    ingredients: number;
  };
}> {
  try {
    // Check stored data version
    const meta = await db.metadata.get("dataVersion");
    const storedVersion = meta?.value;
    const isOutdated = storedVersion !== DATA_VERSION;
    const isPopulated = await isDatabasePopulated();

    // Check if already populated and up to date
    if (!forceRefresh && !isOutdated && isPopulated) {
      const [categories, cocktails, ingredients] = await Promise.all([
        db.categories.count(),
        db.cocktails.count(),
        db.ingredients.count(),
      ]);

      return {
        success: true,
        message: "Database already populated",
        stats: { categories, cocktails, ingredients },
      };
    }

    // Clear existing data if forcing refresh or outdated
    if (forceRefresh || isOutdated || !isPopulated) {
      if (isOutdated) {
        console.log(
          `Updating database from ${storedVersion} to ${DATA_VERSION}`
        );
      }

      await clearDatabase();
      await importCocktailData();

      // Update version
      await db.metadata.put({ key: "dataVersion", value: DATA_VERSION });
    }

    const [categories, cocktails, ingredients] = await Promise.all([
      db.categories.count(),
      db.cocktails.count(),
      db.ingredients.count(),
    ]);

    return {
      success: true,
      message: `Imported ${cocktails} cocktails with ${ingredients} ingredients in ${categories} categories`,
      stats: { categories, cocktails, ingredients },
    };
  } catch (error) {
    console.error("Failed to initialize cocktail data:", error);

    // Check if this is the specific upgrade error for changing primary keys
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isUpgradeError =
      errorMessage.includes("UpgradeError") &&
      errorMessage.includes("primary key");

    if (isUpgradeError) {
      console.warn(
        "[MixologyMatcher] Detected incompatible schema upgrade. Wiping database and reinitializing..."
      );

      try {
        // Wipe the entire database
        await wipeDatabase();

        // Reload the page to reinitialize with a fresh database
        // This is the cleanest approach as it creates a new database instance
        window.location.reload();

        // Return a pending state (though reload will happen first)
        return {
          success: true,
          message:
            "Database incompatibility detected. Reloading to reinitialize...",
        };
      } catch (wipeError) {
        console.error("[MixologyMatcher] Failed to wipe database:", wipeError);
        return {
          success: false,
          message:
            "Failed to recover from database upgrade error. Please clear your browser data and reload.",
        };
      }
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

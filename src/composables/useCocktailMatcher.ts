/**
 * Composable for cocktail matching logic
 * Finds cocktails based on available ingredients
 */

import { computed, type Ref } from "vue";
import { db } from "@/services/database";
import type {
  CocktailWithDetails,
  CocktailMatch,
  RecipeIngredientWithDetails,
  Ingredient,
  SelectedIngredient,
} from "@/types";

/**
 * Get full cocktail details including category and ingredients
 */
export async function getCocktailWithDetails(
  cocktailId: number
): Promise<CocktailWithDetails | null> {
  const cocktail = await db.cocktails.get(cocktailId);
  if (!cocktail) return null;

  const category = await db.categories.get(cocktail.categoryId);
  if (!category) return null;

  const recipeIngredients = await db.recipeIngredients
    .where("cocktailId")
    .equals(cocktailId)
    .sortBy("sortOrder");

  const ingredientsWithDetails: RecipeIngredientWithDetails[] =
    await Promise.all(
      recipeIngredients.map(async (ri) => {
        const ingredient = await db.ingredients.get(ri.ingredientId);
        return {
          ...ri,
          ingredient: ingredient!,
        };
      })
    );

  return {
    ...cocktail,
    category,
    ingredients: ingredientsWithDetails,
  };
}

/**
 * Get all cocktails with their full details
 */
export async function getAllCocktailsWithDetails(): Promise<
  CocktailWithDetails[]
> {
  const cocktails = await db.cocktails.toArray();
  const results: CocktailWithDetails[] = [];

  for (const cocktail of cocktails) {
    const detailed = await getCocktailWithDetails(cocktail.id!);
    if (detailed) {
      results.push(detailed);
    }
  }

  return results;
}

/**
 * Match mode for cocktail search
 */
export type MatchMode = "all" | "any";

/**
 * Find cocktails that can be made with the given ingredients
 */
export async function findMatchingCocktails(
  selectedIngredientIds: number[],
  minMatchPercentage = 0,
  matchMode: MatchMode = "all",
  allowSubstitution = true
): Promise<CocktailMatch[]> {
  if (selectedIngredientIds.length === 0) {
    return [];
  }

  // Build a map of ingredient ID -> which selected ingredient(s) can cover it
  // This allows substitution while tracking that one selection = one match
  const ingredientCoverageMap = new Map<number, number[]>();

  if (allowSubstitution) {
    // For each selected ingredient, find all IDs it can substitute for
    for (const selId of selectedIngredientIds) {
      const selIngredient = await db.ingredients.get(selId);

      // Always covers itself
      if (!ingredientCoverageMap.has(selId)) {
        ingredientCoverageMap.set(selId, []);
      }
      ingredientCoverageMap.get(selId)!.push(selId);

      // If it has a type that allows substitution, find all same-type ingredients
      if (selIngredient?.type) {
        const substitutionTypes = [
          "Vodka",
          "Whisky",
          "Whiskey",
          "Rum",
          "Gin",
          "Tequila",
          "Brandy",
          "Liqueur",
        ];

        const matchingType = substitutionTypes.find(
          (t) => selIngredient.type?.toLowerCase() === t.toLowerCase()
        );

        if (matchingType) {
          const sameTypeIngredients = await db.ingredients
            .filter(
              (ing) => ing.type?.toLowerCase() === matchingType.toLowerCase()
            )
            .toArray();

          for (const ing of sameTypeIngredients) {
            if (ing.id) {
              if (!ingredientCoverageMap.has(ing.id)) {
                ingredientCoverageMap.set(ing.id, []);
              }
              ingredientCoverageMap.get(ing.id)!.push(selId);
            }
          }
        }
      }
    }
  } else {
    // No substitution - each selected ingredient only covers itself
    for (const selId of selectedIngredientIds) {
      ingredientCoverageMap.set(selId, [selId]);
    }
  }

  const allCocktails = await getAllCocktailsWithDetails();
  const matches: CocktailMatch[] = [];

  for (const cocktail of allCocktails) {
    const matchedIngredients: Ingredient[] = [];
    const missingIngredients: Ingredient[] = [];

    // Track which selected ingredients have been "used" for this cocktail
    // Each selected ingredient can only cover ONE recipe requirement
    const usedSelectedIds = new Set<number>();

    for (const recipeIngredient of cocktail.ingredients) {
      const coveringSelections = ingredientCoverageMap.get(
        recipeIngredient.ingredientId
      );

      if (coveringSelections && coveringSelections.length > 0) {
        // Find a covering selection that hasn't been used yet
        const availableCoverer = coveringSelections.find(
          (id) => !usedSelectedIds.has(id)
        );

        if (availableCoverer !== undefined) {
          usedSelectedIds.add(availableCoverer);
          matchedIngredients.push(recipeIngredient.ingredient);
        } else {
          // All possible coverers are already used - this is a missing ingredient
          missingIngredients.push(recipeIngredient.ingredient);
        }
      } else {
        missingIngredients.push(recipeIngredient.ingredient);
      }
    }

    // Calculate match percentage based on unique matched ingredients
    const totalRequired = cocktail.ingredients.length;
    const matchPercentage =
      totalRequired > 0 ? (matchedIngredients.length / totalRequired) * 100 : 0;

    // Determine if this cocktail should be included based on match mode
    let includeMatch = false;

    if (matchMode === "all") {
      // "All" mode: Check if each selected ingredient covers at least one recipe ingredient
      // A drink is valid if every selected ingredient was used to cover something
      const hasAllSelected = selectedIngredientIds.every((selId) => {
        // Check if this selected ingredient can cover any recipe ingredient
        return cocktail.ingredients.some((ri) => {
          const coverers = ingredientCoverageMap.get(ri.ingredientId);
          return coverers && coverers.includes(selId);
        });
      });
      includeMatch = hasAllSelected && matchPercentage >= minMatchPercentage;
    } else {
      // "Any" mode: Must have at least one matching ingredient
      includeMatch =
        matchedIngredients.length > 0 && matchPercentage >= minMatchPercentage;
    }

    if (includeMatch) {
      matches.push({
        cocktail,
        matchedIngredients,
        missingIngredients,
        matchPercentage,
      });
    }
  }

  // Sort by match percentage (highest first), then alphabetically
  return matches.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });
}

/**
 * Search for ingredients by name or type (fuzzy matching)
 */
export async function searchIngredients(query: string): Promise<Ingredient[]> {
  if (!query.trim()) {
    return db.ingredients.orderBy("name").limit(20).toArray();
  }

  const normalizedQuery = query.toLowerCase().trim();

  return db.ingredients
    .filter(
      (ing) =>
        ing.normalizedName.includes(normalizedQuery) ||
        (ing.type?.toLowerCase().includes(normalizedQuery) ?? false)
    )
    .limit(30)
    .toArray();
}

/**
 * Get all unique ingredients
 */
export async function getAllIngredients(): Promise<Ingredient[]> {
  return db.ingredients.orderBy("name").toArray();
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  return db.categories.orderBy("name").toArray();
}

/**
 * Get cocktails by category
 */
export async function getCocktailsByCategory(
  categoryId: number
): Promise<CocktailWithDetails[]> {
  const cocktails = await db.cocktails
    .where("categoryId")
    .equals(categoryId)
    .toArray();

  const results: CocktailWithDetails[] = [];

  for (const cocktail of cocktails) {
    const detailed = await getCocktailWithDetails(cocktail.id!);
    if (detailed) {
      results.push(detailed);
    }
  }

  return results;
}

/**
 * Composable hook for cocktail matching with reactive state
 */
export function useCocktailMatcher(
  selectedIngredients: Ref<SelectedIngredient[]>
) {
  const selectedIds = computed(() =>
    selectedIngredients.value.map((i) => i.id)
  );

  return {
    selectedIds,

    async getMatches(minMatch = 0): Promise<CocktailMatch[]> {
      return findMatchingCocktails(selectedIds.value, minMatch);
    },

    async getPerfectMatches(): Promise<CocktailMatch[]> {
      return findMatchingCocktails(selectedIds.value, 100);
    },

    async getPartialMatches(minPercentage = 50): Promise<CocktailMatch[]> {
      const matches = await findMatchingCocktails(
        selectedIds.value,
        minPercentage
      );
      return matches.filter((m) => m.matchPercentage < 100);
    },
  };
}

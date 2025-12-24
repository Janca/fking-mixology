/**
 * Composable for prep mode functionality
 * Handles ingredient checklist and party mode scaling
 */

import { ref, computed, watch, type Ref } from "vue";
import type { CocktailWithDetails, RecipeIngredientWithDetails } from "@/types";
import {
  simplifyMeasure,
  toFraction,
  convertVolume,
  isVolumeUnit,
  isDryIngredient,
  isCountableIngredient,
} from "@/utils/unitConversions";

export interface PrepModeOptions {
  initialScale?: number;
  maxScale?: number;
  minScale?: number;
}

export function usePrepMode(
  cocktail: Ref<CocktailWithDetails | null>,
  options: PrepModeOptions = {}
) {
  const { initialScale = 1, maxScale = 10, minScale = 1 } = options;

  // State
  const isActive = ref(false);
  const scale = ref(initialScale);
  const completedIngredientIds = ref<Set<number>>(new Set());

  // Reset completed ingredients when cocktail changes
  watch(cocktail, () => {
    completedIngredientIds.value = new Set();
    scale.value = initialScale;
  });

  // Computed
  const totalIngredients = computed(
    () => cocktail.value?.ingredients.length ?? 0
  );

  const completedCount = computed(() => completedIngredientIds.value.size);

  const progressPercentage = computed(() =>
    totalIngredients.value > 0
      ? (completedCount.value / totalIngredients.value) * 100
      : 0
  );

  const isComplete = computed(
    () =>
      totalIngredients.value > 0 &&
      completedCount.value === totalIngredients.value
  );

  const scaledIngredients = computed(() => {
    if (!cocktail.value) return [] as RecipeIngredientWithDetails[];

    return cocktail.value.ingredients.map((ing) => ({
      ...ing,
      scaledQuantity:
        ing.quantity !== null ? ing.quantity * scale.value : undefined,
    }));
  });

  // Actions
  function toggleActive() {
    isActive.value = !isActive.value;
    if (!isActive.value) {
      completedIngredientIds.value = new Set();
    }
  }

  function toggleIngredient(ingredientId: number) {
    const newSet = new Set(completedIngredientIds.value);
    if (newSet.has(ingredientId)) {
      newSet.delete(ingredientId);
    } else {
      newSet.add(ingredientId);
    }
    completedIngredientIds.value = newSet;
  }

  function isIngredientComplete(ingredientId: number): boolean {
    return completedIngredientIds.value.has(ingredientId);
  }

  function setScale(newScale: number) {
    scale.value = Math.max(minScale, Math.min(maxScale, newScale));
  }

  function incrementScale() {
    setScale(scale.value + 1);
  }

  function decrementScale() {
    setScale(scale.value - 1);
  }

  function reset() {
    isActive.value = false;
    completedIngredientIds.value = new Set();
    scale.value = initialScale;
  }

  return {
    // State
    isActive,
    scale,
    completedIngredientIds,

    // Computed
    totalIngredients,
    completedCount,
    progressPercentage,
    isComplete,
    scaledIngredients,

    // Actions
    toggleActive,
    toggleIngredient,
    isIngredientComplete,
    setScale,
    incrementScale,
    decrementScale,
    reset,
  };
}

/**
 * Format a quantity with appropriate precision and unit
 */
export function formatQuantity(
  quantity: number | null,
  unit: string,
  scale = 1,
  quantityMax: number | null = null,
  ingredientName?: string
): string {
  if (quantity === null) {
    if (unit.toLowerCase() === "juice of") return "Juice of";
    return unit;
  }

  // Detect special units
  if (unit.toLowerCase() === "juice of") {
    // scale the number but don't simplify unit (it's abstract)
    // format as fraction or int
    const val = quantity * scale;
    // juice of 1.5 -> "Juice of 1 1/2"
    return `Juice of ${toFraction(val)}`;
  }

  let min = quantity * scale;
  let max = quantityMax !== null ? quantityMax * scale : null;
  let currentUnit = unit;

  // Identify Ingredient Properties
  const isDry = ingredientName ? isDryIngredient(ingredientName) : false;
  const isCountable = ingredientName
    ? isCountableIngredient(ingredientName)
    : false;

  // Handle 'piece' unit (fallback)
  if (currentUnit.toLowerCase() === "piece") {
    const minStr = toFraction(min);
    const maxStr = max !== null ? toFraction(max) : null;

    // If countable (e.g. 2 Lime), show just number. "2 Lime"
    if (isCountable) {
      if (maxStr) return `${minStr}-${maxStr}`;
      return minStr;
    }

    // If not countable (e.g. 2/3 piece Vodka -> 2/3 part Vodka)
    // Or if unknown type, fallback to "part" if fraction?
    // "2/3 part"
    const suffix = "part";
    if (maxStr) return `${minStr}-${maxStr} ${suffix}`;
    return `${minStr} ${suffix}`;
  }

  // Attempt to simplify unit based on the average value
  const avg = max !== null ? (min + max) / 2 : min;

  // Simplify (pass isDry)
  const simplified = simplifyMeasure(avg, currentUnit, isDry);

  if (
    simplified.unit !== currentUnit.toLowerCase() &&
    simplified.unit !== currentUnit
  ) {
    if (isVolumeUnit(currentUnit) && isVolumeUnit(simplified.unit)) {
      min = convertVolume(min, currentUnit, simplified.unit as any);
      if (max !== null) {
        max = convertVolume(max, currentUnit, simplified.unit as any);
      }
      currentUnit = simplified.unit;
    } else {
      // Fallback if not generic volume conversion
      if (max === null) {
        min = simplified.value;
        currentUnit = simplified.unit;
      }
    }
  }

  // Format numbers
  const minStr = toFraction(min);

  if (max !== null) {
    const maxStr = toFraction(max);
    return `${minStr}-${maxStr} ${currentUnit}`;
  }

  return `${minStr} ${currentUnit}`;
}

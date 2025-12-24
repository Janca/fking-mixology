/**
 * Cocktails store
 * Manages cocktail matching results and active recipe
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  findMatchingCocktails,
  getCocktailWithDetails,
  getAllCocktailsWithDetails,
  type MatchMode,
} from "@/composables/useCocktailMatcher";
import type { CocktailWithDetails, CocktailMatch } from "@/types";

export const useCocktailsStore = defineStore("cocktails", () => {
  // ============================================
  // State
  // ============================================

  const matches = ref<CocktailMatch[]>([]);
  const pantryMatches = ref<CocktailMatch[]>([]);
  const allCocktails = ref<CocktailWithDetails[]>([]);
  const activeCocktail = ref<CocktailWithDetails | null>(null);
  const isMatchingInProgress = ref(false);
  const isLoadingDetails = ref(false);

  // Search settings
  const matchMode = ref<MatchMode>("all");
  const allowSubstitution = ref(true);

  // ============================================
  // Computed
  // ============================================

  const hasMatches = computed(() => matches.value.length > 0);

  const perfectMatches = computed(() =>
    matches.value.filter((m) => m.matchPercentage === 100)
  );

  const partialMatches = computed(() =>
    matches.value.filter(
      (m) => m.matchPercentage > 0 && m.matchPercentage < 100
    )
  );

  const hasActiveCocktail = computed(() => activeCocktail.value !== null);

  // ============================================
  // Actions
  // ============================================

  async function loadAllCocktails() {
    allCocktails.value = await getAllCocktailsWithDetails();
  }

  async function findMatches(ingredientIds: number[], minMatch = 0) {
    isMatchingInProgress.value = true;

    try {
      matches.value = await findMatchingCocktails(
        ingredientIds,
        minMatch,
        matchMode.value,
        allowSubstitution.value
      );
    } finally {
      isMatchingInProgress.value = false;
    }
  }

  async function findPantryMatches(ingredientIds: number[], minMatch = 0) {
    // Pantry matches always use default settings (all match, substitution allowed)
    pantryMatches.value = await findMatchingCocktails(
      ingredientIds,
      minMatch,
      "all",
      true
    );
  }

  function setMatchMode(mode: MatchMode) {
    matchMode.value = mode;
  }

  function setAllowSubstitution(allow: boolean) {
    allowSubstitution.value = allow;
  }

  async function selectCocktail(cocktailId: number) {
    isLoadingDetails.value = true;

    try {
      activeCocktail.value = await getCocktailWithDetails(cocktailId);
    } finally {
      isLoadingDetails.value = false;
    }
  }

  function clearActiveCocktail() {
    activeCocktail.value = null;
  }

  function clearMatches() {
    matches.value = [];
  }

  return {
    // State
    matches,
    pantryMatches, // New state
    allCocktails,
    activeCocktail,
    isMatchingInProgress,
    isLoadingDetails,
    matchMode,
    allowSubstitution,

    // Computed
    hasMatches,
    perfectMatches,
    partialMatches,
    hasActiveCocktail,
    // Add computed for pantry matches if needed, or just access ref directly

    // Actions
    loadAllCocktails,
    findMatches,
    findPantryMatches, // New action
    selectCocktail,
    clearActiveCocktail,
    clearMatches,
    setMatchMode,
    setAllowSubstitution,
  };
});

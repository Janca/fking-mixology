/**
 * Ingredients store
 * Manages selected ingredients for cocktail matching
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  searchIngredients,
  getAllIngredients,
} from "@/composables/useCocktailMatcher";
import type { Ingredient, SelectedIngredient } from "@/types";

export const useIngredientsStore = defineStore("ingredients", () => {
  // ============================================
  // State
  // ============================================

  const selectedIngredients = ref<SelectedIngredient[]>([]);
  const searchQuery = ref("");
  const searchResults = ref<Ingredient[]>([]);
  const isSearching = ref(false);
  const allIngredients = ref<Ingredient[]>([]);

  // ============================================
  // Computed
  // ============================================

  const selectedIds = computed(() =>
    selectedIngredients.value.map((i) => i.id)
  );

  const hasSelection = computed(() => selectedIngredients.value.length > 0);

  const selectionCount = computed(() => selectedIngredients.value.length);

  // Filter out already selected ingredients from search results
  const filteredSearchResults = computed(() =>
    searchResults.value.filter((i) => !selectedIds.value.includes(i.id!))
  );

  // ============================================
  // Actions
  // ============================================

  async function loadAllIngredients() {
    allIngredients.value = await getAllIngredients();
  }

  async function search(query: string) {
    searchQuery.value = query;
    isSearching.value = true;

    try {
      searchResults.value = await searchIngredients(query);
    } finally {
      isSearching.value = false;
    }
  }

  function addIngredient(ingredient: Ingredient) {
    if (ingredient.id && !selectedIds.value.includes(ingredient.id)) {
      selectedIngredients.value = [
        ...selectedIngredients.value,
        { id: ingredient.id, name: ingredient.name },
      ];
    }
  }

  function removeIngredient(ingredientId: number) {
    selectedIngredients.value = selectedIngredients.value.filter(
      (i) => i.id !== ingredientId
    );
  }

  function toggleIngredient(ingredient: Ingredient) {
    if (ingredient.id && selectedIds.value.includes(ingredient.id)) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient);
    }
  }

  function clearSelection() {
    selectedIngredients.value = [];
  }

  function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
  }

  function isSelected(ingredientId: number): boolean {
    return selectedIds.value.includes(ingredientId);
  }

  /**
   * Load and select specific ingredients by their IDs
   * Used for restoring selection from URL query strings
   */
  async function loadIngredientsById(ids: number[]) {
    const { db } = await import("@/services/database");

    // Process all lookups in parallel
    const ingredients = await Promise.all(
      ids.map((id) => db.ingredients.get(id))
    );

    // Apply valid results to state synchronously to minimize race windows
    const newIngredients: SelectedIngredient[] = [];

    for (const ingredient of ingredients) {
      if (
        ingredient &&
        ingredient.id &&
        !selectedIds.value.includes(ingredient.id) &&
        !newIngredients.some((i) => i.id === ingredient.id)
      ) {
        newIngredients.push({
          id: ingredient.id,
          name: ingredient.name,
        });
      }
    }

    if (newIngredients.length > 0) {
      selectedIngredients.value = [
        ...selectedIngredients.value,
        ...newIngredients,
      ];
    }
  }

  return {
    // State
    selectedIngredients,
    searchQuery,
    searchResults,
    isSearching,
    allIngredients,

    // Computed
    selectedIds,
    hasSelection,
    selectionCount,
    filteredSearchResults,

    // Actions
    loadAllIngredients,
    search,
    addIngredient,
    removeIngredient,
    toggleIngredient,
    clearSelection,
    clearSearch,
    isSelected,
    loadIngredientsById,
  };
});

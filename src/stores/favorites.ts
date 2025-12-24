/**
 * Favorites Store
 * Manages user's favorite cocktails
 */

import { ref } from "vue";
import { defineStore } from "pinia";
import { db } from "@/services/database";
import { getCocktailWithDetails } from "@/composables/useCocktailMatcher";
import { useAchievementsStore } from "./achievements";
import { useToastStore } from "./toast";
import type { Favorite, CocktailWithDetails } from "@/types";

export const useFavoritesStore = defineStore("favorites", () => {
  const achievementsStore = useAchievementsStore();
  // ============================================
  // State
  // ============================================

  const favorites = ref<Favorite[]>([]);
  const favoriteCocktailIds = ref<Set<number>>(new Set());
  const favoriteCocktailsDetails = ref<CocktailWithDetails[]>([]);
  const isLoading = ref(false);

  // ============================================
  // Actions
  // ============================================

  /**
   * Load favorites from database
   */
  async function loadFavorites() {
    isLoading.value = true;
    try {
      favorites.value = await db.favorites.toArray();
      favoriteCocktailIds.value = new Set(
        favorites.value.map((f) => f.cocktailId)
      );
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load full details for all favorite cocktails
   */
  async function loadDetails() {
    await loadFavorites();
    isLoading.value = true;

    // Load IDs that we don't have yet (if caching strategies were used, but we just reload for simplicity)
    const cocktails: CocktailWithDetails[] = [];

    // Sort favorites just in case
    const sortedFavs = [...favorites.value].sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
    );

    for (const fav of sortedFavs) {
      const details = await getCocktailWithDetails(fav.cocktailId);
      if (details) {
        cocktails.push(details);
      }
    }

    favoriteCocktailsDetails.value = cocktails;
    isLoading.value = false;
  }

  /**
   * Toggle favorite status for a cocktail
   */
  async function toggleFavorite(cocktailId: number) {
    if (favoriteCocktailIds.value.has(cocktailId)) {
      await removeFavorite(cocktailId);
    } else {
      await addFavorite(cocktailId);
    }
  }

  async function addFavorite(cocktailId: number) {
    // Check if already exists in DB to be safe (though Set check handles UI state)
    const existing = await db.favorites
      .where("cocktailId")
      .equals(cocktailId)
      .first();
    if (existing) return;

    const favorite: Favorite = {
      cocktailId,
      addedAt: new Date(),
    };

    const id = await db.favorites.add(favorite);
    favorite.id = id as number;

    favorites.value.push(favorite);
    favoriteCocktailIds.value.add(cocktailId);

    achievementsStore.trackEvent("hearts_given");

    useToastStore().addToast({
      title: "Favorited",
      message: "Added to your favorites collection",
      type: "success",
      duration: 3,
    });
  }

  async function removeFavorite(cocktailId: number) {
    const favorite = favorites.value.find((f) => f.cocktailId === cocktailId);
    if (!favorite || !favorite.id) return;

    await db.favorites.delete(favorite.id);

    favorites.value = favorites.value.filter(
      (f) => f.cocktailId !== cocktailId
    );
    favoriteCocktailIds.value.delete(cocktailId);
    favoriteCocktailsDetails.value = favoriteCocktailsDetails.value.filter(
      (c) => c.id !== cocktailId
    );

    useToastStore().addToast({
      title: "Removed",
      message: "Removed from favorites",
      duration: 3,
    });
  }

  /**
   * Check if a cocktail is favorited (synchronous check against state)
   */
  function isFavorite(cocktailId: number): boolean {
    return favoriteCocktailIds.value.has(cocktailId);
  }

  return {
    favorites,
    favoriteCocktailIds,
    favoriteCocktailsDetails,
    isLoading,
    loadFavorites,
    loadDetails,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
});

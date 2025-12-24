/**
 * Main application store
 * Handles app-wide state and initialization
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { initializeCocktailData, getDatabaseStats } from "@/services";
import type { AppSettings, ViewMode } from "@/types";

export const useAppStore = defineStore("app", () => {
  // ============================================
  // State
  // ============================================

  const isLoading = ref(true);
  const isDataReady = ref(false);
  const error = ref<string | null>(null);
  const currentView = ref<ViewMode>("search");

  const settings = ref<AppSettings>({
    preferredUnit: "ml",
    theme: "dark",
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  });

  const stats = ref({
    categories: 0,
    cocktails: 0,
    ingredients: 0,
    recipeIngredients: 0,
  });

  // ============================================
  // Computed
  // ============================================

  const isReady = computed(() => !isLoading.value && isDataReady.value);

  // ============================================
  // Actions
  // ============================================

  async function initialize(forceRefresh = false) {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await initializeCocktailData(forceRefresh);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Load stats
      const dbStats = await getDatabaseStats();
      stats.value = dbStats;

      isDataReady.value = true;

      console.log("[MixologyMatcher] Data initialized:", result.message);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to initialize data";
      console.error("[MixologyMatcher] Initialization error:", err);
    } finally {
      isLoading.value = false;
    }
  }

  function setView(view: ViewMode) {
    currentView.value = view;
  }

  function updateSettings(updates: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...updates };

    // Persist to localStorage
    localStorage.setItem("mixology-settings", JSON.stringify(settings.value));
  }

  function loadSettings() {
    const saved = localStorage.getItem("mixology-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        settings.value = { ...settings.value, ...parsed };
      } catch (e) {
        console.warn("Failed to load saved settings:", e);
      }
    }
  }

  // ============================================
  // Initialization
  // ============================================

  // Load settings on store creation
  loadSettings();

  return {
    // State
    isLoading,
    isDataReady,
    error,
    currentView,
    settings,
    stats,

    // Computed
    isReady,

    // Actions
    initialize,
    setView,
    updateSettings,
    loadSettings,
  };
});

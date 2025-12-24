import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useIngredientsStore } from "@/stores/ingredients";
import { useCocktailsStore } from "@/stores/cocktails";
import { useNavigationStore } from "@/stores/navigation";

export function useUrlSync() {
  const router = useRouter();
  const route = useRoute();
  const ingredientsStore = useIngredientsStore();
  const cocktailsStore = useCocktailsStore();
  const navigationStore = useNavigationStore();

  const isSyncingFromUrl = ref(false);

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  function updateUrlQuery() {
    const ids = ingredientsStore.selectedIds;
    // Ensure unique IDs in URL
    const uniqueIds = Array.from(new Set(ids));

    if (ids.length > 0) {
      const query: Record<string, string> = {
        ingredients: uniqueIds.join(","),
      };
      // Only add mode if not the default ("all")
      if (cocktailsStore.matchMode !== "all") {
        query.mode = cocktailsStore.matchMode;
      }
      // Add exact param if substitution is disabled (default is enabled)
      if (!cocktailsStore.allowSubstitution) {
        query.exact = "true";
      }
      router.replace({ query });
    } else {
      router.replace({ query: {} });
    }
  }

  async function syncFromUrl() {
    isSyncingFromUrl.value = true;
    try {
      // 1. Sync Match Mode
      const modeParam = route.query.mode;
      // Default to 'all' if missing or invalid
      const targetMode =
        modeParam === "any" || modeParam === "all" ? modeParam : "all";
      if (cocktailsStore.matchMode !== targetMode) {
        cocktailsStore.setMatchMode(targetMode);
      }

      // 2. Sync Substitution (exact=true means allowSubstitution=false)
      const exactParam = route.query.exact;
      const targetAllowSub = exactParam !== "true";
      if (cocktailsStore.allowSubstitution !== targetAllowSub) {
        cocktailsStore.setAllowSubstitution(targetAllowSub);
      }

      // 3. Sync Ingredients
      const ingredientsParam = route.query.ingredients;
      let targetIds: number[] = [];

      if (ingredientsParam) {
        // Handle potential array or string
        const paramStr = Array.isArray(ingredientsParam)
          ? ingredientsParam[0]
          : ingredientsParam;
        if (paramStr && typeof paramStr === "string") {
          targetIds = paramStr
            .split(",")
            .map((id) => parseInt(id, 10))
            .filter(
              (id, index, self) => !isNaN(id) && self.indexOf(id) === index
            );
        }
      }

      // Compare targetIds with current store state
      if (!arraysEqual(ingredientsStore.selectedIds, targetIds)) {
        if (targetIds.length === 0) {
          ingredientsStore.clearSelection();
          cocktailsStore.clearMatches();
        } else {
          // Clear existing first to ensure we match URL exactly (no merging)
          ingredientsStore.clearSelection();
          await ingredientsStore.loadIngredientsById(targetIds);
          // Initial search trigger
          cocktailsStore.findMatches(ingredientsStore.selectedIds, 0);
        }
      }
    } finally {
      isSyncingFromUrl.value = false;
    }
  }

  // Watch selection changes (Store -> URL)
  watch(
    () => ingredientsStore.selectedIds,
    async (ids) => {
      // Clear scroll target when ingredients change (invalidates previous scroll position)
      navigationStore.clearScrollTarget("home");

      // Update cocktail matches local logic (kept from original)
      // Note: IngredientsStore updates usually don't trigger search automatically?
      // The original code had findMatches call here.
      if (ids.length > 0) {
        // We only trigger search if NOT syncing from URL?
        // Actually findMatches is needed to update the UI.
        // If syncing from URL, we call findMatches manually in syncFromUrl after loading.
        // If user clicks UI, this watcher runs.
        // So we should run findMatches regardless, or rely on `syncFromUrl`?

        // If isSyncingFromUrl is true, syncFromUrl handles the search call after loading all items.
        // If we call it here, it might run prematurely (incomplete list during the async loop).
        if (!isSyncingFromUrl.value) {
          cocktailsStore.findMatches(ids, 0);
        }
      } else {
        cocktailsStore.clearMatches();
      }

      // Update URL query string
      if (!isSyncingFromUrl.value) {
        updateUrlQuery();
      }
    },
    { immediate: true }
  );

  // Watch mode changes (Store -> URL)
  watch(
    [() => cocktailsStore.matchMode, () => cocktailsStore.allowSubstitution],
    () => {
      // Clear scroll target when match settings change
      navigationStore.clearScrollTarget("home");

      if (!isSyncingFromUrl.value) {
        // Only update URL if we have active ingredients, otherwise settings don't matter in URL
        if (ingredientsStore.selectedIds.length > 0) {
          updateUrlQuery();
          // Trigger search refresh when parameters change
          cocktailsStore.findMatches(ingredientsStore.selectedIds, 0);
        }
      }
    }
  );

  // Watch URL changes (URL -> Store)
  watch(
    () => route.query,
    () => {
      // Check if we need to sync to store
      // This handles Back/Forward navigation AND manual URL edits
      syncFromUrl();
    },
    { immediate: true } // Run immediately to handle initial load
  );

  return {
    isSyncingFromUrl,
  };
}

import { ref, computed } from "vue";
import { useIngredientsStore } from "@/stores/ingredients";
import type { Ingredient } from "@/types";

export function useIngredientSearch(
  filterFn?: (ingredient: Ingredient) => boolean
) {
  const ingredientsStore = useIngredientsStore();
  const searchQuery = ref("");
  const isSearchFocused = ref(false);
  let searchTimeout: ReturnType<typeof setTimeout>;

  const searchResults = computed(() => {
    if (!searchQuery.value.trim()) return [];
    let results = ingredientsStore.searchResults;
    if (filterFn) {
      results = results.filter(filterFn);
    }
    return results.slice(0, 8);
  });

  const showDropdown = computed(
    () => isSearchFocused.value && searchResults.value.length > 0
  );

  function handleSearch(value: string) {
    if (value !== searchQuery.value) {
      searchQuery.value = value;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      ingredientsStore.search(value);
    }, 100);
  }

  function handleFocus() {
    isSearchFocused.value = true;
    if (searchQuery.value) {
      handleSearch(searchQuery.value);
    }
  }

  function handleBlur() {
    setTimeout(() => {
      isSearchFocused.value = false;
    }, 200);
  }

  function clearSearch() {
    searchQuery.value = "";
    isSearchFocused.value = false;
  }

  return {
    searchQuery,
    isSearchFocused,
    searchResults,
    showDropdown,
    handleSearch,
    handleFocus,
    handleBlur,
    clearSearch,
  };
}

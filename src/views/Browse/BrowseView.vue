<script setup lang="ts">
/**
 * BrowseView - Modern Category Browser
 * Refactored to use sub-components.
 */
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  getAllCategories,
  getCocktailsByCategory,
  getAllCocktailsWithDetails,
} from "@/composables/useCocktailMatcher";
import WaveLayout from "@/components/layout/WaveLayout.vue";
// Components
import BrowseHeader from "./components/BrowseHeader.vue";
import BrowseCategoryTabs from "./components/BrowseCategoryTabs.vue";
import BrowseCocktailGrid from "./components/BrowseCocktailGrid.vue";
import type { Category, CocktailWithDetails } from "@/types";
import { useScrollRestoration } from "@/composables/useScrollRestoration";
import { useNavigationStore } from "@/stores/navigation";

defineOptions({
  name: "BrowseView",
});

const router = useRouter();
const route = useRoute();
const navigationStore = useNavigationStore();

const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | null>(null);
const cocktails = ref<CocktailWithDetails[]>([]);
const isLoading = ref(true);
const searchQuery = ref("");

// Computed for filtered list (needs to be defined before scroll check)
const filteredCocktails = computed(() => {
  let list = cocktails.value;
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(query));
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
});

function checkItemExists(elementId: string): boolean {
  // The elementId is in format "drink-{slug}", extract the slug
  const slug = elementId.replace(/^drink-/, "");
  return filteredCocktails.value.some((c) => c.slug === slug);
}

// Scroll restoration logic
useScrollRestoration("browse", isLoading, checkItemExists);

onMounted(async () => {
  const fetchedCategories = await getAllCategories();
  categories.value = [
    { id: 0, name: "All", slug: "all" },
    ...fetchedCategories,
  ];

  // Determine initial category from URL or default to All
  let startCategory = categories.value[0];
  const queryCategorySlug = route.query.category as string;

  if (queryCategorySlug) {
    const found = categories.value.find((c) => c.slug === queryCategorySlug);
    if (found) {
      startCategory = found;
    }
  }

  // Select category without modifying URL (preserves scroll target for restoration)
  await selectCategory(startCategory, false);
});

// Watch for external URL changes
watch(
  () => route.query.category,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (newSlug: any) => {
    // If undefined or empty (or technically array, but default router query is usually string), cast to string
    const slug = newSlug as string;

    if (!slug && selectedCategory.value?.slug !== "all") {
      await selectCategory(categories.value[0], false);
    } else if (slug && slug !== selectedCategory.value?.slug) {
      const found = categories.value.find((c) => c.slug === slug);
      if (found) {
        await selectCategory(found, false);
      }
    }
  }
);

async function selectCategory(category: Category, updateUrl = true) {
  if (updateUrl) {
    // When manually selecting a category, clear scroll target and update URL
    navigationStore.clearScrollTarget("browse");
    await router.replace({ query: { category: category.slug } });
  }

  isLoading.value = true;
  selectedCategory.value = category;
  searchQuery.value = "";

  try {
    if (category.id === 0) {
      cocktails.value = await getAllCocktailsWithDetails();
    } else if (category.id) {
      cocktails.value = await getCocktailsByCategory(category.id);
    }
  } finally {
    // Small delay to allow transition/DOM update
    setTimeout(() => {
      isLoading.value = false;
      // Composable watches isLoading and triggers scroll check
    }, 50);
  }
}
</script>

<template>
  <WaveLayout>
    <template #header>
      <!-- Header with Search -->
      <BrowseHeader v-model="searchQuery" />

      <!-- Category Tabs -->
      <BrowseCategoryTabs
        :categories="categories"
        :selected-category="selectedCategory"
        @select="selectCategory"
      />
    </template>

    <!-- Content slot (Dark zone) -->
    <BrowseCocktailGrid
      :cocktails="filteredCocktails"
      :is-loading="isLoading"
    />
  </WaveLayout>
</template>

<script setup lang="ts">
/**
 * HomeView - Modern Dual-Tone Home with Pantry Integration
 * Refactored to use sub-components and composables.
 */
import { computed, onMounted, watch } from "vue";
import { useIngredientsStore } from "@/stores/ingredients";
import { usePantryStore } from "@/stores/pantry";
import { useCocktailsStore } from "@/stores/cocktails";
import { useUrlSync } from "@/composables/useUrlSync";
import WaveLayout from "@/components/layout/WaveLayout.vue";

// Components
import HomeHero from "./components/HomeHero.vue";
import HomeIngredientsDisplay from "./components/HomeIngredientsDisplay.vue";
import HomePantrySummary from "./components/HomePantrySummary.vue";
import HomeResults from "./components/HomeResults.vue";
import HomeEmptyState from "./components/HomeEmptyState.vue";
import LedgerResumeCard from "./components/LedgerResumeCard.vue";
import { useScrollRestoration } from "@/composables/useScrollRestoration";
import { storeToRefs } from "pinia";

const ingredientsStore = useIngredientsStore();
const pantryStore = usePantryStore();
const cocktailsStore = useCocktailsStore();

defineOptions({
  name: "HomeView",
});

// Initialize URL Sync logic
const { isSyncingFromUrl } = useUrlSync();

// Load pantry and find matches for suggestions
onMounted(async () => {
  await pantryStore.loadItems();
});

watch(
  () => pantryStore.ingredientIds,
  (ids) => {
    if (ids.length > 0) {
      cocktailsStore.findPantryMatches(ids, 50);
    }
  },
  { deep: true, immediate: true }
);

const showResults = computed(() => ingredientsStore.hasSelection);
const showPantrySection = computed(
  () =>
    !showResults.value &&
    (pantryStore.itemCount > 0 || cocktailsStore.pantryMatches.length > 0)
);

// Scroll Restoration Logic
const { isMatchingInProgress } = storeToRefs(cocktailsStore);
const { isLoading: isPantryLoading } = storeToRefs(pantryStore);

// Computed loading state for the view
// We consider it loading if a search is running (if searching) OR if we are waiting for pantry (if in pantry mode)
const isViewLoading = computed(() => {
  // Always loading if syncing from URL
  if (isSyncingFromUrl.value) return true;

  if (ingredientsStore.hasSelection) {
    return isMatchingInProgress.value;
  }
  return isPantryLoading.value;
});

function checkItemExists(slug: string): boolean {
  // Determine which list is active
  if (ingredientsStore.hasSelection) {
    return cocktailsStore.matches.some((m) => m.cocktail.slug === slug);
  } else if (cocktailsStore.pantryMatches.length > 0) {
    return cocktailsStore.pantryMatches.some((m) => m.cocktail.slug === slug);
  }
  return false;
}

const { checkAndScroll } = useScrollRestoration(
  "home",
  isViewLoading,
  checkItemExists
);

// Watch for manual mode switches (search vs pantry) that might not trigger "loading"
watch(
  () => [ingredientsStore.hasSelection, cocktailsStore.matches.length],
  () => {
    // If not loading, re-run checks
    if (!isViewLoading.value) {
      // We use nextTick inside checkAndScroll's logic, but here we might want to wait for transition?
      // The composable handles nextTick.
      checkAndScroll();
    }
  }
);
</script>

<template>
  <WaveLayout>
    <template #header>
      <!-- Hero Section -->
      <HomeHero />

      <!-- Resume Session Prompt -->
      <LedgerResumeCard />

      <!-- Selected Ingredients Display -->
      <div v-if="ingredientsStore.hasSelection">
        <HomeIngredientsDisplay />
      </div>

      <!-- Pantry Summary Card (when not searching) -->
      <Transition name="fade-scale">
        <div v-if="showPantrySection">
          <HomePantrySummary />
        </div>
      </Transition>
    </template>

    <!-- Dark Content -->
    <Transition name="slide-up" mode="out-in">
      <!-- Search Results -->
      <HomeResults v-if="showResults" key="results" mode="search" />

      <!-- Pantry Suggestions -->
      <HomeResults
        v-else-if="showPantrySection && cocktailsStore.pantryMatches.length > 0"
        key="pantry"
        mode="pantry"
      />

      <!-- Empty State -->
      <HomeEmptyState v-else key="empty" />
    </Transition>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

// Transitions
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

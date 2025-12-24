<script setup lang="ts">
/**
 * CocktailView - Modern Recipe View with Prep Mode & Pantry Integration
 * Refactored to use sub-components and composables.
 */
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import confetti from "canvas-confetti";
import { db } from "@/services/database";
import { getCocktailWithDetails } from "@/composables/useCocktailMatcher";
import { usePrepMode } from "@/composables/usePrepMode";
import { usePantryStore } from "@/stores/pantry";
import { useLedgerStore } from "@/stores/ledger";
import { isConvertibleUnit, toMl } from "@/utils/unitConversions";
import type { LedgerIngredientUsage } from "@/types";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import type { CocktailWithDetails } from "@/types";

// Components
import CocktailHeader from "./components/CocktailHeader.vue";
import CocktailPrepControls from "./components/CocktailPrepControls.vue";
import CocktailIngredients from "./components/CocktailIngredients.vue";
import CocktailMethod from "./components/CocktailMethod.vue";
import CocktailCompletionDialog from "./components/CocktailCompletionDialog.vue";

const route = useRoute();
const router = useRouter();
const pantryStore = usePantryStore();
const ledgerStore = useLedgerStore();

const cocktail = ref<CocktailWithDetails | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCompleting = ref(false);
const showCompleteDialog = ref(false);

// Prep mode logic
const {
  isActive: isPrepMode,
  scale,
  toggleActive: togglePrepMode,
  toggleIngredient,
  completedIngredientIds,
  setScale,
  progressPercentage,
  isComplete,
  reset: resetPrepMode,
} = usePrepMode(cocktail);

// Watch for completion - when ready, show dialog
watch([isComplete, isPrepMode], ([complete, prep]) => {
  if (complete && prep && !isCompleting.value) {
    showCompleteDialog.value = true;
  }
});

// Load cocktail by slug
async function loadCocktail(slug: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const found = await db.cocktails.where("slug").equals(slug).first();
    if (found?.id) {
      cocktail.value = await getCocktailWithDetails(found.id);
    } else {
      error.value = "Cocktail not found";
    }
  } catch (e) {
    error.value = "Failed to load cocktail";
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

function handleGoHome() {
  router.push("/");
}

function closeDialog() {
  showCompleteDialog.value = false;
}

const recipeZoneRef = ref<HTMLElement | null>(null);

function scrollToDetails() {
  recipeZoneRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Complete the drink - use ingredients from pantry and celebrate!
 */
async function completeDrink() {
  if (!cocktail.value || isCompleting.value) return;

  isCompleting.value = true;

  try {
    // Build ingredient usage list for ledger
    const ingredientsUsed: LedgerIngredientUsage[] = [];

    // Use ingredients from pantry (scaled)
    for (const ingredient of cocktail.value.ingredients) {
      if (ingredient.quantity && isConvertibleUnit(ingredient.unit)) {
        const scaledQuantity = ingredient.quantity * scale.value;
        await pantryStore.useIngredient(
          ingredient.ingredientId,
          scaledQuantity,
          ingredient.unit
        );

        // Track for ledger
        ingredientsUsed.push({
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.ingredient.name,
          quantityMl: toMl(scaledQuantity, ingredient.unit),
          originalUnit: ingredient.unit,
          originalQuantity: scaledQuantity,
        });
      }
    }

    // Record drink in ledger (creates session if needed)
    await ledgerStore.recordDrink(cocktail.value, scale.value, ingredientsUsed);

    // Fire confetti! 🎉
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"],
      zIndex: 1000,
    });

    // Second burst for extra celebration
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
        zIndex: 1000,
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
        zIndex: 1000,
      });
    }, 250);

    // Close dialog and exit prep mode
    setTimeout(() => {
      showCompleteDialog.value = false;
      resetPrepMode();
      isCompleting.value = false;
    }, 1500);
  } catch (e) {
    console.error("Error completing drink:", e);
    isCompleting.value = false;
  }
}

onMounted(async () => {
  await pantryStore.loadItems();
  loadCocktail(route.params.slug as string);
});

watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      loadCocktail(newSlug as string);
    }
  }
);
</script>

<template>
  <WaveLayout>
    <template #header>
      <CocktailHeader
        :cocktail="cocktail"
        :is-loading="isLoading"
        :error="error"
        @go-home="handleGoHome"
        @scroll-down="scrollToDetails"
      />
    </template>

    <!-- Dark Section - Recipe Content -->
    <div v-if="cocktail && !isLoading" ref="recipeZoneRef" class="recipe-zone">
      <!-- Controls -->
      <CocktailPrepControls
        :is-prep-mode="isPrepMode"
        :scale="scale"
        :progress-percentage="progressPercentage"
        @toggle-prep-mode="togglePrepMode"
        @update:scale="setScale"
      />

      <!-- Ingredients -->
      <CocktailIngredients
        :ingredients="cocktail.ingredients"
        :is-prep-mode="isPrepMode"
        :scale="scale"
        :completed-ingredient-ids="completedIngredientIds"
        @toggle-ingredient="toggleIngredient"
      />

      <!-- Method -->
      <CocktailMethod :method="cocktail.method" :garnish="cocktail.garnish" />
    </div>

    <!-- Completion Dialog -->
    <CocktailCompletionDialog
      :show="showCompleteDialog"
      :is-completing="isCompleting"
      @close="closeDialog"
      @confirm="completeDrink"
    />
  </WaveLayout>
</template>

<style lang="scss" scoped>
// Minimal styling, mostly layout
.recipe-zone {
  flex: 1;
  width: 100%;
  max-width: 100%;
}
</style>

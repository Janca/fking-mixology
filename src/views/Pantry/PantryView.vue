<script setup lang="ts">
/**
 * PantryView - Two Column Layout
 * Left: Add form | Right: Inventory
 * Bottom: What you can make (in dark section)
 */
import { onMounted, watch } from "vue";
import { usePantryStore } from "@/stores/pantry";
import { useCocktailsStore } from "@/stores/cocktails";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
// Components
import PantryAddForm from "./components/PantryAddForm.vue";
import PantryInventory from "./components/PantryInventory.vue";
import PantryCocktailMatches from "./components/PantryCocktailMatches.vue";

const pantryStore = usePantryStore();
const cocktailsStore = useCocktailsStore();

// Watch pantry changes to update matches
watch(
  () => pantryStore.ingredientIds,
  async (ids) => {
    // Find matches with at least 50% ingredients matched
    await cocktailsStore.findMatches(ids, 50);
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  await pantryStore.loadItems();
});
</script>

<template>
  <WaveLayout>
    <template #header>
      <!-- Page Title -->
      <div class="pantry-header">
        <AppEmoji class="pantry-header__emoji">🍾</AppEmoji>
        <h1 class="pantry-header__title">Your Pantry</h1>
        <p class="pantry-header__subtitle">
          <template v-if="pantryStore.itemCount > 0">
            {{ pantryStore.itemCount }} ingredients •
            {{ cocktailsStore.perfectMatches.length }} drinks ready
          </template>
          <template v-else>
            Add ingredients to track your bar inventory
          </template>
        </p>
      </div>

      <!-- Two Column Content -->
      <div class="pantry-columns">
        <!-- LEFT: Add Ingredient Form -->
        <PantryAddForm />

        <!-- RIGHT: Current Inventory -->
        <PantryInventory />
      </div>
    </template>

    <!-- Dark Content -->
    <PantryCocktailMatches />
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.pantry-header {
  text-align: center;
  margin-bottom: $space-xl;

  &__emoji {
    font-size: 3rem;
    margin-bottom: $space-sm;
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-h1;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    margin-bottom: $space-2xs;

    @include mobile-only {
      font-size: $font-size-h2;
    }
  }

  &__subtitle {
    font-size: $font-size-body;
    color: $text-dark-muted;
  }
}

.pantry-columns {
  display: grid;
  gap: $space-lg;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 $space-sm; // Reduced padding for better mobile fit

  @include tablet-up {
    grid-template-columns: 1fr 1fr;
    gap: $space-xl;
    padding: 0 $space-lg;
  }
}
</style>

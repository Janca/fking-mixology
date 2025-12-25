<script setup lang="ts">
/**
 * PantryView - Two Column Layout
 * Left: Add form | Right: Inventory
 * Bottom: What you can make (in dark section)
 */
import { onMounted, watch, computed } from "vue";
import { usePantryStore } from "@/stores/pantry";
import { useCocktailsStore } from "@/stores/cocktails";
import WaveLayout from "@/components/layout/WaveLayout.vue";
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

const subtitle = computed(() => pantryStore.itemCount > 0
  ? `${pantryStore.itemCount} ingredients • ${cocktailsStore.perfectMatches.length} drinks ready`
  : 'Add ingredients to track your bar inventory')
</script>

<template>
  <WaveLayout title="Your Pantry" icon="🍻" :subtitle="subtitle">
    <template #header-content>
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

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePantryStore } from "@/stores/pantry";
import { useIngredientSearch } from "@/composables/useIngredientSearch";
import { getIngredientEmoji } from "@/utils/cocktailUtils";
import AppButton from "@/components/common/AppButton.vue";
import AppAutocomplete, { type AutocompleteItem } from "@/components/common/AppAutocomplete.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
import AppSelect from "@/components/common/AppSelect.vue";
import AppNumberInput from "@/components/common/AppNumberInput.vue";
import type { Ingredient, VolumeUnit } from "@/types";

const emit = defineEmits<{
  (e: "added"): void;
}>();

const pantryStore = usePantryStore();
// Note: We don't need useIngredientsStore here anymore as it's used inside the composable,
// but we might need to filter based on pantryStore.

const {
  searchQuery,
  searchResults,
  showDropdown,
  handleSearch,
  handleFocus,
  handleBlur,
  clearSearch,
} = useIngredientSearch((ing) => !pantryStore.ingredientIds.includes(ing.id!));

// Transform search results to autocomplete items format
const autocompleteItems = computed(() =>
  searchResults.value.map((ing) => ({
    id: ing.id!,
    name: ing.name,
    ingredient: ing,
  }))
);

const selectedIngredient = ref<Ingredient | null>(null);
const addQuantity = ref(750);
const addUnit = ref<VolumeUnit>("ml");

const unitOptions = [
  { value: "ml", label: "ml" },
  { value: "oz", label: "oz" },
  { value: "l", label: "L" },
  { value: "cl", label: "cl" },
  { value: "cup", label: "cups" },
];

const presets = [
  { label: "Mini", value: 50, unit: "ml" as VolumeUnit },
  { label: "Shot", value: 44, unit: "ml" as VolumeUnit },
  { label: "Flask", value: 200, unit: "ml" as VolumeUnit },
  { label: "Fifth", value: 750, unit: "ml" as VolumeUnit },
  { label: "1L", value: 1000, unit: "ml" as VolumeUnit },
  { label: "Handle", value: 1750, unit: "ml" as VolumeUnit },
];

function selectIngredient(item: AutocompleteItem) {
  selectedIngredient.value = item.ingredient as Ingredient;
  clearSearch();
}

function applyPreset(preset: { value: number; unit: VolumeUnit }) {
  addQuantity.value = preset.value;
  addUnit.value = preset.unit;
}

async function addToPantry() {
  if (!selectedIngredient.value?.id) return;

  await pantryStore.addItem(
    selectedIngredient.value.id,
    addQuantity.value,
    addUnit.value
  );

  selectedIngredient.value = null;
  addQuantity.value = 750;
  emit("added");
}
</script>

<template>
  <div class="add-form">
    <div class="add-form__glass">
      <h2 class="add-form__title">
        <AppEmoji>➕</AppEmoji> Add Ingredient
      </h2>

      <!-- Ingredient Search -->
      <div class="form-group">
        <label class="form-label">Ingredient</label>
        <div v-if="selectedIngredient" class="selected-ingredient">
          <span class="selected-ingredient__name">
            {{ selectedIngredient.name }}
          </span>
          <button class="selected-ingredient__remove" @click="selectedIngredient = null">
            ✕
          </button>
        </div>
        <div v-else>
          <AppAutocomplete v-model="searchQuery" :items="autocompleteItems" :show-dropdown="showDropdown"
            placeholder="Search ingredients..." variant="light" size="md" clearable item-label-key="name"
            no-results-text="No ingredients found" @input="handleSearch" @focus="handleFocus" @blur="handleBlur"
            @select="selectIngredient" @update:show-dropdown="(val) => showDropdown = val">
            <template #prefix>
              <AppEmoji>🔍</AppEmoji>
            </template>
            <template #item="{ item }">
              <span class="search-dropdown__emoji">
                <AppEmoji>{{ getIngredientEmoji(String(item.name)) }}</AppEmoji>
              </span>
              <span class="search-dropdown__name">{{ item.name }}</span>
              <span class="search-dropdown__add">+</span>
            </template>
          </AppAutocomplete>
        </div>
      </div>

      <!-- Presets -->
      <div class="form-group">
        <label class="form-label">Quick Sizes</label>
        <div class="presets">
          <button v-for="preset in presets" :key="preset.label" class="preset-btn" :class="{
            'preset-btn--active':
              addQuantity === preset.value && addUnit === preset.unit,
          }" @click="applyPreset(preset)">
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Custom Quantity -->
      <div class="form-group">
        <label class="form-label">Amount</label>
        <div class="quantity-row">
          <AppNumberInput v-model="addQuantity" :min="10" :max="5000" :step="50" variant="light" size="md"
            class="quantity-stepper" />
          <AppSelect v-model="addUnit" :options="unitOptions" variant="light" size="md" class="unit-select" />
        </div>
      </div>

      <!-- Submit -->
      <AppButton variant="primary" size="lg" :disabled="!selectedIngredient" class="add-form__submit"
        @click="addToPantry">
        Add to Pantry
      </AppButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.add-form {
  &__glass {
    background: linear-gradient(135deg,
        color.change(white, $alpha: 0.9) 0%,
        color.change(white, $alpha: 0.75) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-radius: $radius-2xl;
    padding: $space-xl;
    box-shadow: 0 8px 32px color.change(#000, $alpha: 0.06),
      0 2px 8px color.change(#000, $alpha: 0.04),
      inset 0 1px 0 color.change(white, $alpha: 0.95);
    border: 1px solid color.change(white, $alpha: 0.7);
    width: 100%;
    min-width: 0;

    @include mobile-only {
      padding: $space-lg;
      border-radius: $radius-xl;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-dark-primary;
    margin-bottom: $space-xl;
    letter-spacing: -0.02em;
  }

  &__submit {
    width: 100%;
    margin-top: $space-lg;
  }
}

.form-group {
  margin-bottom: $space-md;
}

.form-label {
  display: block;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  color: $text-dark-secondary;
  margin-bottom: $space-xs;
}

.search-wrapper {
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + $space-sm);
  left: 0;
  right: 0;
  background: linear-gradient(135deg,
      $surface-light-100 0%,
      color.adjust($surface-light-100, $lightness: -1%) 100%);
  border-radius: $radius-xl;
  box-shadow: 0 8px 32px color.change(#000, $alpha: 0.12),
    0 4px 16px color.change(#000, $alpha: 0.06);
  max-height: 280px;
  overflow-y: auto;
  z-index: $z-dropdown;
  padding: $space-sm;
  border: 1px solid color.change($surface-light-400, $alpha: 0.4);

  &__item {
    display: flex;
    align-items: center;
    gap: $space-md;
    width: 100%;
    padding: $space-md $space-lg;
    background: transparent;
    border: none;
    border-radius: $radius-lg;
    text-align: left;
    font-size: $font-size-body-sm;
    color: $text-dark-primary;
    cursor: pointer;
    transition: all $transition-normal;

    &:hover {
      background: linear-gradient(135deg,
          color.change(#fff, $alpha: 0.9) 0%,
          color.change(#fff, $alpha: 0.7) 100%);
      transform: translateX(4px);
      box-shadow: 0 2px 8px color.change(#000, $alpha: 0.05);
    }

    &:active {
      transform: translateX(2px) scale(0.99);
    }
  }

  &__emoji {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-light-200;
    border-radius: $radius-lg;
    font-size: 1.1rem;
  }

  &__name {
    flex: 1;
    font-weight: $font-weight-medium;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__add {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-light-300;
    border-radius: $radius-full;
    font-weight: $font-weight-bold;
    font-size: 14px;
    color: $text-dark-secondary;
    flex-shrink: 0;
    transition: all $transition-fast;
  }

  &__item:hover &__emoji {
    background: color.change($accent-coral, $alpha: 0.15);
  }

  &__item:hover &__add {
    background: linear-gradient(135deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 2px 8px color.change($accent-coral, $alpha: 0.35);
  }
}

.selected-ingredient {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-sm $space-md;
  background: $accent-coral;
  border-radius: $radius-full;
  color: white;

  &__name {
    font-weight: $font-weight-semibold;
  }

  &__remove {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color.change(white, $alpha: 0.2);
    border: none;
    border-radius: $radius-full;
    color: white;
    cursor: pointer;
    font-size: 12px;

    &:hover {
      background: color.change(white, $alpha: 0.3);
    }
  }
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: $space-xs;
}

.preset-btn {
  padding: $space-xs $space-md;
  background: $surface-light-100;
  border: 1px solid color.change($surface-light-400, $alpha: 0.5);
  border-radius: $radius-full;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: 0 1px 3px color.change(#000, $alpha: 0.04);

  &:hover {
    background: $surface-light-200;
    border-color: color.change($accent-coral, $alpha: 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px color.change(#000, $alpha: 0.06);
  }

  &--active {
    background: linear-gradient(135deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px color.change($accent-coral, $alpha: 0.35);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px color.change($accent-coral, $alpha: 0.4);
    }
  }
}

.quantity-row {
  display: flex;
  gap: $space-sm;
  width: 100%;

  @include mobile-only {
    gap: $space-xs;
  }
}

.quantity-stepper {
  flex: 1;
  min-width: 0;
}

.unit-select {
  min-width: 90px;
  flex-shrink: 0;
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity $transition-fast, transform $transition-fast;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

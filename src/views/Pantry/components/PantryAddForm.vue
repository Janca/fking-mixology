<script setup lang="ts">
import { ref } from "vue";
import { usePantryStore } from "@/stores/pantry";
import { useIngredientSearch } from "@/composables/useIngredientSearch";
import AppButton from "@/components/common/AppButton.vue";
import AppInput from "@/components/common/AppInput.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
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

const selectedIngredient = ref<Ingredient | null>(null);
const addQuantity = ref(750);
const addUnit = ref<VolumeUnit>("ml");

const units: { value: VolumeUnit; label: string }[] = [
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

function selectIngredient(ingredient: Ingredient) {
  selectedIngredient.value = ingredient;
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
        <div v-else class="search-wrapper">
          <AppInput v-model="searchQuery" placeholder="Search ingredients..." variant="light" size="md"
            @input="handleSearch(searchQuery)" @focus="handleFocus" @blur="handleBlur">
            <template #prefix>
              <AppEmoji>🔍</AppEmoji>
            </template>
          </AppInput>
          <Transition name="dropdown">
            <div v-if="showDropdown" class="search-dropdown">
              <button v-for="ingredient in searchResults" :key="ingredient.id" class="search-dropdown__item"
                @mousedown.prevent="selectIngredient(ingredient)">
                <span>{{ ingredient.name }}</span>
                <span class="search-dropdown__add">+</span>
              </button>
            </div>
          </Transition>
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
          <div class="quantity-input">
            <button class="quantity-btn" @click="addQuantity = Math.max(10, addQuantity - 50)">
              −
            </button>
            <input v-model.number="addQuantity" type="number" min="1" class="quantity-value" />
            <button class="quantity-btn" @click="addQuantity += 50">+</button>
          </div>
          <select v-model="addUnit" class="unit-select">
            <option v-for="unit in units" :key="unit.value" :value="unit.value">
              {{ unit.label }}
            </option>
          </select>
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
  top: calc(100% + $space-xs);
  left: 0;
  right: 0;
  background: white;
  border-radius: $radius-lg;
  box-shadow: 0 8px 32px color.change(#000, $alpha: 0.12);
  max-height: 200px;
  overflow-y: auto;
  z-index: $z-dropdown;
  padding: $space-xs;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: $space-sm $space-md;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    text-align: left;
    font-size: $font-size-body-sm;
    color: $text-dark-primary;
    cursor: pointer;
    transition: background $transition-fast;

    &:hover {
      background: $surface-light-200;
    }
  }

  &__add {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-light-300;
    border-radius: $radius-full;
    font-weight: $font-weight-bold;
    font-size: 12px;
  }

  &__item:hover &__add {
    background: $accent-coral;
    color: white;
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

.quantity-input {
  display: flex;
  align-items: center;
  flex: 1;
  background: $surface-light-200;
  border-radius: $radius-full;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: $text-dark-primary;
  font-size: $font-size-body-lg;
  cursor: pointer;

  &:hover {
    background: $surface-light-300;
  }

  @include mobile-only {
    width: 32px;
    height: 32px;
  }
}

.quantity-value {
  flex: 1;
  text-align: center;
  background: transparent;
  border: none;
  font-family: $font-mono;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-bold;
  color: $text-dark-primary;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }

  -moz-appearance: textfield;
  appearance: textfield;
}

.unit-select {
  padding: $space-xs $space-md;
  background: $surface-light-200;
  border: none;
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-medium;
  color: $text-dark-primary;
  cursor: pointer;
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

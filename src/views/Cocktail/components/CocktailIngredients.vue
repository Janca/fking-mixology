<script setup lang="ts">
import { computed } from "vue";
import type { RecipeIngredientWithDetails } from "@/types";
import { formatQuantity } from "@/composables/usePrepMode";
import { formatIngredientName } from "@/utils/cocktailUtils";

const props = defineProps<{
  ingredients: RecipeIngredientWithDetails[];
  isPrepMode: boolean;
  scale: number;
  completedIngredientIds: Set<number>;
}>();

const emit = defineEmits<{
  (e: "toggleIngredient", id: number): void;
}>();

const mainIngredients = computed(() =>
  props.ingredients.filter((i) => !i.isGarnish)
);
const garnishIngredients = computed(() =>
  props.ingredients.filter((i) => i.isGarnish)
);

function isComplete(id: number) {
  return props.completedIngredientIds.has(id);
}
// Helper to separate quantity formatting
function formatQuantityHtml(
  quantity: number | null,
  unit: string,
  scale: number,
  quantityMax: number | null | undefined,
  ingredientName?: string
): string {
  const text = formatQuantity(
    quantity,
    unit,
    scale,
    quantityMax ?? null,
    ingredientName
  );

  // Match "Whole Space Fraction" (e.g. "1 1/3")
  // Using global flag to catch ranges like "1 1/2-2 1/2" (though toFraction usually handles ranges differently, this is safer)
  // formatQuantity output for ranges looks like "1 1/2-2" or "1-2"
  return text.replace(
    /(\d+)\s+(\d+\/\d+)/g,
    '$1<span class="fraction">$2</span>'
  );
}
</script>

<template>
  <div class="calculator-container">
    <!-- Main Ingredients -->
    <div class="recipe-section">
      <h2 class="recipe-section__title">
        <span class="recipe-section__emoji">🧪</span>
        Ingredients
      </h2>
      <ul class="ingredients-list">
        <li
          v-for="(ingredient, idx) in mainIngredients"
          :key="ingredient.id"
          class="ingredient-row"
          :class="{
            'ingredient-row--interactive': isPrepMode,
            'ingredient-row--done':
              isPrepMode && isComplete(ingredient.ingredientId),
          }"
          :style="{ animationDelay: `${idx * 50}ms` }"
          @click="
            isPrepMode && emit('toggleIngredient', ingredient.ingredientId)
          "
        >
          <Transition name="slide-reveal">
            <span class="ingredient-row__check" v-if="isPrepMode">
              <svg
                v-if="isComplete(ingredient.ingredientId)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </Transition>
          <span
            class="ingredient-row__qty"
            v-html="
              formatQuantityHtml(
                ingredient.quantity,
                ingredient.unit,
                scale,
                ingredient.quantityMax,
                ingredient.ingredient.name
              )
            "
          ></span>
          <span class="ingredient-row__name">
            {{ formatIngredientName(ingredient.ingredient.name) }}
          </span>
          <span v-if="ingredient.note" class="ingredient-row__note">
            {{ ingredient.note }}
          </span>
        </li>
      </ul>

      <!-- Garnish Ingredients (Special UI) -->
      <div v-if="garnishIngredients.length > 0" class="garnish-section">
        <h3 class="garnish-section__title">
          <span class="garnish-section__emoji">🌿</span>
          Garnish
        </h3>
        <ul class="garnish-list">
          <li
            v-for="ingredient in garnishIngredients"
            :key="ingredient.id"
            class="garnish-item"
            :class="{
              'garnish-item--interactive': isPrepMode,
              'garnish-item--done':
                isPrepMode && isComplete(ingredient.ingredientId),
            }"
            @click="
              isPrepMode && emit('toggleIngredient', ingredient.ingredientId)
            "
          >
            <span class="garnish-item__icon">🌿</span>
            <span class="garnish-item__name">
              {{ formatIngredientName(ingredient.ingredient.name) }}
            </span>
            <span v-if="isPrepMode" class="garnish-item__check">
              <svg
                v-if="isComplete(ingredient.ingredientId)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.recipe-section {
  max-width: 600px;
  margin: 0 auto $space-xl;

  &__title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-md;
  }

  &__emoji {
    font-size: 1.25em;
  }
}

.ingredients-list {
  list-style: none;
}

.ingredient-row {
  display: flex;
  align-items: center;
  padding: $space-md $space-lg;
  min-height: 72px;
  background: $surface-dark-300;
  border-radius: $radius-lg;
  margin-bottom: $space-xs;
  animation: slide-up-anim 0.4s ease forwards;
  opacity: 0;
  transition: all $transition-fast;

  &--interactive {
    cursor: pointer;

    &:hover {
      background: $surface-dark-200;
    }
  }

  &--done {
    opacity: 0.5;

    .ingredient-row__name,
    .ingredient-row__qty {
      text-decoration: line-through;
    }

    .ingredient-row__check {
      background: $accent-coral;
      color: white;
    }
  }

  &__check {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-dark-400;
    border-radius: $radius-sm;
    color: transparent;
    transition: all $transition-fast;
    margin-right: $space-md;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__qty {
    flex-shrink: 0;
    min-width: 80px;
    font-family: $font-mono;
    font-size: $font-size-body-sm;
    font-weight: $font-weight-medium;
    color: $accent-coral;
    margin-right: $space-md;
  }

  &__name {
    flex: 1;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $text-light-primary;
  }

  &__note {
    font-size: $font-size-caption;
    color: $text-light-muted;
    font-style: italic;
  }

  // Fraction styling
  :deep(.fraction) {
    font-size: 0.75em;
    vertical-align: 0.3em;
    margin-left: 2px;
    font-weight: 700;
  }
}

// Garnish Section
.garnish-section {
  margin-top: $space-lg;
  padding: $space-md;
  background: rgba($accent-teal, 0.1);
  border: 1px dashed rgba($accent-teal, 0.3);
  border-radius: $radius-lg;

  &__title {
    display: flex;
    align-items: center;
    gap: $space-xs;
    font-size: $font-size-body;
    font-weight: $font-weight-bold;
    color: $accent-teal;
    margin-bottom: $space-sm;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.garnish-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
}

.garnish-item {
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-xs $space-sm;
  background: rgba($surface-dark-300, 0.5);
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  color: $text-light-primary;
  transition: all $transition-fast;

  &--interactive {
    cursor: pointer;

    &:hover {
      background: rgba($surface-dark-300, 0.8);
    }
  }

  &--done {
    opacity: 0.6;
    background: rgba($accent-teal, 0.2);
    color: $accent-teal;
    text-decoration: line-through;
  }

  &__check {
    width: 16px;
    height: 16px;
    color: $accent-teal;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

@keyframes slide-up-anim {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-reveal-enter-active,
.slide-reveal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.slide-reveal-enter-from,
.slide-reveal-leave-to {
  width: 0;
  opacity: 0;
  transform: translateX(-20px);
  margin-right: 0;
}

.slide-reveal-enter-to,
.slide-reveal-leave-from {
  width: 28px;
  opacity: 1;
  transform: translateX(0);
  margin-right: $space-md;
}
</style>

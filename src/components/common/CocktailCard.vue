<script setup lang="ts">
/**
 * CocktailCard - Modern Neumorphic Card with Progress Bar
 */
import { computed } from "vue";
import type { CocktailWithDetails, CocktailMatch } from "@/types";
import { getCategoryEmoji, formatIngredientName } from "@/utils/cocktailUtils";
import { useFavoritesStore } from "@/stores/favorites";
import AppEmoji from "./AppEmoji.vue";

const favoritesStore = useFavoritesStore();

interface Props {
  cocktail: CocktailWithDetails;
  match?: CocktailMatch;
  variant?: "light" | "dark";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "light",
});

const emit = defineEmits<{
  click: [];
}>();

function getMatchDisplay(match: CocktailMatch | undefined): string {
  if (!match) return "";
  const pct = Math.round(match.matchPercentage);
  return pct === 100 ? "✓ Perfect" : `${pct}%`;
}

const isFavorite = computed(() => {
  if (!props.cocktail.id) return false;
  return favoritesStore.isFavorite(props.cocktail.id);
});

function toggleFavorite() {
  if (props.cocktail.id) {
    favoritesStore.toggleFavorite(props.cocktail.id);
  }
}
</script>

<template>
  <article class="cocktail-card" :class="[
    `cocktail-card--${variant}`,
    { 'cocktail-card--perfect': match?.matchPercentage === 100 },
  ]" role="button" tabindex="0" @click="emit('click')" @keydown.enter="emit('click')"
    @keydown.space.prevent="emit('click')">
    <!-- Emoji Icon -->
    <AppEmoji class="cocktail-card__emoji">
      {{ getCategoryEmoji(cocktail.category.name) }}
    </AppEmoji>

    <!-- Match Badge (only show for perfect matches or when no progress bar) -->
    <div v-if="match?.matchPercentage === 100" class="cocktail-card__badge cocktail-card__badge--perfect">
      {{ getMatchDisplay(match) }}
    </div>

    <!-- Content -->
    <div class="cocktail-card__content">
      <span class="cocktail-card__category">
        {{ cocktail.category.name }}
      </span>

      <h3 class="cocktail-card__name">{{ cocktail.name }}</h3>

      <!-- Ingredients preview -->
      <div class="cocktail-card__ingredients">
        <span v-for="(ing, idx) in cocktail.ingredients.slice(0, 3)" :key="ing.id" class="cocktail-card__ingredient">
          {{ formatIngredientName(ing.ingredient.name)
          }}{{
            idx < Math.min(2, cocktail.ingredients.length - 1) ? " · " : "" }} </span>
            <span v-if="cocktail.ingredients.length > 3" class="cocktail-card__more">
              +{{ cocktail.ingredients.length - 3 }} more
            </span>
      </div>
    </div>

    <!-- Favorite Button -->
    <button class="cocktail-card__favorite" :class="{ 'cocktail-card__favorite--active': isFavorite }"
      @click.stop="toggleFavorite" aria-label="Toggle Favorite">
      <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>

    <!-- Arrow indicator -->
    <div class="cocktail-card__arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>

    <!-- Progress Bar (Bottom Border) - Shows match percentage for partial matches -->
    <div v-if="match && match.matchPercentage < 100" class="cocktail-card__progress">
      <div class="cocktail-card__progress-fill" :style="{ width: `${match.matchPercentage}%` }" />
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.cocktail-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-lg;
  border-radius: $radius-xl;
  cursor: pointer;
  transition: all $transition-normal;
  width: 100%;
  min-width: 0; // Prevent content from forcing grid expansion
  overflow: hidden; // Ensure progress bar conforms to border radius

  // Light variant
  &--light {
    background: $surface-light-100;
    border: 1px solid color.change($surface-light-400, $alpha: 0.4);
    box-shadow: 0 2px 8px color.change(#000, $alpha: 0.04),
      0 4px 16px color.change(#000, $alpha: 0.02);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px color.change(#000, $alpha: 0.08),
        0 16px 40px color.change(#000, $alpha: 0.04);
      border-color: color.change($accent-coral, $alpha: 0.3);
    }

    &:active {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px color.change(#000, $alpha: 0.06);
    }
  }

  // Dark variant
  &--dark {
    background: linear-gradient(135deg,
        $surface-dark-300 0%,
        color.adjust($surface-dark-300, $lightness: -3%) 100%);
    border: 1px solid color.change(#fff, $alpha: 0.06);
    box-shadow: 0 4px 12px color.change(#000, $alpha: 0.2),
      0 8px 24px color.change(#000, $alpha: 0.15);

    .cocktail-card__name {
      color: $text-light-primary;
    }

    .cocktail-card__category,
    .cocktail-card__ingredients,
    .cocktail-card__more {
      color: $text-light-muted;
    }

    .cocktail-card__arrow {
      color: $text-light-muted;
      background: $surface-dark-200;
    }

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px color.change(#000, $alpha: 0.3),
        0 20px 48px color.change(#000, $alpha: 0.2);
      border-color: color.change($accent-coral, $alpha: 0.3);

      .cocktail-card__arrow {
        background: $accent-coral;
        color: white;
      }
    }

    &:active {
      transform: translateY(-3px);
    }
  }

  // Perfect match variant
  &--perfect {
    border: 2px solid $accent-coral;

    .cocktail-card__emoji {
      animation: bounce-gentle 2s ease-in-out infinite;
    }
  }

  &__emoji {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    background: $surface-light-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-light-inset-sm;
  }

  &--dark &__emoji {
    background: $surface-dark-400;
    box-shadow: $shadow-dark-inset-sm;
  }

  &__badge {
    position: absolute;
    top: $space-sm;
    right: $space-sm;
    padding: $space-2xs $space-sm;
    font-size: $font-size-tiny;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: $radius-full;
    background: $surface-light-300;
    color: $text-dark-muted;

    &--perfect {
      background: $gradient-coral;
      color: white;
      box-shadow: $glow-coral;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__category {
    display: block;
    font-size: $font-size-tiny;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $accent-coral;
    margin-bottom: $space-2xs;
  }

  &__name {
    font-family: $font-display;
    font-size: $font-size-body-lg;
    font-weight: $font-weight-bold;
    color: $text-dark-primary;
    margin-bottom: $space-xs;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__ingredients {
    font-size: $font-size-caption;
    color: $text-dark-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__ingredient {
    font-weight: $font-weight-medium;
  }

  &__more {
    color: $accent-blue;
    font-weight: $font-weight-semibold;
  }

  &__arrow {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-light-200;
    border-radius: $radius-full;
    color: $text-dark-muted;
    transition: all $transition-normal;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &:hover &__arrow {
    background: $accent-coral;
    color: white;
    transform: translateX(4px);
  }

  &__favorite {
    background: none;
    border: none;
    cursor: pointer;
    padding: $space-xs;
    color: $text-dark-muted;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -8px; // Pull closer to arrow
    z-index: 2;

    svg {
      width: 24px;
      height: 24px;
      transition: all 0.2s;
    }

    &:hover {
      transform: scale(1.2);
    }

    &--active {
      color: $accent-coral;

      svg {
        fill: $accent-coral;
        animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }
  }

  &--dark &__favorite {
    color: color.change($surface-light-100, $alpha: 0.3);

    &:hover {
      color: color.change($surface-light-100, $alpha: 0.7);
    }

    &--active {
      color: $accent-coral;
      text-shadow: 0 0 10px color.change($surface-light-100, $alpha: 0.5);
    }
  }

  // Progress bar at bottom of card
  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: color.change(#000, $alpha: 0.1);
    border-radius: 0 0 $radius-xl $radius-xl;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: $accent-teal;
    box-shadow: 0 0 8px color.change($surface-light-100, $alpha: 0.5);
    transition: width $transition-normal;
    border-radius: 0 4px 4px 0;
  }

  // Dark variant progress
  &--dark &__progress {
    background: color.change(#000, $alpha: 0.3);
  }

  &--dark &__progress-fill {
    background: $accent-coral;
    box-shadow: 0 0 8px color.change($surface-light-100, $alpha: 0.5);
  }
}

@keyframes bounce-gentle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
  }

  100% {
    transform: scale(1);
  }
}
</style>

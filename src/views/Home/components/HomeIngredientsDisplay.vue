<script setup lang="ts">
import AppEmoji from "@/components/common/AppEmoji.vue";
import AppButton from "@/components/common/AppButton.vue";
import IngredientTag from "@/components/common/IngredientTag.vue";
import { useIngredientsStore } from "@/stores/ingredients";
import { useCocktailsStore } from "@/stores/cocktails";
import type { MatchMode } from "@/composables/useCocktailMatcher";

const ingredientsStore = useIngredientsStore();
const cocktailsStore = useCocktailsStore();

const tagColors = ["coral", "blue", "teal", "purple", "gold"] as const;
function getTagColor(index: number) {
  return tagColors[index % tagColors.length];
}

function refreshMatches() {
  if (ingredientsStore.selectedIds.length > 0) {
    cocktailsStore.findMatches(ingredientsStore.selectedIds, 0);
  }
}

function setMatchModeAndRefresh(mode: MatchMode) {
  cocktailsStore.setMatchMode(mode);
  refreshMatches();
}

function toggleSubstitution() {
  cocktailsStore.setAllowSubstitution(!cocktailsStore.allowSubstitution);
  refreshMatches();
}

function handleRemoveIngredient(id: number) {
  ingredientsStore.removeIngredient(id);
}
</script>

<template>
  <div class="ingredients-display">
    <div class="ingredients-display__header">
      <div class="ingredients-display__label">
        <span class="ingredients-display__count">{{
          ingredientsStore.selectionCount
        }}</span>
        ingredients selected
      </div>

      <!-- Search Controls -->
      <div class="search-controls">
        <!-- Match Mode Toggle -->
        <div class="match-mode-toggle">
          <button
            class="match-mode-btn"
            :class="{
              'match-mode-btn--active': cocktailsStore.matchMode === 'all',
            }"
            @click="setMatchModeAndRefresh('all')"
          >
            All
          </button>
          <button
            class="match-mode-btn"
            :class="{
              'match-mode-btn--active': cocktailsStore.matchMode === 'any',
            }"
            @click="setMatchModeAndRefresh('any')"
          >
            Any
          </button>
        </div>

        <!-- Fuzzy/Substitutions Toggle -->
        <button
          class="fuzzy-toggle-btn"
          :class="{
            'fuzzy-toggle-btn--active': cocktailsStore.allowSubstitution,
          }"
          @click="toggleSubstitution"
          title="Allow ingredient substitutions (e.g. Jack Daniels ≈ Whiskey)"
        >
          <AppEmoji class="fuzzy-toggle-btn__icon">🔄</AppEmoji>
          {{ cocktailsStore.allowSubstitution ? "Fuzzy Match" : "Exact Match" }}
        </button>
      </div>
    </div>

    <TransitionGroup
      name="tags"
      tag="div"
      class="selected-tags"
      :duration="400"
    >
      <div
        v-for="(ingredient, idx) in ingredientsStore.selectedIngredients"
        :key="ingredient.id"
        class="tag-wrapper"
      >
        <IngredientTag
          :name="ingredient.name"
          :color="getTagColor(idx)"
          @remove="handleRemoveIngredient(ingredient.id)"
        />
      </div>
    </TransitionGroup>

    <AppButton
      v-if="ingredientsStore.selectionCount > 1"
      variant="ghost"
      size="sm"
      @click="ingredientsStore.clearSelection()"
    >
      Clear all
    </AppButton>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.ingredients-display {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: $space-lg;
  background: rgba(white, 0.6);
  backdrop-filter: blur(10px);
  border-radius: $radius-xl;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-md;

    @include mobile-only {
      flex-direction: column;
      gap: $space-sm;
    }
  }

  &__label {
    font-size: $font-size-body-sm;
    color: $text-dark-muted;
  }

  &__count {
    font-weight: $font-weight-bold;
    color: $accent-coral;
  }
}

.search-controls {
  display: flex;
  align-items: center;
  gap: $space-sm;

  @include mobile-only {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.match-mode-toggle {
  display: flex;
  background: $surface-light-300;
  border-radius: $radius-full;
  padding: $space-2xs;
  box-shadow: $shadow-light-inset-sm;
}

.match-mode-btn {
  padding: $space-2xs $space-md;
  font-family: $font-body;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
  color: $text-dark-muted;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(&--active) {
    color: $text-dark-primary;
  }

  &--active {
    background: white;
    color: $accent-coral;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.fuzzy-toggle-btn {
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-2xs $space-md;
  height: 36px;
  background: $surface-light-300;
  border: none;
  border-radius: $radius-full;
  font-family: $font-body;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
  color: $text-dark-muted;
  cursor: pointer;
  transition: all $transition-fast;
  box-shadow: $shadow-light-inset-sm;

  &__icon {
    font-size: 1.1em;
    transition: transform $transition-normal;
  }

  &:hover {
    color: $text-dark-primary;
    background: darken($surface-light-300, 5%);
  }

  &--active {
    background: rgba($accent-teal, 0.1);
    color: $accent-teal;
    box-shadow: 0 0 0 1px $accent-teal inset;

    .fuzzy-toggle-btn__icon {
      transform: rotate(180deg);
    }
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
  justify-content: center;
  margin-bottom: $space-md;
  position: relative; // Required for absolute positioning of leaving items
}

.tag-wrapper {
  display: inline-block;
}

// Transitions
.tags-move {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tags-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tags-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.tags-leave-active {
  position: absolute;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tags-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>

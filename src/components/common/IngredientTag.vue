<script setup lang="ts">
/**
 * IngredientTag - Colorful Pill Tag
 */
import { formatIngredientName } from "@/utils/cocktailUtils";

interface Props {
  name: string;
  removable?: boolean;
  color?: "coral" | "blue" | "teal" | "purple" | "gold";
}

const props = withDefaults(defineProps<Props>(), {
  removable: true,
  color: "coral",
});

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <span class="ingredient-tag" :class="`ingredient-tag--${color}`">
    <span class="ingredient-tag__icon">🍊</span>
    <span class="ingredient-tag__name">{{ formatIngredientName(name) }}</span>
    <button
      v-if="removable"
      type="button"
      class="ingredient-tag__remove"
      :aria-label="`Remove ${name}`"
      @click.stop="emit('remove')"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </span>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.ingredient-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-xs;
  height: 44px;
  padding: 0 $space-sm 0 $space-md;
  border-radius: $radius-full;
  font-family: $font-display;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  white-space: nowrap;
  animation: pop-in 0.3s $spring-bounce forwards;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  // Color variants
  &--coral {
    background: linear-gradient(
      135deg,
      $accent-coral 0%,
      $accent-coral-dark 100%
    );
    color: white;
  }

  &--blue {
    background: linear-gradient(
      135deg,
      $accent-blue 0%,
      $accent-blue-dark 100%
    );
    color: white;
  }

  &--teal {
    background: linear-gradient(
      135deg,
      $accent-teal 0%,
      $accent-teal-dark 100%
    );
    color: white;
  }

  &--purple {
    background: linear-gradient(
      135deg,
      $accent-purple 0%,
      $accent-purple-dark 100%
    );
    color: white;
  }

  &--gold {
    background: linear-gradient(
      135deg,
      $accent-gold 0%,
      $accent-gold-dark 100%
    );
    color: white;
  }

  &__icon {
    font-size: 1.1em;
  }

  &__name {
    letter-spacing: 0.01em;
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-left: $space-2xs;
    padding: 0;
    background: rgba(255, 255, 255, 0.25);
    border: none;
    border-radius: $radius-full;
    color: white;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.4);
      transform: scale(1.15) rotate(90deg);
    }
  }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

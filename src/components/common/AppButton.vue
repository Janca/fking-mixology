<script setup lang="ts">
/**
 * AppButton - Modern Neumorphic Button
 */
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "ghost" | "coral" | "dark" | "teal";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
  fullWidth: false,
  rounded: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const classes = computed(() => [
  "app-btn",
  `app-btn--${props.variant}`,
  `app-btn--${props.size}`,
  {
    "app-btn--disabled": props.disabled || props.loading,
    "app-btn--loading": props.loading,
    "app-btn--full": props.fullWidth,
    "app-btn--rounded": props.rounded,
  },
]);

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
}
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="app-btn__loader">
      <span class="app-btn__loader-dot" />
      <span class="app-btn__loader-dot" />
      <span class="app-btn__loader-dot" />
    </span>
    <span
      class="app-btn__content"
      :class="{ 'app-btn__content--hidden': loading }"
    >
      <slot />
    </span>
  </button>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-xs;
  font-family: $font-display;
  font-weight: $font-weight-semibold;
  border: none;
  cursor: pointer;
  transition: all $transition-normal;
  position: relative;
  white-space: nowrap;
  letter-spacing: 0.01em;

  // Sizes
  &--sm {
    height: 40px;
    padding: 0 $space-md;
    font-size: $font-size-body-sm;
    border-radius: $radius-md;
  }

  &--md {
    height: 52px;
    padding: 0 $space-lg;
    font-size: $font-size-body;
    border-radius: $radius-lg;
  }

  &--lg {
    height: 60px;
    padding: 0 $space-xl;
    font-size: $font-size-body-lg;
    border-radius: $radius-xl;
  }

  // Rounded variant
  &--rounded {
    border-radius: $radius-full;
  }

  // Primary - Coral gradient
  &--primary {
    background: $gradient-coral;
    color: white;
    box-shadow: $glow-coral;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px color.change($accent-coral, $alpha: 0.45);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 4px 20px color.change($accent-coral, $alpha: 0.3);
    }
  }

  // Secondary - Neumorphic light
  &--secondary {
    background: $surface-light-200;
    color: $text-dark-primary;
    box-shadow: $shadow-light-raised-sm;

    &:hover:not(:disabled) {
      background: $surface-light-100;
      box-shadow: $shadow-light-raised;
    }

    &:active:not(:disabled) {
      box-shadow: $shadow-light-inset-sm;
    }
  }

  // Ghost - Minimal
  &--ghost {
    background: transparent;
    color: $text-dark-secondary;

    &:hover:not(:disabled) {
      background: color.adjust($surface-dark-300, $alpha: 0.08);
      color: $text-dark-primary;
    }
  }

  // Coral outline
  &--coral {
    background: transparent;
    color: $accent-coral;
    border: 2px solid $accent-coral;

    &:hover:not(:disabled) {
      background: $accent-coral;
      color: white;
      box-shadow: $glow-coral;
    }
  }

  // Dark - For light sections
  &--dark {
    background: $surface-dark-400;
    color: $text-light-primary;
    box-shadow: $shadow-dark-raised-sm;

    &:hover:not(:disabled) {
      background: $surface-dark-300;
      transform: translateY(-2px);
    }
  }

  // Teal - Solid filled
  &--teal {
    background: $accent-teal;
    color: white;
    box-shadow: $glow-teal;

    &:hover:not(:disabled) {
      background: color.adjust($accent-teal, $lightness: -5%);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px color.change($accent-teal, $alpha: 0.45);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 4px 20px color.change($accent-teal, $alpha: 0.3);
    }
  }

  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &--loading {
    cursor: wait;
  }

  &--full {
    width: 100%;
  }

  // Loader
  &__loader {
    position: absolute;
    display: flex;
    gap: 4px;
  }

  &__loader-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce-loader 0.6s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.1s;
    }

    &:nth-child(3) {
      animation-delay: 0.2s;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-xs;

    &--hidden {
      visibility: hidden;
    }
  }
}

@keyframes bounce-loader {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>

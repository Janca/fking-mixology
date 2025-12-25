<script setup lang="ts">
/**
 * AppInput - Modern Input with Neumorphic or Bordered styles
 */
import { computed, ref } from "vue";

type AccentColor = "coral" | "teal" | "blue" | "purple" | "gold";

interface Props {
  modelValue?: string;
  placeholder?: string;
  type?: "text" | "search" | "email" | "number";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  clearable?: boolean;
  /** Use bordered style instead of neumorphic */
  bordered?: boolean;
  /** Accent color for focus states (default: coral) */
  color?: AccentColor;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
  type: "text",
  disabled: false,
  size: "md",
  variant: "light",
  clearable: false,
  bordered: false,
  color: "coral",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [];
  blur: [];
  clear: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

const classes = computed(() => [
  "app-input",
  `app-input--${props.size}`,
  `app-input--${props.variant}`,
  `app-input--color-${props.color}`,
  {
    "app-input--focused": isFocused.value,
    "app-input--disabled": props.disabled,
    "app-input--has-value": !!props.modelValue,
    "app-input--bordered": props.bordered,
  },
]);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

function handleFocus() {
  isFocused.value = true;
  emit("focus");
}

function handleBlur() {
  isFocused.value = false;
  emit("blur");
}

function handleClear() {
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
}

function focus() {
  inputRef.value?.focus();
}

defineExpose({
  focus,
  inputRef,
});
</script>

<template>
  <div :class="classes">
    <div class="app-input__wrapper">
      <slot name="prefix" />

      <input ref="inputRef" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
        class="app-input__field" @input="handleInput" @focus="handleFocus" @blur="handleBlur" />

      <button v-if="clearable && modelValue" type="button" class="app-input__clear" tabindex="-1" @click="handleClear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <slot name="suffix" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

// Color map for accent colors
$accent-colors: (
  "coral": $accent-coral,
  "teal": $accent-teal,
  "blue": $accent-blue,
  "purple": $accent-purple,
  "gold": $accent-gold,
);

.app-input {
  width: 100%;

  &__wrapper {
    display: flex;
    align-items: center;
    gap: $space-sm;
    border-radius: $radius-xl;
    transition: all $transition-normal;
  }

  // ============================================
  // NEUMORPHIC STYLE (default)
  // ============================================

  // Light variant (for light backgrounds)
  &--light:not(.app-input--bordered) &__wrapper {
    background: $surface-light-100;
    box-shadow: $shadow-light-inset;
  }

  &--light:not(.app-input--bordered).app-input--focused &__wrapper {
    box-shadow: $shadow-light-inset,
      0 0 0 3px color.change($accent-coral, $alpha: 0.15);
  }

  // Dark variant (for dark backgrounds)
  &--dark:not(.app-input--bordered) &__wrapper {
    background: $surface-dark-400;
    box-shadow: $shadow-dark-inset;
  }

  &--dark:not(.app-input--bordered).app-input--focused &__wrapper {
    box-shadow: $shadow-dark-inset,
      0 0 0 3px color.change($accent-coral, $alpha: 0.3);
  }

  // ============================================
  // BORDERED STYLE (alternative)
  // ============================================

  &--bordered.app-input--light &__wrapper {
    background: $surface-light-200;
    border: 1px solid color.change($surface-light-400, $alpha: 0.5);
    box-shadow: inset 0 1px 2px color.change(#000, $alpha: 0.03);
  }

  &--bordered.app-input--dark &__wrapper {
    background: color.change($surface-dark-400, $alpha: 0.8);
    border: 1px solid color.change(#fff, $alpha: 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  // Bordered focus states with color variants
  @each $name, $color in $accent-colors {
    &--bordered.app-input--color-#{$name}.app-input--focused.app-input--light &__wrapper {
      background: $surface-light-100;
      border-color: $color;
      box-shadow: 0 0 0 4px color.change($color, $alpha: 0.12),
        inset 0 1px 2px color.change(#000, $alpha: 0.02);
    }

    &--bordered.app-input--color-#{$name}.app-input--focused.app-input--dark &__wrapper {
      border-color: $color;
      box-shadow: 0 0 0 4px color.change($color, $alpha: 0.2);
    }
  }

  // Color variants for neumorphic focus states
  @each $name, $color in $accent-colors {
    &--color-#{$name}:not(.app-input--bordered).app-input--focused.app-input--light &__wrapper {
      box-shadow: $shadow-light-inset,
        0 0 0 3px color.change($color, $alpha: 0.15);
    }

    &--color-#{$name}:not(.app-input--bordered).app-input--focused.app-input--dark &__wrapper {
      box-shadow: $shadow-dark-inset,
        0 0 0 3px color.change($color, $alpha: 0.25);
    }
  }

  // Dark variant text colors
  &--dark &__field {
    color: $text-light-primary;

    &::placeholder {
      color: $text-light-muted;
    }
  }

  // Sizes
  &--sm &__wrapper {
    height: 44px;
    padding: 0 $space-md;
    border-radius: $radius-lg;
  }

  &--md &__wrapper {
    height: 56px;
    padding: 0 $space-lg;
  }

  &--lg &__wrapper {
    height: 64px;
    padding: 0 $space-xl;
    border-radius: $radius-2xl;
  }

  // Bordered sizes adjust border-radius
  &--bordered.app-input--sm &__wrapper {
    border-radius: $radius-full;
  }

  &--bordered.app-input--md &__wrapper {
    border-radius: $radius-xl;
  }

  &--bordered.app-input--lg &__wrapper {
    border-radius: $radius-2xl;
  }

  &--disabled &__wrapper {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__field {
    flex: 1;
    background: transparent;
    border: none;
    color: $text-dark-primary;
    font-family: $font-body;
    font-size: inherit;
    font-weight: $font-weight-medium;
    outline: none;

    // Remove native browser styling
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    // Remove search input styling in webkit
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      -webkit-appearance: none;
      display: none;
    }

    &:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }

    &::placeholder {
      color: $text-dark-muted;
      font-weight: $font-weight-regular;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &--sm &__field {
    font-size: $font-size-body-sm;
  }

  &--md &__field {
    font-size: $font-size-body;
  }

  &--lg &__field {
    font-size: $font-size-body-lg;
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: $surface-light-400;
    border: none;
    border-radius: $radius-full;
    color: $text-dark-muted;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $accent-coral;
      color: white;
      transform: scale(1.1);
    }
  }

  &--dark &__clear {
    background: $surface-dark-200;
    color: $text-light-muted;

    &:hover {
      background: $accent-coral;
      color: white;
    }
  }
}
</style>

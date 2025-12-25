<script setup lang="ts">
/**
 * AppNumberInput - Reusable number input with increment/decrement buttons
 */
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        /** Current value */
        modelValue: number;
        /** Minimum value */
        min?: number;
        /** Maximum value */
        max?: number;
        /** Step value for increment/decrement */
        step?: number;
        /** Visual variant */
        variant?: "light" | "dark";
        /** Size of the input */
        size?: "sm" | "md" | "lg";
        /** Disabled state */
        disabled?: boolean;
        /** Show unit suffix */
        suffix?: string;
    }>(),
    {
        min: 0,
        max: 10000,
        step: 50,
        variant: "light",
        size: "md",
        disabled: false,
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: number): void;
}>();

const displayValue = computed({
    get: () => props.modelValue,
    set: (val: number) => {
        const clamped = Math.max(props.min, Math.min(props.max, val));
        emit("update:modelValue", clamped);
    },
});

function increment() {
    if (!props.disabled) {
        const newValue = Math.min(props.max, props.modelValue + props.step);
        emit("update:modelValue", newValue);
    }
}

function decrement() {
    if (!props.disabled) {
        const newValue = Math.max(props.min, props.modelValue - props.step);
        emit("update:modelValue", newValue);
    }
}

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (!isNaN(value)) {
        displayValue.value = value;
    }
}

function handleBlur() {
    // Ensure value is clamped on blur
    displayValue.value = props.modelValue;
}
</script>

<template>
    <div class="app-number-input" :class="[
        `app-number-input--${variant}`,
        `app-number-input--${size}`,
        { 'app-number-input--disabled': disabled },
    ]">
        <button type="button" class="app-number-input__btn app-number-input__btn--decrement"
            :disabled="disabled || modelValue <= min" @click="decrement" aria-label="Decrease value">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        </button>

        <div class="app-number-input__field">
            <input type="number" :value="displayValue" :min="min" :max="max" :disabled="disabled"
                class="app-number-input__input" @input="handleInput" @blur="handleBlur" />
            <span v-if="suffix" class="app-number-input__suffix">{{
                suffix
                }}</span>
        </div>

        <button type="button" class="app-number-input__btn app-number-input__btn--increment"
            :disabled="disabled || modelValue >= max" @click="increment" aria-label="Increase value">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-number-input {
    display: inline-flex;
    align-items: stretch;
    border-radius: $radius-lg;
    overflow: hidden;
    transition: all $transition-normal;

    &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: all $transition-fast;
        flex-shrink: 0;

        svg {
            width: 16px;
            height: 16px;
        }

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        &:not(:disabled):hover {
            transform: scale(1.05);
        }

        &:not(:disabled):active {
            transform: scale(0.95);
        }
    }

    &__field {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        min-width: 0;
    }

    &__input {
        width: 100%;
        text-align: center;
        background: transparent;
        border: none;
        font-family: $font-mono;
        font-weight: $font-weight-bold;

        &:focus {
            outline: none;
        }

        // Hide spin buttons
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            appearance: none;
        }

        -moz-appearance: textfield;
        appearance: textfield;
    }

    &__suffix {
        font-size: 0.85em;
        opacity: 0.7;
        margin-left: 2px;
        font-weight: $font-weight-medium;
    }

    // Light variant
    &--light {
        background: linear-gradient(135deg,
                $surface-light-200 0%,
                $surface-light-300 100%);
        border: 1px solid color.change($surface-light-400, $alpha: 0.5);
        box-shadow: inset 0 1px 2px color.change(#000, $alpha: 0.03);

        .app-number-input__btn {
            background: transparent;
            color: $text-dark-primary;

            &:not(:disabled):hover {
                background: $surface-light-100;
                color: $accent-coral;
            }

            &:not(:disabled):active {
                background: $surface-light-300;
            }
        }

        .app-number-input__input {
            color: $text-dark-primary;
        }

        .app-number-input__suffix {
            color: $text-dark-muted;
        }

        &:focus-within {
            border-color: $accent-coral;
            box-shadow: 0 0 0 3px color.change($accent-coral, $alpha: 0.12),
                inset 0 1px 2px color.change(#000, $alpha: 0.03);
        }
    }

    // Dark variant
    &--dark {
        background: linear-gradient(135deg,
                $surface-dark-300 0%,
                $surface-dark-400 100%);
        border: 1px solid color.change(#fff, $alpha: 0.08);

        .app-number-input__btn {
            background: transparent;
            color: $text-light-primary;

            &:not(:disabled):hover {
                background: $surface-dark-200;
                color: $accent-coral;
            }

            &:not(:disabled):active {
                background: $surface-dark-400;
            }
        }

        .app-number-input__input {
            color: $text-light-primary;
        }

        .app-number-input__suffix {
            color: $text-light-muted;
        }

        &:focus-within {
            border-color: $accent-coral;
            box-shadow: 0 0 0 3px color.change($accent-coral, $alpha: 0.2);
        }
    }

    // Sizes
    &--sm {
        height: 36px;
        border-radius: $radius-md;

        .app-number-input__btn {
            width: 32px;
        }

        .app-number-input__input {
            font-size: $font-size-body-sm;
        }
    }

    &--md {
        height: 44px;

        .app-number-input__btn {
            width: 40px;
        }

        .app-number-input__input {
            font-size: $font-size-body-sm;
        }
    }

    &--lg {
        height: 52px;
        border-radius: $radius-xl;

        .app-number-input__btn {
            width: 48px;

            svg {
                width: 20px;
                height: 20px;
            }
        }

        .app-number-input__input {
            font-size: $font-size-body;
        }
    }

    // Disabled
    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
}
</style>

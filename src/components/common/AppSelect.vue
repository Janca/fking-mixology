<script setup lang="ts">
/**
 * AppSelect - Reusable styled select dropdown component
 */
import { ref, computed } from "vue";

export interface SelectOption {
    value: string | number;
    label: string;
    icon?: string;
}

const props = withDefaults(
    defineProps<{
        /** Currently selected value */
        modelValue: string | number;
        /** Array of options */
        options: SelectOption[];
        /** Placeholder text when no selection */
        placeholder?: string;
        /** Visual variant */
        variant?: "light" | "dark";
        /** Size of the select */
        size?: "sm" | "md" | "lg";
        /** Disabled state */
        disabled?: boolean;
    }>(),
    {
        placeholder: "Select an option",
        variant: "light",
        size: "md",
        disabled: false,
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number): void;
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const selectedOption = computed(() =>
    props.options.find((opt) => opt.value === props.modelValue)
);

function toggleDropdown() {
    if (!props.disabled) {
        isOpen.value = !isOpen.value;
    }
}

function selectOption(option: SelectOption) {
    emit("update:modelValue", option.value);
    isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
    if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
        isOpen.value = false;
    } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown();
    }
}

// Add/remove click outside listener
import { onUnmounted, watch } from "vue";

watch(isOpen, (open) => {
    if (open) {
        document.addEventListener("click", handleClickOutside);
    } else {
        document.removeEventListener("click", handleClickOutside);
    }
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
    <div ref="selectRef" class="app-select" :class="[
        `app-select--${variant}`,
        `app-select--${size}`,
        { 'app-select--open': isOpen, 'app-select--disabled': disabled },
    ]" tabindex="0" role="combobox" :aria-expanded="isOpen" @click="toggleDropdown" @keydown="handleKeydown">
        <div class="app-select__trigger">
            <span v-if="selectedOption" class="app-select__value">
                <span v-if="selectedOption.icon" class="app-select__icon">{{
                    selectedOption.icon
                    }}</span>
                {{ selectedOption.label }}
            </span>
            <span v-else class="app-select__placeholder">{{ placeholder }}</span>

            <svg class="app-select__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>

        <Transition name="dropdown">
            <div v-if="isOpen" class="app-select__dropdown">
                <button v-for="option in options" :key="option.value" class="app-select__option" :class="{
                    'app-select__option--selected':
                        option.value === modelValue,
                }" @click.stop="selectOption(option)">
                    <span v-if="option.icon" class="app-select__option-icon">{{
                        option.icon
                        }}</span>
                    {{ option.label }}
                    <svg v-if="option.value === modelValue" class="app-select__check" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </button>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-select {
    position: relative;
    display: inline-flex;
    min-width: 120px;
    cursor: pointer;
    user-select: none;

    &:focus {
        outline: none;
    }

    &__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $space-sm;
        width: 100%;
        border-radius: $radius-lg;
        transition: all $transition-normal;
    }

    &__value {
        display: flex;
        align-items: center;
        gap: $space-xs;
        font-weight: $font-weight-medium;
    }

    &__placeholder {
        color: inherit;
        opacity: 0.6;
    }

    &__icon {
        font-size: 1.1em;
    }

    &__arrow {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transition: transform $transition-normal;
    }

    &--open &__arrow {
        transform: rotate(180deg);
    }

    &__dropdown {
        position: absolute;
        top: calc(100% + $space-xs);
        left: 0;
        right: 0;
        z-index: $z-dropdown;
        border-radius: $radius-lg;
        padding: $space-xs;
        max-height: 200px;
        overflow-y: auto;
    }

    &__option {
        display: flex;
        align-items: center;
        gap: $space-sm;
        width: 100%;
        padding: $space-sm $space-md;
        border: none;
        background: transparent;
        border-radius: $radius-md;
        font-size: inherit;
        font-weight: $font-weight-medium;
        text-align: left;
        cursor: pointer;
        transition: all $transition-fast;
    }

    &__option-icon {
        font-size: 1.1em;
    }

    &__check {
        width: 16px;
        height: 16px;
        margin-left: auto;
    }

    // Light variant
    &--light {
        .app-select__trigger {
            background: $surface-light-200;
            border: 1px solid color.change($surface-light-400, $alpha: 0.5);
            color: $text-dark-primary;
            box-shadow: 0 2px 4px color.change(#000, $alpha: 0.03);
        }

        &:hover .app-select__trigger {
            background: $surface-light-100;
            border-color: color.change($accent-coral, $alpha: 0.3);
        }

        &:focus .app-select__trigger,
        &.app-select--open .app-select__trigger {
            border-color: $accent-coral;
            box-shadow: 0 0 0 3px color.change($accent-coral, $alpha: 0.12);
        }

        .app-select__dropdown {
            background: $surface-light-100;
            border: 1px solid color.change($surface-light-400, $alpha: 0.5);
            box-shadow: 0 8px 24px color.change(#000, $alpha: 0.12),
                0 4px 8px color.change(#000, $alpha: 0.06);
        }

        .app-select__option {
            color: $text-dark-primary;

            &:hover {
                background: $surface-light-200;
            }

            &--selected {
                background: color.change($accent-coral, $alpha: 0.1);
                color: $accent-coral;
            }
        }
    }

    // Dark variant
    &--dark {
        .app-select__trigger {
            background: $surface-dark-300;
            border: 1px solid color.change(#fff, $alpha: 0.08);
            color: $text-light-primary;
        }

        &:hover .app-select__trigger {
            background: $surface-dark-200;
            border-color: color.change(#fff, $alpha: 0.15);
        }

        &:focus .app-select__trigger,
        &.app-select--open .app-select__trigger {
            border-color: $accent-coral;
            box-shadow: 0 0 0 3px color.change($accent-coral, $alpha: 0.2);
        }

        .app-select__dropdown {
            background: $surface-dark-200;
            border: 1px solid color.change(#fff, $alpha: 0.1);
            box-shadow: 0 8px 24px color.change(#000, $alpha: 0.3);
        }

        .app-select__option {
            color: $text-light-primary;

            &:hover {
                background: $surface-dark-300;
            }

            &--selected {
                background: color.change($accent-coral, $alpha: 0.15);
                color: $accent-coral;
            }
        }
    }

    // Sizes
    &--sm .app-select__trigger {
        height: 36px;
        padding: 0 $space-sm;
        font-size: $font-size-body-sm;
    }

    &--md .app-select__trigger {
        height: 44px;
        padding: 0 $space-md;
        font-size: $font-size-body-sm;
    }

    &--lg .app-select__trigger {
        height: 52px;
        padding: 0 $space-lg;
        font-size: $font-size-body;
    }

    // Disabled
    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
}
</style>

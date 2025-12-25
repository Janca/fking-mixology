<script setup lang="ts">
/**
 * AppAutocomplete - Input with dropdown autocomplete functionality
 * Uses AppInput internally and supports custom rendering of dropdown items via scoped slots
 */
import { ref, computed, watch, onUnmounted } from "vue";
import AppInput from "./AppInput.vue";

export interface AutocompleteItem {
    id: string | number;
    [key: string]: unknown;
}

export type AccentColor = "coral" | "teal" | "blue" | "purple" | "gold";

const props = withDefaults(
    defineProps<{
        /** Current input value */
        modelValue: string;
        /** Array of items to show in dropdown */
        items: AutocompleteItem[];
        /** Whether dropdown is visible */
        showDropdown?: boolean;
        /** Placeholder text */
        placeholder?: string;
        /** Visual variant */
        variant?: "light" | "dark";
        /** Size of the input */
        size?: "sm" | "md" | "lg";
        /** Disabled state */
        disabled?: boolean;
        /** Show clear button */
        clearable?: boolean;
        /** Loading state */
        loading?: boolean;
        /** No results message */
        noResultsText?: string;
        /** Label key for default item rendering */
        itemLabelKey?: string;
        /** Use bordered style instead of neumorphic */
        bordered?: boolean;
        /** Accent color for focus states */
        color?: AccentColor;
        /** Teleport dropdown to another element (e.g. "body") to avoid z-index/overflow issues */
        teleportTo?: string | HTMLElement;
    }>(),
    {
        showDropdown: false,
        placeholder: "",
        variant: "light",
        size: "md",
        disabled: false,
        clearable: false,
        loading: false,
        noResultsText: "No results found",
        itemLabelKey: "name",
        bordered: false,
        color: "coral",
        teleportTo: undefined,
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
    (e: "update:showDropdown", value: boolean): void;
    (e: "input", value: string): void;
    (e: "focus"): void;
    (e: "blur"): void;
    (e: "clear"): void;
    (e: "select", item: AutocompleteItem): void;
}>();

const appInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<{ top: string; left: string; width: string }>({ top: '0', left: '0', width: 'auto' });

const classes = computed(() => [
    "app-autocomplete",
    `app-autocomplete--${props.variant}`,
    `app-autocomplete--${props.size}`,
    {
        "app-autocomplete--open": props.showDropdown,
        "app-autocomplete--loading": props.loading,
    },
]);

const dropdownClasses = computed(() => [
    "app-autocomplete__dropdown",
    {
        "app-autocomplete__dropdown--teleported": !!props.teleportTo,
    }
]);

// Update dropdown position when opened
function updateDropdownPosition() {
    if (!props.showDropdown || !wrapperRef.value) return;

    if (props.teleportTo) {
        const rect = wrapperRef.value.getBoundingClientRect();
        dropdownStyle.value = {
            top: `${rect.bottom + 8}px`, // 8px (space-xs) equivalent
            left: `${rect.left}px`,
            width: `${rect.width}px`
        };
    } else {
        dropdownStyle.value = { top: '', left: '', width: '' };
    }
}

function handleInput(value: string) {
    emit("update:modelValue", value);
    emit("input", value);
}

function handleFocus() {
    emit("focus");
}

function handleBlur() {
    // Small delay to allow click events on dropdown items to fire
    // But since we use mousedown.prevent on items, they fire before blur
    emit("blur");
}

function handleClear() {
    emit("update:modelValue", "");
    emit("clear");
    appInputRef.value?.focus();
}

function handleSelectItem(item: AutocompleteItem) {
    emit("select", item);
}

function handleClickOutside(event: MouseEvent) {
    // If teleporting, we need to check if click is inside the dropdown which is elsewhere in DOM
    const dropdownEl = document.querySelector(`.app-autocomplete__dropdown[data-uid="${uid}"]`);
    const isClickInDropdown = dropdownEl && dropdownEl.contains(event.target as Node);

    if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node) && !isClickInDropdown) {
        emit("update:showDropdown", false);
    }
}

// Generate a unique ID for targeting the specific dropdown
const uid = Math.random().toString(36).substr(2, 9);

watch(
    () => props.showDropdown,
    (open) => {
        if (open) {
            updateDropdownPosition();
            document.addEventListener("click", handleClickOutside);
            window.addEventListener("resize", updateDropdownPosition);
            window.addEventListener("scroll", updateDropdownPosition, true);
        } else {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", updateDropdownPosition);
            window.removeEventListener("scroll", updateDropdownPosition, true);
        }
    }
);

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", updateDropdownPosition);
    window.removeEventListener("scroll", updateDropdownPosition, true);
});

function focus() {
    appInputRef.value?.focus();
}

defineExpose({
    focus,
    appInputRef,
});
</script>

<template>
    <div ref="wrapperRef" :class="classes">
        <!-- AppInput with all props passed through -->
        <AppInput ref="appInputRef" :model-value="modelValue" :placeholder="placeholder" :variant="variant" :size="size"
            :disabled="disabled" :clearable="clearable && !loading" :bordered="bordered" :color="color" type="text"
            @update:model-value="handleInput" @focus="handleFocus" @blur="handleBlur" @clear="handleClear">
            <template #prefix>
                <slot name="prefix" />
            </template>
            <template #suffix>
                <!-- Loading spinner -->
                <div v-if="loading" class="app-autocomplete__loader">
                    <span class="app-autocomplete__loader-dot" />
                    <span class="app-autocomplete__loader-dot" />
                    <span class="app-autocomplete__loader-dot" />
                </div>
                <slot v-else name="suffix" />
            </template>
        </AppInput>

        <!-- Dropdown -->
        <Teleport :to="teleportTo" :disabled="!teleportTo">
            <Transition name="dropdown">
                <div v-if="showDropdown" :class="dropdownClasses" :style="teleportTo ? dropdownStyle : {}"
                    :data-uid="uid" :data-variant="variant">
                    <div class="app-autocomplete__scroller">
                        <!-- Items list -->
                        <template v-if="items.length > 0">
                            <button v-for="item in items" :key="item.id" class="app-autocomplete__item"
                                @mousedown.prevent="handleSelectItem(item)">
                                <!-- Custom item slot with scoped data -->
                                <slot name="item" :item="item">
                                    <!-- Default item rendering -->
                                    <span class="app-autocomplete__item-label">
                                        {{ item[itemLabelKey] }}
                                    </span>
                                </slot>
                            </button>
                        </template>

                        <!-- Empty state -->
                        <template v-else-if="!loading">
                            <slot name="empty">
                                <div class="app-autocomplete__empty">
                                    {{ noResultsText }}
                                </div>
                            </slot>
                        </template>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-autocomplete {
    position: relative;
    width: 100%;

    // Loader animation
    &__loader {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    &__loader-dot {
        width: 6px;
        height: 6px;
        background: $accent-coral;
        border-radius: 50%;
        animation: bounce-loader 0.6s ease-in-out infinite;

        &:nth-child(2) {
            animation-delay: 0.1s;
        }

        &:nth-child(3) {
            animation-delay: 0.2s;
        }
    }

    @keyframes bounce-loader {

        0%,
        100% {
            transform: translateY(0);
            opacity: 0.6;
        }

        50% {
            transform: translateY(-4px);
            opacity: 1;
        }
    }

    // Dropdown (Scoped styles that apply locally)
    &__dropdown {
        position: absolute;
        top: calc(100% + $space-xs);
        left: 0;
        right: 0;
        z-index: $z-dropdown;
        padding: $space-xs; // Outer padding to contain scroller
        border-radius: $radius-xl;

        // When teleported, it becomes fixed/absolute in body context, need z-index
        &--teleported {
            position: fixed;
            z-index: $z-modal + 10;
        }
    }

    // Inner scroll container
    &__scroller {
        max-height: 280px;
        overflow-y: auto;
        padding: $space-xs; // Inner padding for content spacing

        // Custom Scrollbar
        &::-webkit-scrollbar {
            width: 5px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: color.change($text-dark-muted, $alpha: 0.2);
            border-radius: $radius-full;

            &:hover {
                background: color.change($text-dark-muted, $alpha: 0.4);
            }
        }
    }

    // Use specific selectors that will work even when teleported if Vue's scoped styles follow the element
    // Vue scoped styles add data-v-xxx attributes to elements.
    // When teleported, elements retain these attributes.
    // So styles defined here SHOULD work if they target the classes directly.

    // Variant Styles - we use data-variant attribute for teleported support
    &--light &__dropdown,
    &__dropdown[data-variant="light"] {
        background: color.change($surface-light-100, $alpha: 0.92);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        box-shadow: 0 8px 32px color.change(#000, $alpha: 0.12),
            0 4px 16px color.change(#000, $alpha: 0.06);
        border: 1px solid color.change($surface-light-400, $alpha: 0.4);
        color: $text-dark-primary;
    }

    &--dark &__dropdown,
    &__dropdown[data-variant="dark"] {
        background: color.change($surface-dark-300, $alpha: 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        box-shadow: 0 8px 32px color.change(#000, $alpha: 0.3);
        border: 1px solid color.change(#fff, $alpha: 0.08);
        color: $text-light-primary;
    }

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
        cursor: pointer;
        transition: all $transition-normal;
        color: inherit;
    }

    // Item hover states
    // Since parent class might not be present when teleported, we rely on data-variant from dropdown
    &--light &__item,
    &__dropdown[data-variant="light"] &__item {
        color: $text-dark-primary;

        &:hover {
            background: color.change(#fff, $alpha: 0.7);
            transform: translateX(4px);
            box-shadow: 0 2px 8px color.change(#000, $alpha: 0.05);
        }

        &:active {
            background: color.change(#fff, $alpha: 0.9);
            transform: translateX(2px);
        }
    }

    &--dark &__item,
    &__dropdown[data-variant="dark"] &__item {
        color: $text-light-primary;

        &:hover {
            background: color.change($surface-dark-200, $alpha: 0.6);
            transform: translateX(4px);
        }

        &:active {
            background: color.change($surface-dark-200, $alpha: 0.8);
            transform: translateX(2px);
        }
    }

    &__item-label {
        flex: 1;
        font-weight: $font-weight-medium;
    }

    &__empty {
        padding: $space-lg;
        text-align: center;
        color: $text-dark-muted;
        font-size: $font-size-body-sm;
    }

    &--dark &__empty,
    &__dropdown[data-variant="dark"] &__empty {
        color: $text-light-muted;
    }
}

// Dropdown transitions
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>

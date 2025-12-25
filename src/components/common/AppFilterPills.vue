<script setup lang="ts">
/**
 * AppFilterPills - Reusable filter pill buttons with multiple style variants
 */
export interface FilterOption {
    id: string | number;
    label: string;
    icon?: string;
}

defineProps<{
    /** Array of filter options */
    options: FilterOption[];
    /** Currently selected option ID */
    modelValue: string | number;
    /** Visual variant */
    variant?: "glass" | "neumorphic";
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number): void;
}>();
</script>

<template>
    <div class="app-filter-pills" :class="[`app-filter-pills--${variant || 'glass'}`]">
        <button v-for="option in options" :key="option.id" class="filter-pill"
            :class="{ 'filter-pill--active': modelValue === option.id }" @click="emit('update:modelValue', option.id)">
            <span v-if="option.icon" class="filter-pill__icon">{{ option.icon }}</span>
            <span class="filter-pill__label">{{ option.label }}</span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-filter-pills {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: $space-sm;
    max-width: 900px;
    margin: 0 auto;

    @include mobile-only {
        gap: $space-xs;
    }

    // Glass variant (Achievements style)
    &--glass {
        .filter-pill {
            padding: $space-sm $space-lg;
            border-radius: $radius-full;
            border: 1px solid color.change(#fff, $alpha: 0.2);
            background: color.change(#fff, $alpha: 0.7);
            backdrop-filter: blur(5px);
            color: $text-dark-secondary;
            font-weight: $font-weight-semibold;
            font-size: $font-size-body-sm;
            cursor: pointer;
            transition: all $transition-fast;
            box-shadow: 0 2px 4px color.change(#000, $alpha: 0.05);

            &:hover {
                background: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px color.change(#000, $alpha: 0.1);
            }

            &--active {
                background: $gradient-blue;
                color: white;
                border-color: $accent-purple;
                box-shadow: $glow-purple, 0 4px 8px color.change($accent-purple, $alpha: 0.3);
                transform: translateY(-2px);

                &:hover {
                    color: $accent-purple;
                }
            }
        }
    }

    // Neumorphic variant (Browse style)
    &--neumorphic {
        .filter-pill {
            display: flex;
            align-items: center;
            gap: $space-xs;
            padding: $space-sm $space-lg;
            background: $surface-light-100;
            border: none;
            border-radius: $radius-full;
            font-family: $font-display;
            font-size: $font-size-body-sm;
            font-weight: $font-weight-semibold;
            color: $text-dark-secondary;
            cursor: pointer;
            transition: all $transition-normal;
            box-shadow: $shadow-light-raised-sm;

            @include mobile-only {
                padding: $space-xs $space-sm;
                font-size: $font-size-caption;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: $shadow-light-raised;
            }

            &--active {
                background: $gradient-coral;
                color: white;
                box-shadow: $glow-coral;

                &:hover {
                    box-shadow: 0 12px 40px color.change($surface-light-100, $alpha: 0.4);
                }
            }

            .filter-pill__icon {
                font-size: 1.1em;
            }
        }
    }
}

.filter-pill {
    display: inline-flex;
    align-items: center;

    &__icon {
        display: inline-block;
    }

    &__label {
        display: inline-block;
    }
}
</style>

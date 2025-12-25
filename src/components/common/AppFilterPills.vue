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
            border: 1px solid color.change(#fff, $alpha: 0.25);
            background: linear-gradient(135deg,
                    color.change(#fff, $alpha: 0.8) 0%,
                    color.change(#fff, $alpha: 0.6) 100%);
            backdrop-filter: blur(8px) saturate(150%);
            -webkit-backdrop-filter: blur(8px) saturate(150%);
            color: $text-dark-secondary;
            font-weight: $font-weight-semibold;
            font-size: $font-size-body-sm;
            cursor: pointer;
            transition: all $transition-normal;
            box-shadow: 0 2px 8px color.change(#000, $alpha: 0.04),
                inset 0 1px 0 color.change(#fff, $alpha: 0.5);

            &:hover {
                background: linear-gradient(135deg,
                        color.change(#fff, $alpha: 0.95) 0%,
                        color.change(#fff, $alpha: 0.85) 100%);
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 8px 16px color.change(#000, $alpha: 0.08);
                border-color: color.change($accent-purple, $alpha: 0.3);
            }

            &--active {
                background: $gradient-blue;
                color: white;
                border-color: $accent-purple;
                box-shadow: 0 4px 16px color.change($accent-purple, $alpha: 0.35),
                    0 8px 24px color.change($accent-purple, $alpha: 0.2);
                transform: translateY(-2px);
                text-shadow: 0 1px 2px color.change(#000, $alpha: 0.15);

                &:hover {
                    color: $accent-purple;
                    transform: translateY(-4px) scale(1.02);
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
            border: 1px solid color.change($surface-light-400, $alpha: 0.4);
            border-radius: $radius-full;
            font-family: $font-display;
            font-size: $font-size-body-sm;
            font-weight: $font-weight-semibold;
            color: $text-dark-secondary;
            cursor: pointer;
            transition: all $transition-normal;
            box-shadow: 0 2px 8px color.change(#000, $alpha: 0.04),
                0 4px 16px color.change(#000, $alpha: 0.02);

            @include mobile-only {
                padding: $space-xs $space-md;
                font-size: $font-size-caption;
            }

            &:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 6px 20px color.change(#000, $alpha: 0.08),
                    0 12px 32px color.change(#000, $alpha: 0.04);
                border-color: color.change($accent-coral, $alpha: 0.3);
            }

            &--active {
                background: linear-gradient(135deg,
                        $accent-coral 0%,
                        $accent-coral-dark 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 16px color.change($accent-coral, $alpha: 0.35),
                    0 8px 24px color.change($accent-coral, $alpha: 0.2);
                text-shadow: 0 1px 2px color.change(#000, $alpha: 0.15);

                &:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 8px 24px color.change($accent-coral, $alpha: 0.45),
                        0 12px 32px color.change($accent-coral, $alpha: 0.25);
                }
            }

            .filter-pill__icon {
                font-size: 1.1em;
                transition: transform $transition-normal;
            }

            &:hover .filter-pill__icon {
                transform: scale(1.1);
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

<script setup lang="ts">
/**
 * AppCard - Reusable card component
 */
defineProps<{
    /** Optional card variant */
    variant?: "light" | "dark" | "glass";
    /** Optional hover effect */
    hoverable?: boolean;
    /** Optional padding size */
    padding?: "sm" | "md" | "lg" | "xl";
}>();
</script>

<template>
    <div class="app-card" :class="[
        `app-card--${variant || 'dark'}`,
        `app-card--padding-${padding || 'lg'}`,
        { 'app-card--hoverable': hoverable },
    ]">
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-card {
    border-radius: $radius-xl;
    transition: all $transition-normal;
    position: relative;

    &--light {
        background: $surface-light-100;
        color: $text-dark-primary;
        border: 1px solid color.change($surface-light-400, $alpha: 0.5);
        box-shadow: 0 2px 8px color.change(#000, $alpha: 0.04),
            0 4px 16px color.change(#000, $alpha: 0.02);
    }

    &--dark {
        background: linear-gradient(135deg,
                $surface-dark-300 0%,
                color.adjust($surface-dark-300, $lightness: -2%) 100%);
        color: $text-light-primary;
        border: 1px solid color.change(#fff, $alpha: 0.05);
        box-shadow: 0 4px 12px color.change(#000, $alpha: 0.2),
            0 8px 24px color.change(#000, $alpha: 0.15);
    }

    &--glass {
        background: linear-gradient(135deg,
                color.change(#fff, $alpha: 0.18),
                color.change(#fff, $alpha: 0.06));
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid color.change(#fff, $alpha: 0.25);
        box-shadow: 0 4px 24px color.change(#000, $alpha: 0.08),
            inset 0 1px 1px color.change(#fff, $alpha: 0.1);
    }

    &--hoverable {
        cursor: pointer;

        &:hover {
            transform: translateY(-4px);
        }

        &.app-card--light:hover {
            box-shadow: 0 8px 24px color.change(#000, $alpha: 0.08),
                0 16px 40px color.change(#000, $alpha: 0.04);
        }

        &.app-card--dark:hover {
            box-shadow: 0 12px 32px color.change(#000, $alpha: 0.3),
                0 20px 48px color.change(#000, $alpha: 0.2);
        }

        &.app-card--glass:hover {
            box-shadow: 0 8px 32px color.change(#000, $alpha: 0.12),
                inset 0 1px 1px color.change(#fff, $alpha: 0.15);
            border-color: color.change(#fff, $alpha: 0.35);
        }

        &:active {
            transform: translateY(-2px);
        }
    }

    &--padding-sm {
        padding: $space-md;
    }

    &--padding-md {
        padding: $space-lg;
    }

    &--padding-lg {
        padding: $space-xl;
    }

    &--padding-xl {
        padding: $space-2xl;
    }
}
</style>

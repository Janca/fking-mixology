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
    border-radius: $radius-lg;
    border: 1px solid color.change(#fff, $alpha: 0.05);
    transition: all $transition-normal;

    &--light {
        background: $surface-light-100;
        color: $text-dark-primary;
    }

    &--dark {
        background: $surface-dark-200;
        color: $text-light-primary;
    }

    &--glass {
        background: linear-gradient(135deg,
                color.change(#fff, $alpha: 0.15),
                color.change(#fff, $alpha: 0.05));
        backdrop-filter: blur(10px);
        border: 1px solid color.change(#fff, $alpha: 0.2);
    }

    &--hoverable:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px color.change(#000, $alpha: 0.15);
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

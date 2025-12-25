<script setup lang="ts">
/**
 * AppProgressBar - Reusable animated progress bar component
 */
defineProps<{
    /** Current progress percentage (0-100) */
    progress: number;
    /** Optional variant for different color schemes */
    variant?: "default" | "gradient" | "gold";
    /** Show shimmer animation */
    animated?: boolean;
    /** Size of the progress bar */
    size?: "sm" | "md" | "lg";
}>();
</script>

<template>
    <div class="app-progress" :class="[`app-progress--${size || 'md'}`]">
        <div class="app-progress__track">
            <div class="app-progress__fill" :class="[
                `app-progress__fill--${variant || 'default'}`,
                { 'app-progress__fill--animated': animated },
            ]" :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-progress {
    width: 100%;

    &__track {
        background: color.change(#000, $alpha: 0.15);
        border-radius: $radius-full;
        overflow: hidden;
        box-shadow: inset 0 2px 4px color.change(#000, $alpha: 0.1);
    }

    &__fill {
        height: 100%;
        transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;

        &--default {
            background: $accent-blue;
        }

        &--gradient {
            background: linear-gradient(90deg,
                    $accent-blue,
                    $accent-purple,
                    $accent-gold );
        }

        &--gold {
            background: $gradient-gold;
        }

        &--animated::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg,
                    transparent,
                    color.change(#fff, $alpha: 0.3),
                    transparent);
            animation: shimmer 2s infinite;
        }
    }

    &--sm &__track {
        height: 6px;
    }

    &--md &__track {
        height: 16px;
    }

    &--lg &__track {
        height: 24px;
    }
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}
</style>

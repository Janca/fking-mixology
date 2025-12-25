<script setup lang="ts">
/**
 * AchievementsProgress - Overall progress display for achievements
 */
import AppProgressBar from "@/components/common/AppProgressBar.vue";

defineProps<{
    /** Total number of unlocked achievements */
    totalUnlocked: number;
    /** Total number of achievements */
    totalAchievements: number;
    /** Progress percentage (0-100) */
    progressPercentage: number;
}>();
</script>

<template>
    <div class="achievements-progress">
        <div class="achievements-progress__info">
            <span class="achievements-progress__label">Completion</span>
            <span class="achievements-progress__value">{{ totalUnlocked }} / {{ totalAchievements }}</span>
        </div>
        <AppProgressBar :progress="progressPercentage" variant="gradient" animated size="md" />
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.achievements-progress {
    max-width: 900px;
    margin: 0 auto $space-xl;
    text-align: center;
    background: linear-gradient(135deg,
            color.change(#fff, $alpha: 0.2),
            color.change(#fff, $alpha: 0.08));
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    padding: $space-xl;
    border-radius: $radius-2xl;
    border: 1px solid color.change(#fff, $alpha: 0.25);
    box-shadow: 0 8px 32px color.change(#000, $alpha: 0.08),
        0 2px 8px color.change(#000, $alpha: 0.04),
        inset 0 1px 0 color.change(#fff, $alpha: 0.3);
    position: relative;
    overflow: hidden;
    width: 100%;

    &::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: $radius-2xl;
        padding: 2px;
        background: linear-gradient(135deg,
                color.change($accent-gold, $alpha: 0.6),
                color.change($accent-purple, $alpha: 0.4),
                color.change($accent-blue, $alpha: 0.5),
                color.change($accent-gold, $alpha: 0.6));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.7;
        pointer-events: none;
        animation: border-shimmer 4s ease-in-out infinite;
    }

    &__info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: $font-weight-bold;
        margin-bottom: $space-md;
        font-size: $font-size-body;
        color: $text-dark-primary;
    }

    &__label {
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: $font-size-caption;
        font-weight: $font-weight-semibold;
        color: $text-dark-secondary;
    }

    &__value {
        font-family: $font-display;
        font-size: $font-size-h2;
        font-weight: $font-weight-extrabold;
        background: $gradient-gold;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: none;
    }
}

@keyframes border-shimmer {

    0%,
    100% {
        opacity: 0.5;
    }

    50% {
        opacity: 0.9;
    }
}
</style>

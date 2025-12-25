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
            color.change(#fff, $alpha: 0.15),
            color.change(#fff, $alpha: 0.05));
    backdrop-filter: blur(10px);
    padding: $space-lg;
    border-radius: $radius-xl;
    border: 1px solid color.change(#fff, $alpha: 0.2);
    box-shadow: 0 4px 12px color.change(#000, $alpha: 0.1);
    position: relative;
    overflow: hidden;
    width: 100%;

    &::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: $radius-xl;
        padding: 1px;
        background: linear-gradient(135deg,
                color.change($accent-gold, $alpha: 0.5),
                color.change($accent-purple, $alpha: 0.3),
                color.change($accent-blue, $alpha: 0.5));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.6;
        pointer-events: none;
    }

    &__info {
        display: flex;
        justify-content: space-between;
        font-weight: $font-weight-bold;
        margin-bottom: $space-sm;
        font-size: $font-size-body;
        color: $text-dark-primary;
    }

    &__label {
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-size: $font-size-body-sm;
    }

    &__value {
        font-family: $font-display;
        font-size: $font-size-h3;
        color: $accent-gold;
    }
}
</style>

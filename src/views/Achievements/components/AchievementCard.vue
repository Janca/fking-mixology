<script setup lang="ts">
/**
 * AchievementCard - Individual achievement card display
 */
import AppEmoji from "@/components/common/AppEmoji.vue";
import AppProgressBar from "@/components/common/AppProgressBar.vue";
import type { AchievementStatus } from "@/types/achievements";

defineProps<{
    /** Achievement data */
    achievement: AchievementStatus;
}>();

function formatDate(date: Date | undefined) {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function calculateProgress(achievement: AchievementStatus): number {
    if (!achievement.condition) return 0;
    return Math.min(
        100,
        (achievement.currentProgress / achievement.condition.threshold) * 100
    );
}
</script>

<template>
    <div class="achievement-card" :class="{
        'achievement-card--unlocked': achievement.isUnlocked,
        'achievement-card--hidden': achievement.isHidden && !achievement.isUnlocked,
    }">
        <div class="achievement-card__icon">
            <AppEmoji v-if="achievement.isHidden && !achievement.isUnlocked">❓</AppEmoji>
            <AppEmoji v-else>{{ achievement.icon || "🏆" }}</AppEmoji>
        </div>

        <div class="achievement-card__content">
            <div class="achievement-card__header">
                <h3 class="achievement-card__title">
                    <span v-if="achievement.isHidden && !achievement.isUnlocked">Hidden Cheevo</span>
                    <span v-else>{{ achievement.name }}</span>
                </h3>
                <span v-if="achievement.isUnlocked" class="achievement-card__date">
                    {{ formatDate(achievement.unlockedAt) }}
                </span>
            </div>

            <p class="achievement-card__desc">
                <template v-if="!achievement.isUnlocked">???</template>
                <template v-else>{{ achievement.description }}</template>
            </p>

            <p v-if="achievement.flavorText && (!achievement.isHidden || achievement.isUnlocked)"
                class="achievement-card__flavor">
                "{{ achievement.flavorText }}"
            </p>

            <!-- Progress Bar for achievements with conditions -->
            <div v-if="achievement.condition && achievement.isUnlocked" class="achievement-card__progress">
                <AppProgressBar :progress="calculateProgress(achievement)" variant="default" size="sm" />
                <span class="achievement-card__progress-text">
                    {{ achievement.currentProgress }} / {{ achievement.condition.threshold }}
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.achievement-card {
    display: flex;
    gap: $space-md;
    padding: $space-lg;
    background: linear-gradient(135deg,
            color.change($surface-dark-200, $alpha: 0.95),
            color.change($surface-dark-300, $alpha: 0.9));
    backdrop-filter: blur(10px);
    border-radius: $radius-lg;
    border: 1px solid color.change(#fff, $alpha: 0.08);
    transition: all $transition-normal;
    opacity: 0.65;
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg,
                $surface-dark-400,
                $surface-dark-300,
                $surface-dark-400 );
        opacity: 0.5;
    }

    &--unlocked {
        background: linear-gradient(135deg,
                color.change($surface-dark-300, $alpha: 0.98),
                color.change($surface-dark-400, $alpha: 0.95));
        border-color: color.change($accent-gold, $alpha: 0.3);
        opacity: 1;
        box-shadow: 0 4px 12px color.change(#000, $alpha: 0.2),
            0 0 0 1px color.change($accent-gold, $alpha: 0.1);

        &::before {
            background: $gradient-gold;
            opacity: 1;
            box-shadow: 0 0 10px color.change($accent-gold, $alpha: 0.5);
        }

        &:hover {
            transform: translateY(-4px) scale(1.01);
            border-color: $accent-gold;
            box-shadow: 0 8px 24px color.change(#000, $alpha: 0.3),
                0 0 0 1px $accent-gold,
                0 8px 32px color.change($accent-gold, $alpha: 0.35);
        }

        .achievement-card__icon {
            background: $gradient-gold;
            color: white;
            text-shadow: 0 2px 4px color.change(#000, $alpha: 0.3);
            box-shadow: 0 4px 12px color.change($accent-gold, $alpha: 0.4),
                inset 0 -2px 4px color.change(#000, $alpha: 0.2);
            position: relative;

            &::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: $radius-full;
                background: linear-gradient(135deg,
                        color.change(#fff, $alpha: 0.3),
                        transparent);
                animation: iconShine 3s ease-in-out infinite;
            }
        }

        .achievement-card__title {
            color: $accent-gold;
            text-shadow: 0 1px 2px color.change(#000, $alpha: 0.2);
        }
    }

    &--hidden {
        opacity: 0.4;
        filter: grayscale(0.5);
    }

    &__icon {
        flex-shrink: 0;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.25rem;
        background: linear-gradient(135deg, $surface-dark-400, $surface-dark-500);
        border-radius: $radius-full;
        color: $text-light-muted;
        border: 2px solid color.change(#fff, $alpha: 0.05);
        transition: all $transition-normal;
    }

    &__content {
        flex: 1;
        min-width: 0;
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: $space-xs;
        gap: $space-sm;
    }

    &__title {
        font-family: $font-display;
        font-weight: $font-weight-bold;
        font-size: $font-size-h3;
        color: $text-light-secondary;
        line-height: 1.3;
        margin: 0;
    }

    &__date {
        font-size: $font-size-tiny;
        color: $text-light-muted;
        white-space: nowrap;
        margin-left: $space-sm;
        padding: $space-2xs $space-xs;
        background: color.change($accent-gold, $alpha: 0.15);
        border-radius: $radius-sm;
    }

    &__desc {
        font-size: $font-size-body-sm;
        color: $text-light-primary;
        margin-bottom: $space-sm;
        line-height: 1.5;
    }

    &__flavor {
        font-size: $font-size-caption;
        color: $text-light-muted;
        font-style: italic;
        border-left: 3px solid color.change($accent-purple, $alpha: 0.4);
        padding-left: $space-sm;
        margin-top: $space-xs;
        line-height: 1.4;
    }

    &__progress {
        margin-top: $space-md;
        display: flex;
        flex-direction: column;
        gap: $space-xs;
    }

    &__progress-text {
        font-size: $font-size-tiny;
        color: $text-light-muted;
        font-weight: $font-weight-medium;
        font-family: $font-mono;
    }
}

@keyframes iconShine {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 0.7;
    }
}
</style>

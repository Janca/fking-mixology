<script setup lang="ts">
/**
 * AchievementsList - Grid display of achievement cards
 */
import AchievementCard from "./AchievementCard.vue";
import type { AchievementStatus } from "@/types/achievements";

defineProps<{
    /** Array of achievements to display */
    achievements: AchievementStatus[];
}>();
</script>

<template>
    <div class="achievements-list">
        <AchievementCard v-for="achievement in achievements" :key="achievement.id" :achievement="achievement"
            :id="'ach-' + achievement.id" />
    </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.achievements-list {
    display: grid;
    gap: $space-lg;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: $space-2xl;
    grid-template-columns: 1fr;

    @include tablet-up {
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    }

    // Stagger animation on load
    >* {
        animation: slideInUp 0.5s ease-out backwards;
    }

    @for $i from 1 through 20 {
        >*:nth-child(#{$i}) {
            animation-delay: #{$i * 0.05}s;
        }
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

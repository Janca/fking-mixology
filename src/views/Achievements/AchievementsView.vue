<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAchievementsStore } from "@/stores/achievements";
import { ACHIEVEMENT_CATEGORIES } from "@/config/achievements";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineOptions({
  name: "AchievementsView",
});

const store = useAchievementsStore();
const route = useRoute();
const selectedCategory = ref<string>("all");

onMounted(async () => {
  await store.loadData();

  if (route.hash) {
    // Wait for DOM update
    await nextTick();
    // Small timeout to ensure layout is stable
    setTimeout(() => {
      const el = document.querySelector(route.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect
        el.classList.add("highlight-pulse");
        setTimeout(() => el.classList.remove("highlight-pulse"), 2000);
      }
    }, 100);
  }
});

const items = computed(() => {
  let list = store.achievementsList;

  if (selectedCategory.value !== "all") {
    list = list.filter((a) => a.category === selectedCategory.value);
  }

  // Sort: Unlocked first, then by tiered order
  return list.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0; // Keep config order
  });
});

const progressColor = computed(() => {
  const p = store.progressPercentage;
  if (p < 25) return "bg-red-500";
  if (p < 50) return "bg-orange-500";
  if (p < 75) return "bg-yellow-500";
  return "bg-green-500";
});

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <WaveLayout>
    <template #header>
      <div class="achievements-header">
        <h1 class="title">Cheevos</h1>

        <!-- Overall Progress -->
        <div class="overall-progress">
          <div class="progress-info">
            <span class="label">Completion</span>
            <span class="value"
              >{{ store.totalUnlocked }} / {{ store.totalAchievements }}</span
            >
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${store.progressPercentage}%` }"
              :class="progressColor"
            />
          </div>
        </div>

        <!-- Category Filters -->
        <div class="filters">
          <button
            class="filter-pill"
            :class="{ active: selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            All
          </button>
          <button
            v-for="(config, key) in ACHIEVEMENT_CATEGORIES"
            :key="key"
            class="filter-pill"
            :class="{ active: selectedCategory === key }"
            @click="selectedCategory = key"
          >
            {{ config.label }}
          </button>
        </div>
      </div>
    </template>

    <div class="achievements-grid">
      <div
        v-for="achievement in items"
        :key="achievement.id"
        :id="'ach-' + achievement.id"
        class="achievement-card"
        :class="{
          'is-unlocked': achievement.isUnlocked,
          'is-hidden': achievement.isHidden && !achievement.isUnlocked,
        }"
      >
        <div class="card-icon">
          <AppEmoji v-if="achievement.isHidden && !achievement.isUnlocked"
            >❓</AppEmoji
          >
          <AppEmoji v-else>{{ achievement.icon || "🏆" }}</AppEmoji>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">
              <span v-if="achievement.isHidden && !achievement.isUnlocked"
                >Hidden Cheevo</span
              >
              <span v-else>{{ achievement.name }}</span>
            </h3>
            <span v-if="achievement.isUnlocked" class="card-date">
              {{ formatDate(achievement.unlockedAt) }}
            </span>
          </div>

          <p class="card-desc">
            <template v-if="!achievement.isUnlocked"> ??? </template>
            <template v-else>
              {{ achievement.description }}
            </template>
          </p>

          <p
            v-if="
              achievement.flavorText &&
              (!achievement.isHidden || achievement.isUnlocked)
            "
            class="card-flavor"
          >
            "{{ achievement.flavorText }}"
          </p>

          <!-- Progress Bar for Grindy ones -->
          <!-- Only show progress if not hidden category. Locked state still hides how to earn, but progress might be a hint we want to hide? 
               User said keep 'how to earn' hidden. Usually progress bars are spoiler-ish if they reveal the metric. 
               Let's hide progress for locked items too for maximum mystery, OR show it but vaguely? 
               I will hide it for locked items to strictly follow 'keep how to earn hidden'. 
               If I hide metric progress, they really have no idea. 
               However, user said "improve UI/UX... keep how to earn hidden". 
               If I hide progress, it's very clean. -->
          <div
            v-if="achievement.condition && achievement.isUnlocked"
            class="card-progress"
          >
            <div class="mini-progress-track">
              <div
                class="mini-progress-fill"
                :style="{
                  width: `${Math.min(
                    100,
                    (achievement.currentProgress /
                      achievement.condition.threshold) *
                      100
                  )}%`,
                }"
              />
            </div>
            <span class="mini-progress-text">
              {{ achievement.currentProgress }} /
              {{ achievement.condition.threshold }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.achievements-header {
  padding: $space-lg;
  color: $text-dark-primary;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;

  .title {
    font-family: $font-display;
    font-size: $font-size-display;
    margin-bottom: $space-lg;
    background: $gradient-gold;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 4px color.change(#000, $alpha: 0.2));

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }
}

.overall-progress {
  background: linear-gradient(
    135deg,
    color.change(#fff, $alpha: 0.15),
    color.change(#fff, $alpha: 0.05)
  );
  backdrop-filter: blur(10px);
  padding: $space-lg;
  border-radius: $radius-xl;
  margin-bottom: $space-xl;
  border: 1px solid color.change(#fff, $alpha: 0.2);
  box-shadow: 0 4px 12px color.change(#000, $alpha: 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: $radius-xl;
    padding: 1px;
    background: linear-gradient(
      135deg,
      color.change($accent-gold, $alpha: 0.5),
      color.change($accent-purple, $alpha: 0.3),
      color.change($accent-blue, $alpha: 0.5)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.6;
    pointer-events: none;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-weight: $font-weight-bold;
    margin-bottom: $space-sm;
    font-size: $font-size-body;
    color: $text-dark-primary;

    .label {
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: $font-size-body-sm;
    }

    .value {
      font-family: $font-display;
      font-size: $font-size-h3;
      color: $accent-gold;
    }
  }

  .progress-bar-track {
    height: 16px;
    background: color.change(#000, $alpha: 0.15);
    border-radius: $radius-full;
    overflow: hidden;
    box-shadow: inset 0 2px 4px color.change(#000, $alpha: 0.1);
  }

  .progress-bar-fill {
    height: 100%;
    transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(
      90deg,
      $accent-blue,
      $accent-purple,
      $accent-gold
    );
    box-shadow: 0 0 10px color.change($accent-gold, $alpha: 0.5);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        color.change(#fff, $alpha: 0.3),
        transparent
      );
      animation: shimmer 2s infinite;
    }
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

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-sm;

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

    &.active {
      background: $gradient-blue;
      color: white;
      border-color: $accent-purple;
      box-shadow: $glow-purple,
        0 4px 8px color.change($accent-purple, $alpha: 0.3);
      transform: translateY(-2px);
    }
  }
}

.achievements-grid {
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
  > * {
    animation: slideInUp 0.5s ease-out backwards;
  }

  @for $i from 1 through 20 {
    > *:nth-child(#{$i}) {
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

.achievement-card {
  display: flex;
  gap: $space-md;
  padding: $space-lg;
  background: linear-gradient(
    135deg,
    color.change($surface-dark-200, $alpha: 0.95),
    color.change($surface-dark-300, $alpha: 0.9)
  );
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
    background: linear-gradient(
      90deg,
      $surface-dark-400,
      $surface-dark-300,
      $surface-dark-400
    );
    opacity: 0.5;
  }

  &.is-unlocked {
    background: linear-gradient(
      135deg,
      color.change($surface-dark-300, $alpha: 0.98),
      color.change($surface-dark-400, $alpha: 0.95)
    );
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

    .card-icon {
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
        background: linear-gradient(
          135deg,
          color.change(#fff, $alpha: 0.3),
          transparent
        );
        animation: iconShine 3s ease-in-out infinite;
      }
    }

    .card-title {
      color: $accent-gold;
      text-shadow: 0 1px 2px color.change(#000, $alpha: 0.2);
    }
  }

  &.is-hidden {
    opacity: 0.4;
    filter: grayscale(0.5);
  }

  .card-icon {
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

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-xs;
    gap: $space-sm;
  }

  .card-title {
    font-family: $font-display;
    font-weight: $font-weight-bold;
    font-size: $font-size-h3;
    color: $text-light-secondary;
    line-height: 1.3;
  }

  .card-date {
    font-size: $font-size-tiny;
    color: $text-light-muted;
    white-space: nowrap;
    margin-left: $space-sm;
    padding: $space-2xs $space-xs;
    background: color.change($accent-gold, $alpha: 0.15);
    border-radius: $radius-sm;
  }

  .card-desc {
    font-size: $font-size-body-sm;
    color: $text-light-primary;
    margin-bottom: $space-sm;
    line-height: 1.5;
  }

  .card-flavor {
    font-size: $font-size-caption;
    color: $text-light-muted;
    font-style: italic;
    border-left: 3px solid color.change($accent-purple, $alpha: 0.4);
    padding-left: $space-sm;
    margin-top: $space-xs;
    line-height: 1.4;
  }

  .card-progress {
    margin-top: $space-md;

    .mini-progress-track {
      height: 6px;
      background: $surface-dark-500;
      border-radius: $radius-full;
      overflow: hidden;
      margin-bottom: $space-xs;
      box-shadow: inset 0 1px 3px color.change(#000, $alpha: 0.3);
    }

    .mini-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $accent-blue, $accent-purple);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 8px color.change($accent-blue, $alpha: 0.5);
    }

    .mini-progress-text {
      font-size: $font-size-tiny;
      color: $text-light-muted;
      font-weight: $font-weight-medium;
      font-family: $font-mono;
    }
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

.highlight-pulse {
  animation: card-highlight 2s ease-out;
}

@keyframes card-highlight {
  0% {
    box-shadow: 0 0 0 0 color.change($accent-gold, $alpha: 0.7);
    border-color: $accent-gold;
  }
  50% {
    box-shadow: 0 0 0 15px color.change($accent-gold, $alpha: 0);
    border-color: $accent-gold;
  }
  100% {
    box-shadow: 0 0 0 0 color.change($accent-gold, $alpha: 0);
  }
}
</style>

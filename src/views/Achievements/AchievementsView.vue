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
@use "@/styles/variables" as *;

.achievements-header {
  padding: $space-lg;
  color: $text-dark-primary;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;

  .title {
    font-family: $font-display;
    font-size: $font-size-display;
    margin-bottom: $space-md;

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }
}

.overall-progress {
  background: rgba(255, 255, 255, 0.5);
  padding: $space-md;
  border-radius: $radius-lg;
  margin-bottom: $space-lg;
  border: 1px solid rgba(0, 0, 0, 0.05);

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-weight: $font-weight-bold;
    margin-bottom: $space-xs;
    font-size: $font-size-body-sm;
  }

  .progress-bar-track {
    height: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: $radius-full;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    transition: width 1s ease-out;
  }
}

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-xs;

  .filter-pill {
    padding: $space-xs $space-md;
    border-radius: $radius-full;
    border: none;
    background: rgba(255, 255, 255, 0.6);
    color: $text-dark-secondary;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: white;
      transform: translateY(-2px);
    }

    &.active {
      background: $accent-purple;
      color: white;
      box-shadow: $glow-purple;
    }
  }
}

.achievements-grid {
  display: grid;
  gap: $space-md;
  max-width: 1200px; // Wider for grid
  margin: 0 auto;
  padding-bottom: $space-2xl;
  grid-template-columns: 1fr;

  @include tablet-up {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

.achievement-card {
  display: flex;
  gap: $space-md;
  padding: $space-md;
  background: $surface-dark-200;
  border-radius: $radius-lg;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all $transition-normal;
  opacity: 0.7; // Locked state

  &.is-unlocked {
    background: $surface-dark-300;
    border-color: rgba($accent-gold, 0.3);
    opacity: 1;
    box-shadow: $shadow-dark-raised-sm;

    &:hover {
      transform: scale(1.02);
      border-color: $accent-gold;
    }

    .card-icon {
      background: $gradient-gold;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .card-title {
      color: $accent-gold;
    }
  }

  .card-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: $surface-dark-400;
    border-radius: $radius-full;
    color: $text-light-muted;
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-2xs;
  }

  .card-title {
    font-family: $font-display;
    font-weight: $font-weight-bold;
    font-size: $font-size-body-lg;
    color: $text-light-secondary;
  }

  .card-date {
    font-size: $font-size-tiny;
    color: $text-light-muted;
    white-space: nowrap;
    margin-left: $space-sm;
  }

  .card-desc {
    font-size: $font-size-body-sm;
    color: $text-light-primary;
    margin-bottom: $space-xs;
  }

  .card-flavor {
    font-size: $font-size-caption;
    color: $text-light-muted;
    font-style: italic;
    border-left: 2px solid $surface-dark-400;
    padding-left: $space-sm;
    margin-top: $space-xs;
  }

  .card-progress {
    margin-top: $space-sm;

    .mini-progress-track {
      height: 4px;
      background: $surface-dark-400;
      border-radius: $radius-full;
      overflow: hidden;
      margin-bottom: 2px;
    }

    .mini-progress-fill {
      height: 100%;
      background: $accent-blue;
    }

    .mini-progress-text {
      font-size: $font-size-tiny;
      color: $text-light-muted;
    }
  }
}

.highlight-pulse {
  animation: card-highlight 2s ease-out;
}

@keyframes card-highlight {
  0% {
    box-shadow: 0 0 0 0 rgba($accent-gold, 0.7);
    border-color: $accent-gold;
  }
  70% {
    box-shadow: 0 0 0 10px rgba($accent-gold, 0);
    border-color: $accent-gold;
  }
  100% {
    box-shadow: 0 0 0 0 rgba($accent-gold, 0);
  }
}
</style>

<script setup lang="ts">
/**
 * LedgerGlobalStats - Analytics dashboard with charts
 */
import { computed, ref, onMounted, watch } from "vue";
import type { GlobalLedgerStats } from "@/types";
import AppEmoji from "@/components/common/AppEmoji.vue";

const props = defineProps<{
  stats: GlobalLedgerStats;
  isLoading: boolean;
}>();

// Animation refs
const animatedDrinks = ref(0);
const animatedVolume = ref(0);
const animatedSessions = ref(0);

// Animate numbers on mount
function animateValue(
  ref: { value: number },
  target: number,
  duration: number = 1000
) {
  const start = ref.value;
  const change = target - start;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    ref.value = Math.round(start + change * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

onMounted(() => {
  animateValue(animatedDrinks, props.stats.totalDrinks);
  animateValue(animatedVolume, props.stats.totalVolumeMl);
  animateValue(animatedSessions, props.stats.totalSessions);
});

watch(
  () => props.stats,
  (newStats) => {
    animateValue(animatedDrinks, newStats.totalDrinks);
    animateValue(animatedVolume, newStats.totalVolumeMl);
    animateValue(animatedSessions, newStats.totalSessions);
  }
);

function formatVolume(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${Math.round(ml)}ml`;
}

// Calculate chart heights
const maxHourCount = computed(() =>
  Math.max(...props.stats.drinksByHour.map((h) => h.count), 1)
);

const maxWeekdayCount = computed(() =>
  Math.max(...props.stats.drinksByWeekday.map((w) => w.count), 1)
);

const maxDayCount = computed(() =>
  Math.max(...props.stats.drinksByDay.map((d) => d.count), 1)
);

function getHourLabel(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}
</script>

<template>
  <div class="analytics-dashboard">
    <!-- Hero Stats -->
    <div class="hero-stats">
      <div class="hero-stat">
        <AppEmoji class="hero-stat__icon">🍹</AppEmoji>
        <span class="hero-stat__value">{{ animatedDrinks }}</span>
        <span class="hero-stat__label">Total Drinks</span>
      </div>
      <div class="hero-stat">
        <AppEmoji class="hero-stat__icon">📒</AppEmoji>
        <span class="hero-stat__value">{{ animatedSessions }}</span>
        <span class="hero-stat__label">Sessions</span>
      </div>
      <div class="hero-stat">
        <AppEmoji class="hero-stat__icon">🧪</AppEmoji>
        <span class="hero-stat__value">{{ formatVolume(animatedVolume) }}</span>
        <span class="hero-stat__label">Consumed</span>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Most Popular Cocktail -->
      <div class="chart-card chart-card--highlight">
        <h3 class="chart-title"><AppEmoji>🏆</AppEmoji> Most Made Cocktail</h3>
        <div v-if="stats.mostMadeCocktail" class="popular-cocktail">
          <span class="popular-name">{{ stats.mostMadeCocktail.name }}</span>
          <span class="popular-count">{{ stats.mostMadeCocktail.count }}x</span>
        </div>
        <div v-else class="no-data">No data yet</div>
      </div>

      <!-- Average Stats -->
      <div class="chart-card">
        <h3 class="chart-title"><AppEmoji>📈</AppEmoji> Averages</h3>
        <div class="avg-stats">
          <div class="avg-stat">
            <span class="avg-value">{{
              stats.averageDrinksPerSession.toFixed(1)
            }}</span>
            <span class="avg-label">drinks/session</span>
          </div>
          <div class="avg-stat">
            <span class="avg-value"
              >{{ stats.averageSessionDurationMinutes }}m</span
            >
            <span class="avg-label">avg duration</span>
          </div>
        </div>
      </div>

      <!-- Drinks by Hour Chart -->
      <div class="chart-card chart-card--wide">
        <h3 class="chart-title"><AppEmoji>🕐</AppEmoji> Drinks by Hour</h3>
        <div class="bar-chart hour-chart">
          <div
            v-for="item in stats.drinksByHour"
            :key="item.hour"
            class="bar-container"
          >
            <div
              class="bar"
              :style="{
                height: `${(item.count / maxHourCount) * 100}%`,
              }"
              :class="{ 'bar--empty': item.count === 0 }"
            >
              <span v-if="item.count > 0" class="bar-value">{{
                item.count
              }}</span>
            </div>
            <span class="bar-label">{{ getHourLabel(item.hour) }}</span>
          </div>
        </div>
      </div>

      <!-- Drinks by Weekday -->
      <div class="chart-card">
        <h3 class="chart-title"><AppEmoji>📅</AppEmoji> By Weekday</h3>
        <div class="bar-chart weekday-chart">
          <div
            v-for="item in stats.drinksByWeekday"
            :key="item.weekday"
            class="bar-container"
          >
            <div
              class="bar"
              :style="{
                height: `${(item.count / maxWeekdayCount) * 100}%`,
              }"
              :class="{ 'bar--empty': item.count === 0 }"
            >
              <span v-if="item.count > 0" class="bar-value">{{
                item.count
              }}</span>
            </div>
            <span class="bar-label">{{ item.weekday }}</span>
          </div>
        </div>
      </div>

      <!-- Top Ingredients -->
      <div class="chart-card">
        <h3 class="chart-title"><AppEmoji>🧴</AppEmoji> Top Ingredients</h3>
        <div v-if="stats.topIngredients.length > 0" class="ingredients-list">
          <div
            v-for="(ing, index) in stats.topIngredients.slice(0, 5)"
            :key="ing.ingredientName"
            class="ingredient-item"
          >
            <span class="ingredient-rank">{{ index + 1 }}</span>
            <span class="ingredient-name">{{ ing.ingredientName }}</span>
            <span class="ingredient-amount">{{
              formatVolume(ing.totalMl)
            }}</span>
          </div>
        </div>
        <div v-else class="no-data">No data yet</div>
      </div>

      <!-- Recent Activity (Last 30 days) -->
      <div class="chart-card chart-card--wide">
        <h3 class="chart-title"><AppEmoji>📆</AppEmoji> Last 30 Days</h3>
        <div v-if="stats.drinksByDay.length > 0" class="activity-chart">
          <div
            v-for="day in stats.drinksByDay"
            :key="day.date"
            class="activity-bar"
            :style="{
              height: `${(day.count / maxDayCount) * 100}%`,
            }"
            :class="{ 'activity-bar--empty': day.count === 0 }"
            :title="`${day.date}: ${day.count} drinks`"
          />
        </div>
        <div v-else class="no-data">No activity in the last 30 days</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.analytics-dashboard {
  width: 100%;
  max-width: 100%;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-lg;
  margin-bottom: $space-2xl;

  @include mobile-only {
    grid-template-columns: 1fr;
    gap: $space-md;
  }
}

.hero-stat {
  background: $surface-dark-200;
  border-radius: $radius-xl;
  padding: $space-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: $shadow-dark-raised;
  transition: transform $transition-normal;

  &:hover {
    transform: translateY(-4px);
  }

  &__icon {
    font-size: 2.5rem;
    margin-bottom: $space-sm;
  }

  &__value {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-light-primary;
    background: $gradient-sunset;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }

  &__label {
    font-size: $font-size-body-sm;
    color: $text-light-secondary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: $space-2xs;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-lg;
  width: 100%;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: $surface-dark-200;
  border-radius: $radius-xl;
  padding: $space-lg;
  box-shadow: $shadow-dark-raised-sm;
  min-width: 0;
  min-height: 180px;
  display: flex;
  flex-direction: column;

  &--wide {
    grid-column: span 2;
    min-height: 240px;

    @include mobile-only {
      grid-column: span 1;
    }
  }

  &--highlight {
    background: $gradient-sunset;
    color: white;

    .chart-title {
      color: white;
    }

    .no-data {
      color: color.change(white, $alpha: 0.7);
    }
  }
}

.chart-title {
  font-family: $font-display;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-md;
}

.popular-cocktail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-xs;
}

.popular-name {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
}

.popular-count {
  font-size: $font-size-h1;
  font-weight: $font-weight-extrabold;
  opacity: 0.8;
}

.avg-stats {
  display: flex;
  justify-content: space-around;
  gap: $space-md;
}

.avg-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2xs;
}

.avg-value {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $accent-coral;
}

.avg-label {
  font-size: $font-size-caption;
  color: $text-light-secondary;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  flex: 1;
  min-height: 80px;
  position: relative;
  margin-top: $space-sm;
  padding-bottom: $space-lg;
}

.hour-chart {
  gap: 3px;
  padding-bottom: $space-xl;

  .bar-container {
    flex: 1;
    min-width: 0;
  }
}

.weekday-chart {
  gap: $space-sm;

  .bar-container {
    flex: 1;
  }
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  min-height: 4px;
  background: $gradient-ocean;
  border-radius: $radius-sm $radius-sm 0 0;
  position: relative;
  transition: height 0.5s $spring-bounce;

  &--empty {
    background: $surface-dark-100;
    min-height: 2px;
  }
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: $font-size-tiny;
  font-weight: $font-weight-bold;
  color: $text-light-secondary;
  white-space: nowrap;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  font-size: $font-size-tiny;
  color: $text-light-muted;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-xs 0;
  border-bottom: 1px solid $surface-dark-100;

  &:last-child {
    border-bottom: none;
  }
}

.ingredient-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $accent-coral;
  color: white;
  border-radius: $radius-full;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
}

.ingredient-name {
  flex: 1;
  font-size: $font-size-body-sm;
  color: $text-light-primary;
}

.ingredient-amount {
  font-family: $font-mono;
  font-size: $font-size-body-sm;
  color: $text-light-secondary;
}

.activity-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
}

.activity-bar {
  flex: 1;
  background: $gradient-ocean;
  border-radius: $radius-sm $radius-sm 0 0;
  min-height: 4px;
  transition: height 0.3s ease-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &--empty {
    background: $surface-dark-100;
    min-height: 2px;
  }
}

.no-data {
  text-align: center;
  padding: $space-lg;
  color: $text-light-muted;
  font-style: italic;
}
</style>

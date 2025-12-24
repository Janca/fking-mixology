<script setup lang="ts">
/**
 * SessionDetailView - Detailed view of a single session
 * Shows timeline, stats, and all entries
 */
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLedgerStore } from "@/stores/ledger";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AppButton from "@/components/common/AppButton.vue";
import type { SessionWithEntries, SessionStats } from "@/types";

defineOptions({
  name: "SessionDetailView",
});

const route = useRoute();
const router = useRouter();
const ledgerStore = useLedgerStore();

const session = ref<SessionWithEntries | null>(null);
const stats = ref<SessionStats | null>(null);
const isLoading = ref(true);

const sessionId = computed(() => Number(route.params.id));

async function loadSession() {
  isLoading.value = true;
  try {
    session.value = await ledgerStore.getSessionWithEntries(sessionId.value);
    if (session.value) {
      stats.value = await ledgerStore.getSessionStats(sessionId.value);
    }
  } finally {
    isLoading.value = false;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatVolume(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${Math.round(ml)}ml`;
}

function goBack() {
  router.push("/ledger");
}

function goToCocktail(slug: string) {
  router.push(`/cocktail/${slug}`);
}

// Animated counter for stats
const animatedDrinks = ref(0);
const animatedVolume = ref(0);

function animateValue(
  targetRef: { value: number },
  target: number,
  duration = 800
) {
  const start = targetRef.value;
  const change = target - start;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    targetRef.value = Math.round(start + change * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

onMounted(async () => {
  await loadSession();
  if (session.value) {
    animateValue(animatedDrinks, session.value.totalDrinks);
    animateValue(animatedVolume, session.value.totalVolumeMl);
  }
});
</script>

<template>
  <WaveLayout>
    <template #header>
      <div class="session-header">
        <div v-if="session && !isLoading" class="header-content">
          <h1 class="session-title">{{ session.name }}</h1>
          <p class="session-date">{{ formatDate(session.createdAt) }}</p>
        </div>
      </div>
    </template>

    <div class="session-detail">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner" />
        <span>Loading session...</span>
      </div>

      <!-- Session Content -->
      <template v-else-if="session">
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card stat-card--primary">
            <span class="stat-icon">🍹</span>
            <span class="stat-value">{{ animatedDrinks }}</span>
            <span class="stat-label">Drinks Made</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🧪</span>
            <span class="stat-value">{{ formatVolume(animatedVolume) }}</span>
            <span class="stat-label">Total Volume</span>
          </div>
          <div v-if="stats" class="stat-card">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{{ stats.durationMinutes }}m</span>
            <span class="stat-label">Duration</span>
          </div>
          <div v-if="stats" class="stat-card">
            <span class="stat-icon">🔄</span>
            <span class="stat-value">{{ stats.uniqueCocktails }}</span>
            <span class="stat-label">Unique Drinks</span>
          </div>
        </div>

        <!-- Most Popular Section -->
        <div v-if="stats?.mostPopularCocktail" class="highlight-card">
          <span class="highlight-badge">🏆 Most Made</span>
          <h3 class="highlight-title">{{ stats.mostPopularCocktail.name }}</h3>
          <span class="highlight-count"
            >{{ stats.mostPopularCocktail.count }}x</span
          >
        </div>

        <!-- Session Analytics Grid -->
        <div class="analytics-grid">
          <!-- Drinks per Hour (if session spans multiple hours) -->
          <div v-if="stats && stats.durationMinutes > 30" class="chart-card">
            <h3 class="chart-title">⏱️ Session Pace</h3>
            <div class="pace-stat">
              <span class="pace-value">{{
                stats.averageDrinksPerHour.toFixed(1)
              }}</span>
              <span class="pace-label">drinks per hour</span>
            </div>
          </div>

          <!-- Unique Cocktails Ratio -->
          <div v-if="stats" class="chart-card">
            <h3 class="chart-title">🍹 Variety Score</h3>
            <div class="variety-stat">
              <div class="variety-ring">
                <svg viewBox="0 0 36 36" class="variety-circle">
                  <path
                    class="variety-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="variety-fill"
                    :stroke-dasharray="`${
                      (stats.uniqueCocktails / Math.max(stats.totalDrinks, 1)) *
                      100
                    }, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="variety-value">{{ stats.uniqueCocktails }}</span>
              </div>
              <span class="variety-label"
                >unique out of {{ stats.totalDrinks }}</span
              >
            </div>
          </div>
        </div>

        <!-- Ingredients Breakdown with Bar Chart -->
        <div
          v-if="stats && stats.ingredientBreakdown.length > 0"
          class="section"
        >
          <h2 class="section-title">🧴 Ingredients Used</h2>
          <div class="ingredients-chart">
            <div
              v-for="(ing, index) in stats.ingredientBreakdown.slice(0, 6)"
              :key="ing.ingredientName"
              class="ingredient-bar-row"
            >
              <span class="ingredient-rank">{{ index + 1 }}</span>
              <span class="ingredient-name">{{ ing.ingredientName }}</span>
              <div class="ingredient-bar-wrapper">
                <div
                  class="ingredient-bar-fill"
                  :style="{
                    width: `${
                      (ing.totalMl / stats.ingredientBreakdown[0].totalMl) * 100
                    }%`,
                  }"
                />
              </div>
              <span class="ingredient-amount">{{
                formatVolume(ing.totalMl)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="section">
          <h2 class="section-title">📋 Drinks Timeline</h2>
          <div v-if="session.entries.length > 0" class="timeline">
            <TransitionGroup name="timeline-item">
              <div
                v-for="entry in session.entries"
                :key="entry.id"
                class="timeline-entry"
                @click="goToCocktail(entry.cocktailSlug)"
              >
                <div class="entry-time">
                  {{ formatTime(entry.createdAt) }}
                </div>
                <div class="entry-dot" />
                <div class="entry-content">
                  <h4 class="entry-name">{{ entry.cocktailName }}</h4>
                  <div class="entry-meta">
                    <span v-if="entry.scale > 1" class="entry-scale">
                      × {{ entry.scale }} servings
                    </span>
                    <span class="entry-ingredients">
                      {{ entry.ingredientsUsed.length }} ingredients
                    </span>
                  </div>
                </div>
                <span class="entry-arrow">→</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="empty-timeline">
            No drinks recorded in this session
          </div>
        </div>

        <!-- Actions -->
        <div v-if="!session.isActive" class="actions-bar">
          <AppButton
            variant="teal"
            size="lg"
            rounded
            @click="ledgerStore.resumeSession(session.id!)"
          >
            Resume This Session
          </AppButton>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="not-found">
        <span class="not-found-icon">🔍</span>
        <h2>Session Not Found</h2>
        <p>This session doesn't exist or has been deleted.</p>
        <AppButton variant="primary" rounded @click="goBack">
          Back to Ledger
        </AppButton>
      </div>
    </div>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.session-header {
  padding: $space-xl $space-lg;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;

  @include mobile-only {
    padding: $space-lg $space-md;
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-xs $space-md;
  background: transparent;
  border: 2px solid $surface-light-400;
  border-radius: $radius-full;
  color: $text-dark-secondary;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  margin-bottom: $space-lg;

  &:hover {
    border-color: $accent-coral;
    color: $accent-coral;
  }
}

.header-content {
  text-align: center;
}

.session-title {
  font-family: $font-display;
  font-size: $font-size-display;
  font-weight: $font-weight-extrabold;
  color: $text-dark-primary;
  margin-bottom: $space-xs;
  background: $gradient-sunset;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @include mobile-only {
    font-size: $font-size-h1;
  }
}

.session-date {
  font-size: $font-size-body-lg;
  color: $text-dark-secondary;
}

.session-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 $space-md $space-3xl;
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  padding: $space-4xl;
  color: $text-light-secondary;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba($accent-coral, 0.2);
    border-top-color: $accent-coral;
    border-radius: $radius-full;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-md;
  margin-bottom: $space-xl;

  @include mobile-only {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: $surface-dark-200;
  border-radius: $radius-xl;
  padding: $space-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: $shadow-dark-raised-sm;
  transition: transform $transition-normal;

  &:hover {
    transform: translateY(-2px);
  }

  &--primary {
    background: $gradient-sunset;
  }
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: $space-xs;
}

.stat-value {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-extrabold;
  color: $text-light-primary;
}

.stat-label {
  font-size: $font-size-caption;
  color: $text-light-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: $space-2xs;
}

.highlight-card {
  background: $gradient-ocean;
  border-radius: $radius-2xl;
  padding: $space-xl;
  text-align: center;
  margin-bottom: $space-xl;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(white, 0.1) 0%,
      transparent 60%
    );
  }
}

.highlight-badge {
  display: inline-block;
  padding: $space-2xs $space-sm;
  background: rgba(white, 0.2);
  border-radius: $radius-full;
  font-size: $font-size-caption;
  font-weight: $font-weight-bold;
  color: white;
  margin-bottom: $space-sm;
}

.highlight-title {
  font-family: $font-display;
  font-size: $font-size-h1;
  font-weight: $font-weight-extrabold;
  color: white;
  margin-bottom: $space-xs;
}

.highlight-count {
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: rgba(white, 0.8);
}

// Session Analytics
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-md;
  margin-bottom: $space-xl;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: $surface-dark-200;
  border-radius: $radius-xl;
  padding: $space-lg;
  box-shadow: $shadow-dark-raised-sm;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-family: $font-display;
  font-size: $font-size-body;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-md;
}

.pace-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.pace-value {
  font-family: $font-display;
  font-size: $font-size-display;
  font-weight: $font-weight-extrabold;
  color: $accent-coral;
}

.pace-label {
  font-size: $font-size-body-sm;
  color: $text-light-secondary;
}

.variety-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.variety-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.variety-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.variety-bg {
  fill: none;
  stroke: $surface-dark-100;
  stroke-width: 3.8;
}

.variety-fill {
  fill: none;
  stroke: $accent-teal;
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s ease-out;
}

.variety-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-extrabold;
  color: $text-light-primary;
}

.variety-label {
  font-size: $font-size-body-sm;
  color: $text-light-secondary;
  margin-top: $space-xs;
}

// Ingredient Bar Chart
.ingredients-chart {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.ingredient-bar-row {
  display: grid;
  grid-template-columns: auto 1fr 2fr auto;
  align-items: center;
  gap: $space-sm;
  padding: $space-xs 0;
}

.ingredient-bar-wrapper {
  height: 12px;
  background: $surface-dark-100;
  border-radius: $radius-full;
  overflow: hidden;
}

.ingredient-bar-fill {
  height: 100%;
  background: $gradient-ocean;
  border-radius: $radius-full;
  transition: width 0.6s ease-out;
  min-width: 4px;
}

.section {
  margin-bottom: $space-2xl;
}

.section-title {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-lg;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-sm;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.ingredient-card {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-sm $space-md;
  background: $surface-dark-300;
  border-radius: $radius-lg;
  transition: transform $transition-fast;

  &:hover {
    transform: translateX(4px);
  }
}

.ingredient-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $accent-teal;
  color: white;
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-bold;
  flex-shrink: 0;
}

.ingredient-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.ingredient-name {
  font-weight: $font-weight-medium;
  color: $text-light-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ingredient-amount {
  font-size: $font-size-caption;
  color: $text-light-secondary;
  font-family: $font-mono;
}

.timeline {
  position: relative;
  padding-left: 100px;

  @include mobile-only {
    padding-left: 70px;
  }

  &::before {
    content: "";
    position: absolute;
    left: 85px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: $surface-dark-100;

    @include mobile-only {
      left: 55px;
    }
  }
}

.timeline-entry {
  position: relative;
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-md;
  background: $surface-dark-300;
  border-radius: $radius-lg;
  margin-bottom: $space-sm;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $surface-dark-200;
    transform: translateX(4px);
  }
}

.entry-time {
  position: absolute;
  left: -95px;
  width: 80px;
  text-align: right;
  font-size: $font-size-body-sm;
  color: $text-light-secondary;

  @include mobile-only {
    left: -65px;
    width: 55px;
    font-size: $font-size-caption;
  }
}

.entry-dot {
  position: absolute;
  left: -15px;
  width: 12px;
  height: 12px;
  background: $accent-coral;
  border-radius: $radius-full;
  border: 3px solid $surface-dark-400;

  @include mobile-only {
    left: -15px;
  }
}

.entry-content {
  flex: 1;
}

.entry-name {
  font-family: $font-display;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-semibold;
  color: $text-light-primary;
  margin-bottom: $space-2xs;
}

.entry-meta {
  display: flex;
  gap: $space-md;
  font-size: $font-size-caption;
  color: $text-light-secondary;
}

.entry-scale {
  color: $accent-teal;
  font-weight: $font-weight-medium;
}

.entry-arrow {
  color: $text-light-muted;
  font-size: $font-size-body-lg;
}

.empty-timeline {
  text-align: center;
  padding: $space-2xl;
  color: $text-light-muted;
  font-style: italic;
}

.actions-bar {
  display: flex;
  justify-content: center;
  gap: $space-md;
  padding-top: $space-xl;
  border-top: 1px solid $surface-dark-100;
}

.not-found {
  text-align: center;
  padding: $space-4xl;

  .not-found-icon {
    font-size: 5rem;
    display: block;
    margin-bottom: $space-lg;
  }

  h2 {
    color: $text-light-primary;
    margin-bottom: $space-sm;
  }

  p {
    color: $text-light-muted;
    margin-bottom: $space-xl;
  }
}

// Timeline transitions
.timeline-item-move,
.timeline-item-enter-active,
.timeline-item-leave-active {
  transition: all 0.4s $spring-bounce;
}

.timeline-item-enter-from,
.timeline-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

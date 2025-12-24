<script setup lang="ts">
/**
 * LedgerSessionCard - Individual session card with actions
 */
import type { LedgerSession } from "@/types";
import AppButton from "@/components/common/AppButton.vue";

const props = defineProps<{
  session: LedgerSession;
  isSelectMode: boolean;
  isSelected: boolean;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "rename"): void;
  (e: "delete"): void;
  (e: "resume"): void;
  (e: "end"): void;
  (e: "view"): void;
}>();

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
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

function getDuration(): string {
  const start = new Date(props.session.createdAt);
  const end = new Date(props.session.updatedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}min`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
</script>

<template>
  <div
    class="session-card"
    :class="{
      'session-card--selected': isSelected,
      'session-card--active': isActive,
      'session-card--select-mode': isSelectMode,
    }"
    @click="isSelectMode ? emit('select') : emit('view')"
  >
    <!-- Selection Checkbox -->
    <div v-if="isSelectMode" class="selection-indicator">
      <div class="checkbox" :class="{ 'checkbox--checked': isSelected }">
        <span v-if="isSelected" class="check-icon">✓</span>
      </div>
    </div>

    <!-- Active Badge -->
    <div v-if="isActive" class="active-badge">
      <span class="pulse-dot" />
      Active
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <h3 class="session-name">{{ session.name }}</h3>

      <div class="session-meta">
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          {{ formatDate(session.createdAt) }}
        </span>
        <span class="meta-item">
          <span class="meta-icon">🕐</span>
          {{ formatTime(session.createdAt) }}
        </span>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat">
          <span class="stat-value">{{ session.totalDrinks }}</span>
          <span class="stat-label">drinks</span>
        </div>
        <div class="stat-divider" />
        <div class="stat">
          <span class="stat-value">{{
            formatVolume(session.totalVolumeMl)
          }}</span>
          <span class="stat-label">consumed</span>
        </div>
        <div class="stat-divider" />
        <div class="stat">
          <span class="stat-value">{{ getDuration() }}</span>
          <span class="stat-label">duration</span>
        </div>
      </div>
    </div>

    <!-- Actions (hidden in select mode) -->
    <div v-if="!isSelectMode" class="card-actions" @click.stop>
      <button class="action-icon" title="Rename" @click="emit('rename')">
        ✏️
      </button>
      <button class="action-icon" title="Delete" @click="emit('delete')">
        🗑️
      </button>
      <AppButton
        v-if="isActive"
        variant="dark"
        size="sm"
        rounded
        @click="emit('end')"
      >
        End Session
      </AppButton>
      <AppButton
        v-if="!isActive"
        variant="teal"
        size="sm"
        rounded
        @click="emit('resume')"
      >
        Resume
      </AppButton>
      <AppButton variant="primary" size="sm" rounded @click="emit('view')">
        View
      </AppButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.session-card {
  position: relative;
  background: $surface-dark-200;
  border-radius: $radius-xl;
  padding: $space-lg;
  box-shadow: $shadow-dark-raised-sm;
  cursor: pointer;
  transition: all $transition-normal;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-dark-raised;
  }

  &--selected {
    border-color: $accent-coral;
    background: rgba($accent-coral, 0.1);
  }

  &--active {
    border-color: $accent-teal;
    background: rgba($accent-teal, 0.08);
  }

  &--select-mode {
    cursor: pointer;

    .card-content {
      padding-left: $space-xl;
    }
  }
}

.selection-indicator {
  position: absolute;
  top: 50%;
  left: $space-md;
  transform: translateY(-50%);
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid $surface-dark-100;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  &--checked {
    background: $accent-coral;
    border-color: $accent-coral;
  }
}

.check-icon {
  color: white;
  font-weight: $font-weight-bold;
}

.active-badge {
  position: absolute;
  top: $space-md;
  right: $space-md;
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-2xs $space-sm;
  background: rgba($accent-teal, 0.15);
  color: $accent-teal-dark;
  border-radius: $radius-full;
  font-size: $font-size-caption;
  font-weight: $font-weight-semibold;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: $accent-teal;
  border-radius: $radius-full;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

.card-content {
  transition: padding $transition-fast;
}

.session-name {
  font-family: $font-display;
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-sm;
  padding-right: 80px; // Room for active badge
}

.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $space-md;
  margin-bottom: $space-md;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $space-2xs;
  font-size: $font-size-body-sm;
  color: $text-light-secondary;
}

.meta-icon {
  font-size: 0.9em;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-sm 0;
  border-top: 1px solid $surface-dark-100;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-value {
  font-family: $font-display;
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $accent-coral;
}

.stat-label {
  font-size: $font-size-caption;
  color: $text-light-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: $surface-dark-100;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-top: $space-md;
  padding-top: $space-md;
  border-top: 1px solid $surface-dark-100;
}

.action-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $surface-dark-300;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $surface-dark-100;
    transform: scale(1.05);
  }
}
</style>

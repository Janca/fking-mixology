<script setup lang="ts">
/**
 * LedgerHeader - Header section for ledger with view toggle and actions
 */
defineProps<{
  viewMode: "sessions" | "analytics";
  isSelectMode: boolean;
  selectedCount: number;
}>();

const emit = defineEmits<{
  (e: "toggleView"): void;
  (e: "toggleSelect"): void;
  (e: "openMerge"): void;
}>();
</script>

<template>
  <div class="ledger-header">
    <div class="header-content">
      <div class="header-title-section">
        <h1 class="header-title">
          <span class="title-icon">📒</span>
          <span class="title-text">Drink Ledger</span>
        </h1>
        <p class="header-subtitle">Track your cocktail sessions</p>
      </div>

      <div class="header-actions">
        <!-- Select Mode Button (only in sessions view) -->
        <button
          v-if="viewMode === 'sessions'"
          class="action-btn"
          :class="{ 'action-btn--active': isSelectMode }"
          @click="emit('toggleSelect')"
        >
          {{ isSelectMode ? `Cancel (${selectedCount})` : "Select" }}
        </button>

        <!-- View Toggle Pills -->
        <div class="view-toggle">
          <button
            class="toggle-pill"
            :class="{ 'toggle-pill--active': viewMode === 'sessions' }"
            @click="emit('toggleView')"
          >
            <span class="pill-icon">📋</span>
            Sessions
          </button>
          <button
            class="toggle-pill"
            :class="{ 'toggle-pill--active': viewMode === 'analytics' }"
            @click="emit('toggleView')"
          >
            <span class="pill-icon">📊</span>
            Analytics
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.ledger-header {
  padding: $space-2xl $space-lg $space-xl;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @include mobile-only {
    padding: $space-xl $space-md $space-lg;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $space-lg;
  flex-wrap: wrap;

  @include mobile-only {
    flex-direction: column;
    gap: $space-md;
  }
}

.header-title-section {
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-size: $font-size-display;
  font-family: $font-display;
  font-weight: $font-weight-extrabold;
  color: $text-dark-primary;
  margin-bottom: $space-xs;

  @include mobile-only {
    font-size: $font-size-h1;
  }
}

.title-icon {
  font-size: 1.2em;
}

.title-text {
  background: $gradient-sunset;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: $font-size-body-lg;
  color: $text-dark-secondary;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $space-md;
  flex-shrink: 0;

  @include mobile-only {
    width: 100%;
    flex-wrap: wrap;
  }
}

.view-toggle {
  display: flex;
  background: $surface-light-300;
  border-radius: $radius-full;
  padding: 4px;
  box-shadow: $shadow-light-inset-sm;
}

.toggle-pill {
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-xs $space-md;
  border: none;
  background: transparent;
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-medium;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-fast;

  &--active {
    background: $surface-light-100;
    color: $text-dark-primary;
    box-shadow: $shadow-light-raised-sm;
  }

  &:hover:not(&--active) {
    color: $text-dark-primary;
  }
}

.pill-icon {
  font-size: 1em;
}

.action-btn {
  padding: $space-xs $space-md;
  border: 2px solid $surface-light-400;
  background: transparent;
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-medium;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $accent-coral;
    color: $accent-coral;
  }

  &--active {
    background: $accent-coral;
    border-color: $accent-coral;
    color: white;

    &:hover {
      background: $accent-coral-dark;
      border-color: $accent-coral-dark;
    }
  }
}
</style>

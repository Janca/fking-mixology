<script setup lang="ts">
import AppEmoji from "@/components/common/AppEmoji.vue";
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
  <div class="ledger-actions">
    <!-- Select Mode Button (only in sessions view) -->
    <button v-if="viewMode === 'sessions'" class="action-btn" :class="{ 'action-btn--active': isSelectMode }"
      @click="emit('toggleSelect')">
      {{ isSelectMode ? `Cancel (${selectedCount})` : "Select" }}
    </button>

    <!-- View Toggle Pills -->
    <div class="view-toggle">
      <button class="toggle-pill" :class="{ 'toggle-pill--active': viewMode === 'sessions' }"
        @click="emit('toggleView')">
        <AppEmoji class="pill-icon">📋</AppEmoji>
        Sessions
      </button>
      <button class="toggle-pill" :class="{ 'toggle-pill--active': viewMode === 'analytics' }"
        @click="emit('toggleView')">
        <AppEmoji class="pill-icon">📊</AppEmoji>
        Analytics
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.ledger-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-md;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0;
  margin-left: auto;
  padding: 0 $space-md;
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

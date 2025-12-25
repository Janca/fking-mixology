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
  gap: $space-lg;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0;
  margin-left: auto;
  padding: 0 $space-md;
}

.view-toggle {
  display: flex;
  background: linear-gradient(180deg,
      $surface-light-300 0%,
      $surface-light-400 100%);
  border-radius: $radius-full;
  padding: 5px;
  box-shadow: inset 0 2px 4px color.change(#000, $alpha: 0.06),
    0 1px 2px color.change(#fff, $alpha: 0.8);
  border: 1px solid color.change($surface-light-500, $alpha: 0.5);
}

.toggle-pill {
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-sm $space-lg;
  border: none;
  background: transparent;
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  color: $text-dark-muted;
  cursor: pointer;
  transition: all $transition-normal;

  &--active {
    background: linear-gradient(135deg,
        $surface-light-100 0%,
        color.adjust($surface-light-100, $lightness: -2%) 100%);
    color: $text-dark-primary;
    box-shadow: 0 2px 8px color.change(#000, $alpha: 0.08),
      0 4px 12px color.change(#000, $alpha: 0.04),
      inset 0 1px 0 color.change(#fff, $alpha: 0.9);
  }

  &:hover:not(&--active) {
    color: $text-dark-secondary;
    background: color.change(#fff, $alpha: 0.3);
  }

  .pill-icon {
    transition: transform $transition-normal;
  }

  &:hover .pill-icon {
    transform: scale(1.15);
  }
}

.pill-icon {
  font-size: 1.1em;
}

.action-btn {
  padding: $space-sm $space-lg;
  border: 2px solid color.change($surface-light-500, $alpha: 0.6);
  background: linear-gradient(135deg,
      color.change(#fff, $alpha: 0.6) 0%,
      color.change(#fff, $alpha: 0.3) 100%);
  backdrop-filter: blur(8px);
  border-radius: $radius-full;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: 0 2px 4px color.change(#000, $alpha: 0.04);

  &:hover {
    border-color: $accent-coral;
    color: $accent-coral;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px color.change($accent-coral, $alpha: 0.15);
  }

  &--active {
    background: linear-gradient(135deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px color.change($accent-coral, $alpha: 0.35);

    &:hover {
      background: linear-gradient(135deg,
          $accent-coral-dark 0%,
          color.adjust($accent-coral-dark, $lightness: -5%) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px color.change($accent-coral, $alpha: 0.4);
    }
  }
}
</style>

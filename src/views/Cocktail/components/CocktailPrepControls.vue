<script setup lang="ts">
import AppButton from "@/components/common/AppButton.vue";

const props = defineProps<{
  isPrepMode: boolean;
  scale: number;
  progressPercentage: number;
}>();

const emit = defineEmits<{
  (e: "togglePrepMode"): void;
  (e: "update:scale", value: number): void;
}>();

function setScale(newScale: number) {
  emit("update:scale", newScale);
}

function togglePrepMode() {
  emit("togglePrepMode");
  if (props.isPrepMode) {
    emit("update:scale", 1);
  }
}
</script>

<template>
  <div class="controls-card" :class="{ 'controls-card--active': isPrepMode }">
    <!-- Servings (only visible in prep mode) - Left Aligned -->
    <Transition name="fade-scale">
      <div v-if="isPrepMode" class="scale-control">
        <span class="scale-control__label">Servings</span>
        <div class="scale-control__buttons">
          <button
            class="scale-btn"
            :disabled="scale <= 1"
            @click="setScale(scale - 1)"
          >
            −
          </button>
          <span class="scale-control__value">{{ scale }}</span>
          <button
            class="scale-btn"
            :disabled="scale >= 10"
            @click="setScale(scale + 1)"
          >
            +
          </button>
        </div>
      </div>
    </Transition>

    <!-- Start/Stop Prep Button - Right Aligned -->
    <AppButton
      class="prep-toggle-btn"
      :variant="isPrepMode ? 'primary' : 'dark'"
      size="sm"
      rounded
      @click="togglePrepMode"
    >
      {{ isPrepMode ? "✓ Prep Mode" : "Start Prep" }}
    </AppButton>

    <!-- Progress Bar Integrated into Bottom Border -->
    <div v-if="isPrepMode" class="card-progress-bar">
      <div
        class="card-progress-bar__fill"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.controls-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $space-sm;
  max-width: 600px;
  margin: 0 auto $space-xl;
  padding: $space-md;
  background: transparent;
  border-radius: $radius-xl;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  transition: all $transition-normal;

  &--active {
    background: $surface-dark-300;
    box-shadow: $shadow-dark-raised-sm;
  }
}

.prep-toggle-btn {
  margin-left: auto;
}

.card-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: color.change(#000, $alpha: 0.2);

  &__fill {
    height: 100%;
    background: $accent-teal;
    box-shadow: 0 0 10px color.change($surface-light-100, $alpha: 0.5);
    transition: width $transition-normal;
  }
}

.scale-control {
  display: flex;
  align-items: center;
  gap: $space-sm;

  &__label {
    font-size: $font-size-caption;
    font-weight: $font-weight-medium;
    color: $text-light-muted;
  }

  &__buttons {
    display: flex;
    align-items: center;
    gap: $space-2xs;
    background: $surface-dark-400;
    border-radius: $radius-full;
    padding: 2px;
    box-shadow: $shadow-dark-inset-sm;
  }

  &__value {
    min-width: 24px;
    text-align: center;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-extrabold;
    padding: 0 $space-xs;
    color: $text-light-primary;
  }
}

.scale-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: $surface-dark-200;
  border: none;
  border-radius: $radius-full;
  color: $text-light-primary;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    background: $accent-coral;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

// Transitions
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all $transition-normal;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>

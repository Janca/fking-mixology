<script setup lang="ts">
import AppButton from "@/components/common/AppButton.vue";

defineProps<{
  show: boolean;
  isCompleting: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="dialog-overlay" @click.self="emit('close')">
        <div class="dialog-content">
          <button class="dialog-close" @click="emit('close')">✕</button>
          <div class="dialog-body">
            <div class="dialog-icon">🍹</div>
            <h2 class="dialog-title">Ready to serve?</h2>
            <p class="dialog-text">
              This will use ingredients from your pantry and mark this cocktail
              as completed.
            </p>
            <AppButton
              class="dialog-confirm"
              variant="teal"
              size="lg"
              full-width
              :loading="isCompleting"
              @click="emit('confirm')"
            >
              {{ isCompleting ? "Mixing..." : "Enjoy! 🥂" }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  padding: $space-md;
}

.dialog-content {
  background: $surface-dark-200;
  border: 1px solid rgba($accent-teal, 0.3);
  border-radius: $radius-2xl;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dialog-close {
  position: absolute;
  top: $space-md;
  right: $space-md;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  color: $text-light-muted;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all $transition-fast;

  &:hover {
    background: rgba(white, 0.1);
    color: white;
  }
}

.dialog-body {
  padding: $space-xl;
  text-align: center;
}

.dialog-icon {
  font-size: 4rem;
  margin-bottom: $space-md;
}

.dialog-title {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-sm;
}

.dialog-text {
  font-size: $font-size-body;
  color: $text-light-secondary;
  margin-bottom: $space-xl;
  line-height: 1.5;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-normal;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

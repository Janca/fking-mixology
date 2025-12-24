<script setup lang="ts">
/**
 * LedgerDeleteDialog - Confirmation dialog for deleting a session
 */
import type { LedgerSession } from "@/types";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
  show: boolean;
  session: LedgerSession | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show && session"
        class="dialog-overlay"
        @click.self="emit('close')"
      >
        <div class="dialog-content">
          <button class="dialog-close" @click="emit('close')">✕</button>
          <div class="dialog-body">
            <AppEmoji class="dialog-icon">⚠️</AppEmoji>
            <h2 class="dialog-title">Delete Session?</h2>
            <p class="dialog-text">
              Are you sure you want to delete
              <strong>"{{ session.name }}"</strong>? This will permanently
              remove all {{ session.totalDrinks }} drink entries.
            </p>
            <p class="dialog-warning">This action cannot be undone.</p>

            <div class="dialog-actions">
              <AppButton
                variant="dark"
                size="md"
                rounded
                @click="emit('close')"
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                size="md"
                rounded
                @click="emit('confirm')"
              >
                Delete Session
              </AppButton>
            </div>
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
  border: 1px solid rgba($accent-coral, 0.5);
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
  color: $accent-coral;
  margin-bottom: $space-sm;
}

.dialog-text {
  font-size: $font-size-body;
  color: $text-light-secondary;
  margin-bottom: $space-sm;
  line-height: 1.5;

  strong {
    color: $text-light-primary;
  }
}

.dialog-warning {
  font-size: $font-size-body-sm;
  color: $accent-coral;
  margin-bottom: $space-xl;
}

.dialog-actions {
  display: flex;
  gap: $space-sm;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-normal;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

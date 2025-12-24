<script setup lang="ts">
/**
 * LedgerRenameDialog - Dialog for renaming a session
 */
import { ref, watch } from "vue";
import type { LedgerSession } from "@/types";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

const props = defineProps<{
  show: boolean;
  session: LedgerSession | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", name: string): void;
}>();

const newName = ref("");

watch(
  () => props.session,
  (session) => {
    if (session) {
      newName.value = session.name;
    }
  }
);

function handleConfirm() {
  if (newName.value.trim()) {
    emit("confirm", newName.value.trim());
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="dialog-overlay" @click.self="emit('close')">
        <div class="dialog-content">
          <button class="dialog-close" @click="emit('close')">✕</button>
          <div class="dialog-body">
            <AppEmoji class="dialog-icon">✏️</AppEmoji>
            <h2 class="dialog-title">Rename Session</h2>

            <div class="input-group">
              <label for="new-name" class="input-label">Session Name</label>
              <input
                id="new-name"
                v-model="newName"
                type="text"
                class="input-field"
                placeholder="Enter a new name"
                @keyup.enter="handleConfirm"
              />
            </div>

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
                :disabled="!newName.trim()"
                @click="handleConfirm"
              >
                Save
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: color.change(#000, $alpha: 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  padding: $space-md;
}

.dialog-content {
  background: $surface-dark-200;
  border: 1px solid color.change($surface-light-100, $alpha: 0.3);
  border-radius: $radius-2xl;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 40px color.change(#000, $alpha: 0.5);
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
    background: color.change(white, $alpha: 0.1);
    color: white;
  }
}

.dialog-body {
  padding: $space-xl;
  text-align: center;
}

.dialog-icon {
  font-size: 3rem;
  margin-bottom: $space-md;
}

.dialog-title {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-lg;
}

.input-group {
  margin-bottom: $space-xl;
  text-align: left;
}

.input-label {
  display: block;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-medium;
  color: $text-light-secondary;
  margin-bottom: $space-xs;
}

.input-field {
  width: 100%;
  padding: $space-sm $space-md;
  background: $surface-dark-400;
  border: 2px solid transparent;
  border-radius: $radius-lg;
  font-size: $font-size-body;
  color: $text-light-primary;
  transition: all $transition-fast;

  &::placeholder {
    color: $text-light-muted;
  }

  &:focus {
    outline: none;
    border-color: $accent-coral;
  }
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

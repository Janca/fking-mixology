<script setup lang="ts">
/**
 * LedgerMergeDialog - Dialog for merging multiple sessions
 */
import { ref, watch } from "vue";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

const props = defineProps<{
  show: boolean;
  sessionCount: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", name: string): void;
}>();

const mergeName = ref("");

// Generate default name when dialog opens
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      const now = new Date();
      mergeName.value = `Merged Session - ${now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }
  }
);

function handleConfirm() {
  if (mergeName.value.trim()) {
    emit("confirm", mergeName.value.trim());
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
            <AppEmoji class="dialog-icon">🔗</AppEmoji>
            <h2 class="dialog-title">Merge Sessions</h2>
            <p class="dialog-text">
              Combine {{ sessionCount }} sessions into one. All drink entries
              will be preserved.
            </p>

            <div class="input-group">
              <label for="merge-name" class="input-label"
                >New Session Name</label
              >
              <input
                id="merge-name"
                v-model="mergeName"
                type="text"
                class="input-field"
                placeholder="Enter a name for the merged session"
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
                variant="teal"
                size="md"
                rounded
                :disabled="!mergeName.trim()"
                @click="handleConfirm"
              >
                Merge Sessions
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
  max-width: 440px;
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
    border-color: $accent-teal;
  }
}

.dialog-actions {
  display: flex;
  gap: $space-sm;
  justify-content: center;
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

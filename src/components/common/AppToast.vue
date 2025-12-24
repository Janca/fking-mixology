<script setup lang="ts">
import { computed } from "vue";
import { type Toast, useToastStore } from "@/stores/toast";

const props = defineProps<{
  toast: Toast;
}>();

const store = useToastStore();

const isSticky = computed(() => props.toast.sticky);
const duration = computed(() => props.toast.duration || 5);

function dismiss(event?: Event) {
  if (props.toast.onDismiss) {
    // Cast to MouseEvent if possible, or just pass generic event.
    // Store expects MouseEvent.
    props.toast.onDismiss(event as MouseEvent);
  }
  store.removeToast(props.toast.id);
}

function handleClick() {
  if (props.toast.onClick) {
    props.toast.onClick();
    return;
  }

  if (!isSticky.value) {
    dismiss();
  }
}
</script>

<template>
  <div
    class="app-toast"
    role="alert"
    @click="handleClick"
    :class="{ 'app-toast--clickable': !!toast.onClick }"
  >
    <div class="app-toast__main">
      <div class="app-toast__header">
        <span v-if="toast.badge" class="app-toast__badge">{{
          toast.badge
        }}</span>
        <h4 class="app-toast__title">{{ toast.title }}</h4>
      </div>

      <p v-if="toast.message" class="app-toast__message">
        {{ toast.message }}
      </p>
    </div>

    <div
      v-if="toast.actions && toast.actions.length > 0"
      class="app-toast__actions"
    >
      <button
        v-for="(action, index) in toast.actions"
        :key="index"
        class="app-toast__action-btn"
        :class="[`app-toast__action-btn--${action.variant || 'default'}`]"
        :title="action.label"
        @click.stop="action.onClick"
      >
        <span class="material-icons">{{ action.icon }}</span>
      </button>
    </div>

    <button v-if="isSticky" class="app-toast__close" @click.stop="dismiss">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>

    <!-- Progress Bar -->
    <div v-if="!isSticky && duration > 0" class="app-toast__progress">
      <div
        class="app-toast__progress-fill"
        :style="{ animationDuration: `${duration}s` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.app-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  width: 100%;
  max-width: 400px;
  min-width: 300px;
  padding: $space-md;
  border-radius: $radius-lg;

  // Acrylic / Fluent Design Base
  background: rgba(255, 255, 255, 0.75); // High transparency
  backdrop-filter: blur(20px) saturate(180%); // Strong blur and saturation boost
  border: 1px solid rgba(255, 255, 255, 0.6); // Subtle light border
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.05); // Deep, soft shadow

  overflow: hidden;
  pointer-events: auto;
  transition: all $transition-normal;

  &--clickable {
    cursor: pointer;
  }

  // Optional: subtle noise texture overlay for "Frosted Glass" feel
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.03;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    border-radius: inherit;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-xs;
    margin-bottom: $space-2xs;
  }

  &__badge {
    font-size: 1.125rem;
    line-height: 1;
  }

  &__title {
    font-size: $font-size-body;
    font-weight: $font-weight-bold;
    color: $text-dark-primary;
    margin: 0;
  }

  &__message {
    font-size: $font-size-caption;
    color: $text-dark-muted;
    margin: 0;
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-xs;
    margin-left: $space-xs;
  }

  &__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: rgba($surface-light-100, 0.5); // Subtle background
    border-radius: $radius-full;
    color: $text-dark-primary;
    cursor: pointer;
    transition: all $transition-fast;
    border: 1px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &--danger {
      color: #ef4444;
      &:hover {
        background: rgba(#ef4444, 0.1);
        box-shadow: none;
      }
    }

    &--primary {
      color: $accent-blue;
      &:hover {
        background: rgba($accent-blue, 0.1);
        box-shadow: none;
      }
    }
  }

  &__close {
    position: absolute;
    top: $space-xs;
    right: $space-xs;
    background: none;
    border: none;
    color: $text-dark-muted;
    cursor: pointer;
    padding: 4px;
    opacity: 0.5;
    transition: all $transition-fast;
    z-index: 10;
    border-radius: $radius-full;

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.05);
    }
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.05);
  }

  &__progress-fill {
    height: 100%;
    background: $accent-teal;
    width: 100%;
    transform-origin: left;
    animation-name: progress-shrink;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>

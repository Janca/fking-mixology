<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import AppToast from "./AppToast.vue";

const toastStore = useToastStore();
</script>

<template>
  <div class="app-toast-container">
    <TransitionGroup name="toast">
      <AppToast v-for="toast in toastStore.toasts" :key="toast.id" :toast="toast" />
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-toast-container {
  position: fixed;
  bottom: $space-lg;
  right: $space-lg;
  z-index: 9999;
  gap: $space-sm;
  pointer-events: none; // Allow clicking through the container space
  max-width: 100%;
  width: 400px;

  display: flex;
  flex-direction: column;

  @include mobile-only {
    top: 82px;
    bottom: unset;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100% - #{$space-md * 2});
    max-width: 400px;
  }
}

// Transition styles
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}


.toast-move {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
</style>

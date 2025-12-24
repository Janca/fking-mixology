<script setup lang="ts">
/**
 * App.vue - Root Application Component
 */
import { ref, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useAchievementsStore } from "@/stores/achievements";
import TheHeader from "@/components/layout/TheHeader.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppToastContainer from "@/components/common/AppToastContainer.vue";

const appStore = useAppStore();
const achievementsStore = useAchievementsStore();
const isTransitioning = ref(false);

function onBeforeLeave() {
  //document.body.style.overflow = "hidden";
}

function onAfterEnter() {
  //document.body.style.overflow = "auto";
}

const handleFirstInteraction = () => {
  achievementsStore.trackEvent("app_opens");
  window.removeEventListener("click", handleFirstInteraction);
  window.removeEventListener("keydown", handleFirstInteraction);
  window.removeEventListener("touchstart", handleFirstInteraction);
};

onMounted(async () => {
  appStore.initialize();

  // Initialize achievements
  await achievementsStore.loadData();

  // Trigger First Sip on first interaction
  window.addEventListener("click", handleFirstInteraction);
  window.addEventListener("keydown", handleFirstInteraction);
  window.addEventListener("touchstart", handleFirstInteraction);
});
</script>

<template>
  <div class="app-root" :class="{ 'app-root--transitioning': isTransitioning }">
    <!-- Loading Screen -->
    <Transition name="fade">
      <div v-if="appStore.isLoading" class="loading-screen">
        <div class="loading-screen__spinner" />
        <p class="loading-screen__text">Mixing up something good...</p>
      </div>
    </Transition>

    <!-- Error Screen -->
    <Transition name="fade">
      <div v-if="!appStore.isLoading && appStore.error" class="error-screen">
        <span class="error-screen__icon">🍸</span>
        <h2 class="error-screen__title">Oops!</h2>
        <p class="error-screen__message">{{ appStore.error }}</p>
        <AppButton
          class="error-screen__button"
          variant="primary"
          @click="appStore.initialize(true)"
        >
          Try Again
        </AppButton>
      </div>
    </Transition>

    <!-- Main App -->
    <template v-if="appStore.isReady">
      <TheHeader />
      <RouterView v-slot="{ Component }">
        <Transition
          name="page"
          mode="out-in"
          @before-leave="onBeforeLeave"
          @after-enter="onAfterEnter"
        >
          <KeepAlive include="BrowseView,HomeView">
            <component :is="Component" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </template>

    <AppToastContainer />
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

// Page Transition
.page-enter-active,
.page-leave-active {
  transition: opacity $transition-smooth, transform $transition-smooth;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.page-leave-active {
  position: absolute;
  width: 100%;
  height: 120%;
  overflow: hidden;
}

// Fade Transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-smooth;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
import type { CocktailWithDetails } from "@/types";
import { getCategoryEmoji } from "@/utils/cocktailUtils";

defineProps<{
  cocktail: CocktailWithDetails | null;
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: "goHome"): void;
  (e: "scrollDown"): void;
}>();

const showScrollArrow = ref(false);

function checkVisibility() {
  if (typeof window === "undefined") return;
  // Show on mobile devices with limited height where ingredients might be off-screen
  const isMobile = window.innerWidth <= 768;
  const isShort = window.innerHeight < 900;
  showScrollArrow.value = isMobile && isShort;
}

onMounted(() => {
  checkVisibility();
  window.addEventListener("resize", checkVisibility);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkVisibility);
});
</script>

<template>
  <div class="cocktail-header-wrapper">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <AppEmoji class="loading-spinner">🍸</AppEmoji>
      <p>Mixing up the details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <AppEmoji class="error-icon">😕</AppEmoji>
      <h2>{{ error }}</h2>
      <AppButton variant="primary" @click="emit('goHome')"> Go Home </AppButton>
    </div>

    <!-- Recipe Header -->
    <div v-else-if="cocktail" class="recipe-header">
      <AppEmoji class="recipe-header__emoji">
        {{ getCategoryEmoji(cocktail.category.name) }}
      </AppEmoji>
      <span class="recipe-header__category">{{ cocktail.category.name }}</span>
      <h1 class="recipe-header__name">{{ cocktail.name }}</h1>
      <p class="recipe-header__ingredients">
        {{ cocktail.ingredients.length }} ingredients
      </p>

      <!-- Scroll Arrow -->
      <Transition name="fade">
        <button v-if="showScrollArrow" class="scroll-arrow" @click="emit('scrollDown')"
          aria-label="Scroll to ingredients">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
            stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.cocktail-header-wrapper {
  width: 100%;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: $space-2xl;

  h2 {
    color: $text-dark-primary;
    margin-bottom: $space-lg;
  }
}

.loading-spinner {
  font-size: 4rem;
  animation: spin-slow 2s linear infinite;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: $space-md;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// Recipe Header
.recipe-header {
  text-align: center;
  max-width: 650px;
  margin: 0 auto;
  padding: 0 $space-md;

  &__emoji {
    font-size: 4.5rem;
    margin-bottom: $space-lg;
    animation: float-gentle 3s ease-in-out infinite;
    display: inline-block;
    filter: drop-shadow(0 6px 16px color.change($accent-coral, $alpha: 0.25));

    @include mobile-only {
      font-size: 3.5rem;
    }
  }

  &__category {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: $space-xs $space-lg;
    background: linear-gradient(135deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    border-radius: $radius-full;
    font-size: $font-size-tiny;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: white;
    margin: 0 auto;
    margin-bottom: $space-md;
    box-shadow: 0 4px 12px color.change($accent-coral, $alpha: 0.3);
    text-shadow: 0 1px 2px color.change(#000, $alpha: 0.15);
  }

  &__name {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    letter-spacing: -0.03em;
    margin-bottom: $space-sm;
    line-height: 1.1;

    @include tablet-up {
      font-size: $font-size-hero;
    }

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }

  &__ingredients {
    font-size: $font-size-body-lg;
    color: $text-dark-muted;
    padding: $space-xs $space-md;
    background: color.change($surface-light-300, $alpha: 0.5);
    border-radius: $radius-full;
    display: inline-block;
  }
}

@keyframes float-gentle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.scroll-arrow {
  margin: $space-xl auto 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg,
      $surface-light-100 0%,
      $surface-light-200 100%);
  border: 1px solid color.change($surface-light-400, $alpha: 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $accent-coral;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: 0 4px 12px color.change(#000, $alpha: 0.06),
    0 8px 24px color.change(#000, $alpha: 0.04);

  &:hover {
    transform: translateY(-4px);
    color: $accent-coral-dark;
    box-shadow: 0 8px 24px color.change(#000, $alpha: 0.1),
      0 12px 32px color.change(#000, $alpha: 0.06);
    border-color: color.change($accent-coral, $alpha: 0.3);
  }

  &:active {
    transform: translateY(-2px) scale(0.96);
    box-shadow: 0 2px 8px color.change(#000, $alpha: 0.08);
  }

  svg {
    width: 24px;
    height: 24px;
    animation: bounce-arrow 2s infinite;
  }
}

@keyframes bounce-arrow {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-5px);
  }

  60% {
    transform: translateY(-3px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

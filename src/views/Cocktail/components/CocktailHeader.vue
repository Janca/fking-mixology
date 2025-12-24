<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AppButton from "@/components/common/AppButton.vue";
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
      <div class="loading-spinner">🍸</div>
      <p>Mixing up the details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😕</div>
      <h2>{{ error }}</h2>
      <AppButton variant="primary" @click="emit('goHome')"> Go Home </AppButton>
    </div>

    <!-- Recipe Header -->
    <div v-else-if="cocktail" class="recipe-header">
      <div class="recipe-header__emoji">
        {{ getCategoryEmoji(cocktail.category.name) }}
      </div>
      <span class="recipe-header__category">{{ cocktail.category.name }}</span>
      <h1 class="recipe-header__name">{{ cocktail.name }}</h1>
      <p class="recipe-header__ingredients">
        {{ cocktail.ingredients.length }} ingredients
      </p>

      <!-- Scroll Arrow -->
      <Transition name="fade">
        <button
          v-if="showScrollArrow"
          class="scroll-arrow"
          @click="emit('scrollDown')"
          aria-label="Scroll to ingredients"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  max-width: 600px;
  margin: 0 auto;

  &__emoji {
    font-size: 4rem;
    margin-bottom: $space-md;
    animation: float-gentle 3s ease-in-out infinite;
  }

  &__category {
    display: inline-block;
    padding: $space-2xs $space-md;
    background: $gradient-coral;
    border-radius: $radius-full;
    font-size: $font-size-tiny;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: white;
    margin-bottom: $space-sm;
  }

  &__name {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    letter-spacing: -0.03em;
    margin-bottom: $space-xs;

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }

  &__ingredients {
    font-size: $font-size-body;
    color: $text-dark-muted;
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
  margin: $space-lg auto 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $surface-light-100;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $accent-coral;
  cursor: pointer;
  transition: all $transition-normal;

  // Neumorphic Shadow
  box-shadow: 6px 6px 12px rgba(166, 180, 200, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 1);

  &:hover {
    transform: translateY(-2px);
    color: $accent-coral-dark;
  }

  &:active {
    box-shadow: inset 4px 4px 8px rgba(166, 180, 200, 0.4),
      inset -4px -4px 8px rgba(255, 255, 255, 1);
    transform: translateY(0) scale(0.95);
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

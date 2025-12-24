<script setup lang="ts">
import { useRouter } from "vue-router";
import CocktailCard from "@/components/common/CocktailCard.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
import { useNavigationStore } from "@/stores/navigation";
import type { CocktailWithDetails } from "@/types";

defineProps<{
  cocktails: CocktailWithDetails[];
  isLoading: boolean;
}>();

const router = useRouter();
const navigationStore = useNavigationStore();

async function handleCocktailClick(cocktail: CocktailWithDetails) {
  // Save scroll target to navigation store before navigating
  navigationStore.setScrollTarget("browse", `drink-${cocktail.slug}`);
  router.push({ name: "cocktail", params: { slug: cocktail.slug } });
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="isLoading" key="loader" class="loading-state">
      <AppEmoji class="loading-spinner">🍸</AppEmoji>
    </div>

    <TransitionGroup
      v-else-if="cocktails.length > 0"
      key="grid"
      name="grid"
      tag="div"
      class="cocktails-grid"
    >
      <CocktailCard
        v-for="cocktail in cocktails"
        :key="cocktail.id"
        :id="`drink-${cocktail.slug}`"
        :cocktail="cocktail"
        variant="dark"
        @click="handleCocktailClick(cocktail)"
      />
    </TransitionGroup>

    <div v-else key="empty" class="empty-message">No cocktails found</div>
  </Transition>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.cocktails-grid {
  display: grid;
  gap: $space-md;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;

  @include tablet-up {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop-up {
    grid-template-columns: repeat(3, 1fr);
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  font-size: 3rem;
  animation: spin-slow 2s linear infinite;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-message {
  text-align: center;
  color: $text-light-muted;
  padding: $space-2xl;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.grid-move,
.grid-enter-active,
.grid-leave-active {
  transition: all $transition-bounce;
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.grid-leave-active {
  position: absolute;
  width: 100%;
  max-width: calc(33.333% - #{$space-md});

  @include mobile-only {
    max-width: calc(100% - #{$space-md});
  }

  @include tablet-up {
    max-width: calc(50% - #{$space-md});
  }
}
</style>

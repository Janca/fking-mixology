<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCocktailsStore } from "@/stores/cocktails";
import CocktailCard from "@/components/common/CocktailCard.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

const router = useRouter();
const cocktailsStore = useCocktailsStore();

// Use computed properties from store
const availableCocktails = computed(() => cocktailsStore.matches);
const hasMatches = computed(() => cocktailsStore.hasMatches);
const perfectMatches = computed(() => cocktailsStore.perfectMatches);

function handleCocktailClick(slug: string) {
  router.push({ name: "cocktail", params: { slug } });
}
</script>

<template>
  <div class="cocktail-matches">
    <div v-if="!hasMatches" class="empty-state">
      <AppEmoji class="empty-state__emoji">🍹</AppEmoji>
      <h2 class="empty-state__title">No recipes yet</h2>
      <p class="empty-state__text">
        Add ingredients to see what cocktails you can make
      </p>
    </div>

    <template v-else>
      <div class="section-header">
        <h2 class="section-title"><AppEmoji>✨</AppEmoji> What You Can Make</h2>
        <span class="section-count">{{ perfectMatches.length }} ready</span>
      </div>

      <div class="cocktails-grid">
        <CocktailCard
          v-for="match in availableCocktails"
          :key="match.cocktail.id"
          :cocktail="match.cocktail"
          :match="match"
          variant="dark"
          @click="handleCocktailClick(match.cocktail.slug)"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.cocktail-matches {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: $space-2xl;

  &__emoji {
    font-size: 3.5rem;
    margin-bottom: $space-md;
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-xs;
  }

  &__text {
    font-size: $font-size-body;
    color: $text-light-secondary;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-lg;
  padding: 0 $space-sm;

  @include tablet-up {
    padding: 0 $space-lg;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-extrabold;
  color: $text-light-primary;
}

.section-count {
  font-family: $font-mono;
  font-size: $font-size-caption;
  color: $text-light-muted;
  background: color.change(white, $alpha: 0.1);
  padding: $space-xs $space-sm;
  border-radius: $radius-full;
}

.cocktails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $space-lg;
  padding: 0 $space-sm;

  @include tablet-up {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 $space-lg;
  }

  @include desktop-up {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

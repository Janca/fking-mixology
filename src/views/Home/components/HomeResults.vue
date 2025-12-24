<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCocktailsStore } from "@/stores/cocktails";
import { useNavigationStore } from "@/stores/navigation";
import CocktailCard from "@/components/common/CocktailCard.vue";

const props = defineProps<{
  mode: "search" | "pantry";
}>();

const router = useRouter();
const cocktailsStore = useCocktailsStore();
const navigationStore = useNavigationStore();

const matches = computed(() =>
  props.mode === "search"
    ? cocktailsStore.matches
    : cocktailsStore.pantryMatches
);

const perfectMatches = computed(() =>
  matches.value.filter((m) => m.matchPercentage === 100)
);

const partialMatches = computed(() =>
  matches.value.filter((m) => m.matchPercentage > 0 && m.matchPercentage < 100)
);

// Labels based on mode
const perfectLabel = computed(() =>
  props.mode === "search" ? "Perfect" : "Ready to Make"
);

const partialLabel = computed(() =>
  props.mode === "search" ? "Possible" : "Almost"
);

const sectionTitle = computed(() => ({
  perfect: props.mode === "search" ? "Perfect Matches" : "From Your Pantry",
  partial: "Almost There",
}));

const sectionEmoji = computed(() => ({
  perfect: props.mode === "search" ? "✨" : "🍾",
  partial: props.mode === "search" ? "🔮" : "🛒",
}));

function handleCocktailClick(slug: string) {
  // Save scroll target to navigation store before navigating
  navigationStore.setScrollTarget("home", slug);
  router.push({ name: "cocktail", params: { slug } });
}
</script>

<template>
  <div class="results-content">
    <div class="results-header">
      <div class="results-stat">
        <span class="results-stat__number">{{ perfectMatches.length }}</span>
        <span class="results-stat__label">{{ perfectLabel }}</span>
      </div>
      <div class="results-stat">
        <span class="results-stat__number">{{ partialMatches.length }}</span>
        <span class="results-stat__label">{{ partialLabel }}</span>
      </div>
    </div>

    <!-- Perfect Matches Section -->
    <div v-if="perfectMatches.length > 0" class="results-section">
      <h2 class="results-section__title">
        <span class="results-section__emoji">{{ sectionEmoji.perfect }}</span>
        {{ sectionTitle.perfect }}
      </h2>
      <div class="results-grid">
        <CocktailCard
          v-for="match in perfectMatches"
          :key="match.cocktail.id"
          :id="match.cocktail.slug"
          :cocktail="match.cocktail"
          :match="match"
          variant="dark"
          @click="handleCocktailClick(match.cocktail.slug)"
        />
      </div>
    </div>

    <!-- Partial Matches Section -->
    <div v-if="partialMatches.length > 0" class="results-section">
      <h2 class="results-section__title">
        <span class="results-section__emoji">{{ sectionEmoji.partial }}</span>
        {{ sectionTitle.partial }}
      </h2>
      <div class="results-grid">
        <CocktailCard
          v-for="match in partialMatches"
          :key="match.cocktail.id"
          :id="match.cocktail.slug"
          :cocktail="match.cocktail"
          :match="match"
          variant="dark"
          @click="handleCocktailClick(match.cocktail.slug)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.results-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: center;
  gap: $space-3xl;
  margin-bottom: $space-2xl;
  padding-bottom: $space-xl;
  border-bottom: 1px solid rgba(white, 0.1);
}

.results-stat {
  text-align: center;

  &__number {
    display: block;
    font-family: $font-display;
    font-size: $font-size-h1;
    font-weight: $font-weight-extrabold;
    color: $text-light-primary;
    line-height: 1;
    margin-bottom: $space-xs;
  }

  &__label {
    font-size: $font-size-body-sm;
    color: $text-light-muted;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
}

.results-section {
  margin-bottom: $space-3xl;

  &__title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-lg;
    padding-left: $space-sm;
  }

  &__emoji {
    font-size: 1.25em;
  }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $space-lg;
  padding: 0 $space-sm;
}
</style>

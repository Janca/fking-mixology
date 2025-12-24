<script setup lang="ts">
import { computed } from "vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
import { useRouter } from "vue-router";
import { usePantryStore } from "@/stores/pantry";
import { useCocktailsStore } from "@/stores/cocktails";
import { useNavigationStore } from "@/stores/navigation";
import { usePantryFormatter } from "@/composables/usePantryFormatter";

const router = useRouter();
const pantryStore = usePantryStore();
const cocktailsStore = useCocktailsStore();
const navigationStore = useNavigationStore();
const { formatPantryQuantity } = usePantryFormatter();

const perfectPantryMatches = computed(() =>
  cocktailsStore.pantryMatches.filter((m) => m.matchPercentage === 100)
);

function handleCocktailClick(slug: string) {
  // Save scroll target to navigation store before navigating
  navigationStore.setScrollTarget("home", slug);
  router.push({ name: "cocktail", params: { slug } });
}
</script>

<template>
  <div class="pantry-summary">
    <div class="pantry-summary__glass">
      <div class="pantry-summary__header">
        <AppEmoji class="pantry-summary__icon">🍾</AppEmoji>
        <div class="pantry-summary__title">
          <h2>Your Pantry</h2>
          <p>{{ pantryStore.itemCount }} ingredients stocked</p>
        </div>
        <RouterLink to="/pantry" class="pantry-summary__link">
          Manage →
        </RouterLink>
      </div>

      <!-- Top Ingredients Preview -->
      <div class="pantry-summary__items">
        <div
          v-for="item in pantryStore.items.slice(0, 4)"
          :key="item.id"
          class="pantry-item-mini"
        >
          <span class="pantry-item-mini__name">{{ item.ingredient.name }}</span>
          <span class="pantry-item-mini__qty">{{
            formatPantryQuantity(item.quantityMl)
          }}</span>
        </div>
        <div
          v-if="pantryStore.itemCount > 4"
          class="pantry-item-mini pantry-item-mini--more"
        >
          +{{ pantryStore.itemCount - 4 }} more
        </div>
      </div>

      <!-- Perfect Matches from Pantry -->
      <div
        v-if="perfectPantryMatches.length > 0"
        class="pantry-summary__matches"
      >
        <h3>
          <AppEmoji class="match-icon">✨</AppEmoji>
          {{ perfectPantryMatches.length }} drinks you can make now
        </h3>
        <div class="pantry-drinks">
          <button
            v-for="match in perfectPantryMatches.slice(0, 3)"
            :key="match.cocktail.id"
            :id="match.cocktail.slug"
            class="pantry-drink"
            @click="handleCocktailClick(match.cocktail.slug)"
          >
            <span class="pantry-drink__name">{{ match.cocktail.name }}</span>
            <span class="pantry-drink__arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.pantry-summary {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 $space-md;

  &__glass {
    background: rgba(white, 0.7);
    backdrop-filter: blur(20px);
    border-radius: $radius-2xl;
    padding: $space-lg;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(white, 0.8);
    border: 1px solid rgba(white, 0.5);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin-bottom: $space-lg;
  }

  &__icon {
    font-size: 2.5rem;
  }

  &__title {
    flex: 1;

    h2 {
      font-family: $font-display;
      font-size: $font-size-h3;
      font-weight: $font-weight-bold;
      color: $text-dark-primary;
      margin-bottom: $space-2xs;
    }

    p {
      font-size: $font-size-body-sm;
      color: $text-dark-muted;
    }
  }

  &__link {
    font-size: $font-size-body-sm;
    font-weight: $font-weight-semibold;
    color: $accent-coral;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: darken($accent-coral, 10%);
    }
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
    margin-bottom: $space-lg;
  }

  &__matches {
    padding-top: $space-lg;
    border-top: 1px solid rgba($surface-dark-200, 0.15);

    h3 {
      display: flex;
      align-items: center;
      gap: $space-xs;
      font-size: $font-size-body-sm;
      font-weight: $font-weight-semibold;
      color: $text-dark-primary;
      margin-bottom: $space-md;

      .match-icon {
        font-size: 1em;
      }
    }
  }
}

.pantry-item-mini {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-xs $space-sm;
  background: rgba($surface-dark-200, 0.1);
  border-radius: $radius-full;
  font-size: $font-size-caption;

  &__name {
    color: $text-dark-primary;
    font-weight: $font-weight-medium;
  }

  &__qty {
    color: $text-dark-muted;
  }

  &--more {
    color: $text-dark-muted;
    font-style: italic;
  }
}

.pantry-drinks {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
}

.pantry-drink {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-sm $space-md;
  background: $gradient-coral;
  border: none;
  border-radius: $radius-full;
  color: white;
  font-family: $font-body;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-fast;
  box-shadow: 0 4px 12px rgba($accent-coral, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba($accent-coral, 0.4);
  }

  &__arrow {
    opacity: 0.8;
  }
}
</style>

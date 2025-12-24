<script setup lang="ts">
import { formatInstructions } from "@/utils/cocktailUtils";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
  method: string;
  garnish?: string | null;
}>();
</script>

<template>
  <div>
    <!-- Method -->
    <div class="recipe-section">
      <h2 class="recipe-section__title">
        <AppEmoji class="recipe-section__emoji">📝</AppEmoji>
        Method
      </h2>
      <p class="recipe-method">{{ formatInstructions(method) }}</p>
    </div>

    <!-- Garnish (from cocktail.garnish field, if present) -->
    <div v-if="garnish" class="recipe-section">
      <h2 class="recipe-section__title">
        <AppEmoji class="recipe-section__emoji">🌿</AppEmoji>
        Garnish
      </h2>
      <p class="recipe-garnish">{{ garnish }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.recipe-section {
  max-width: 600px;
  margin: 0 auto $space-xl;

  &__title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-md;
  }

  &__emoji {
    font-size: 1.25em;
  }
}

.recipe-method {
  font-size: $font-size-body;
  line-height: 1.6;
  color: $text-light-secondary;
  white-space: pre-line;
}

.recipe-garnish {
  font-size: $font-size-body;
  color: $text-light-secondary;
}
</style>

<script setup lang="ts">
import { getCategoryEmoji } from "@/utils/cocktailUtils";
import AppEmoji from "@/components/common/AppEmoji.vue";
import type { Category } from "@/types";

defineProps<{
  categories: Category[];
  selectedCategory: Category | null;
}>();

const emit = defineEmits<{
  (e: "select", category: Category): void;
}>();
</script>

<template>
  <div class="category-tabs">
    <button
      v-for="category in categories"
      :key="category.id"
      class="category-tab"
      :class="{
        'category-tab--active': selectedCategory?.id === category.id,
      }"
      @click="emit('select', category)"
    >
      <AppEmoji class="category-tab__emoji">
        {{ getCategoryEmoji(category.name) }}
      </AppEmoji>
      <span class="category-tab__name">{{ category.name }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.category-tabs {
  display: flex;
  justify-content: center;
  gap: $space-sm;
  flex-wrap: wrap;
  max-width: 100%;
  width: 800px;
  margin: 0 auto;
  padding: 0 $space-md;

  @include mobile-only {
    gap: $space-xs;
  }
}

.category-tab {
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-sm $space-lg;
  background: $surface-light-100;
  border: none;
  border-radius: $radius-full;
  font-family: $font-display;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: $shadow-light-raised-sm;

  @include mobile-only {
    padding: $space-xs $space-sm;
    font-size: $font-size-caption;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-light-raised;
  }

  &--active {
    background: $gradient-coral;
    color: white;
    box-shadow: $glow-coral;

    &:hover {
      box-shadow: 0 12px 40px color.change($surface-light-100, $alpha: 0.4);
    }
  }

  &__emoji {
    font-size: 1.1em;
  }
}
</style>

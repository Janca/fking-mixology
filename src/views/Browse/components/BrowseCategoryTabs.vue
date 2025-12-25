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
    <button v-for="category in categories" :key="category.id" class="category-tab" :class="{
      'category-tab--active': selectedCategory?.id === category.id,
    }" @click="emit('select', category)">
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
  width: 900px;
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
  border: 1px solid color.change($surface-light-400, $alpha: 0.4);
  border-radius: $radius-full;
  font-family: $font-display;
  font-size: $font-size-body-sm;
  font-weight: $font-weight-semibold;
  color: $text-dark-secondary;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: 0 2px 8px color.change(#000, $alpha: 0.04),
    0 4px 16px color.change(#000, $alpha: 0.02);

  @include mobile-only {
    padding: $space-xs $space-md;
    font-size: $font-size-caption;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px color.change(#000, $alpha: 0.08),
      0 12px 32px color.change(#000, $alpha: 0.04);
    border-color: color.change($accent-coral, $alpha: 0.3);
  }

  &--active {
    background: linear-gradient(135deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 16px color.change($accent-coral, $alpha: 0.35),
      0 8px 24px color.change($accent-coral, $alpha: 0.2);
    text-shadow: 0 1px 2px color.change(#000, $alpha: 0.15);

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 24px color.change($accent-coral, $alpha: 0.45),
        0 12px 32px color.change($accent-coral, $alpha: 0.25);
    }

    .category-tab__emoji {
      transform: scale(1.1);
    }
  }

  &__emoji {
    font-size: 1.2em;
    transition: transform $transition-normal;
  }

  &:hover &__emoji {
    transform: scale(1.15);
  }
}
</style>

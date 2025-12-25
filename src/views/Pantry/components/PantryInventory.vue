<script setup lang="ts">
import { usePantryStore } from "@/stores/pantry";
import { usePantryFormatter } from "@/composables/usePantryFormatter";
import AppEmoji from "@/components/common/AppEmoji.vue";

const emit = defineEmits<{
  (e: "removed", ingredientId: number): void;
}>();

const pantryStore = usePantryStore();
const { formatPantryQuantity, formatOz } = usePantryFormatter();

async function removeFromPantry(ingredientId: number) {
  await pantryStore.removeItem(ingredientId);
  emit("removed", ingredientId);
}
</script>

<template>
  <div class="inventory">
    <h2 class="inventory__title">
      <AppEmoji>🧪</AppEmoji> Your Inventory
      <span class="inventory__count">{{ pantryStore.itemCount }}</span>
    </h2>

    <div v-if="pantryStore.items.length === 0" class="inventory__empty">
      <p>No ingredients yet</p>
      <span>Add some from the left!</span>
    </div>

    <div v-else class="inventory__grid">
      <div v-for="item in pantryStore.items" :key="item.id" class="inventory-item">
        <div class="inventory-item__visual">
          <div class="inventory-item__level" :style="{
            height: `${Math.min(100, (item.quantityMl / 750) * 100)}%`,
          }" />
        </div>
        <div class="inventory-item__info">
          <span class="inventory-item__name">{{ item.ingredient.name }}</span>
          <span class="inventory-item__quantity">
            {{ formatPantryQuantity(item.quantityMl) }}
            <span class="inventory-item__alt">({{ formatOz(item.quantityMl) }})</span>
          </span>
        </div>
        <button class="inventory-item__remove" @click="removeFromPantry(item.ingredientId)" aria-label="Remove">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.inventory {
  &__title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-family: $font-display;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $text-dark-primary;
    margin-bottom: $space-lg;
    letter-spacing: -0.02em;
  }

  &__count {
    margin-left: auto;
    padding: $space-xs $space-md;
    background: linear-gradient(135deg,
        $surface-light-200 0%,
        $surface-light-300 100%);
    border-radius: $radius-full;
    font-size: $font-size-caption;
    font-weight: $font-weight-bold;
    color: $accent-coral;
    box-shadow: 0 2px 4px color.change(#000, $alpha: 0.04);
  }

  &__empty {
    text-align: center;
    padding: $space-2xl $space-xl;
    background: linear-gradient(135deg,
        color.change(white, $alpha: 0.6) 0%,
        color.change(white, $alpha: 0.4) 100%);
    border-radius: $radius-xl;
    color: $text-dark-muted;
    border: 1px dashed color.change($surface-light-500, $alpha: 0.4);

    p {
      font-weight: $font-weight-semibold;
      font-size: $font-size-body-lg;
      color: $text-dark-secondary;
      margin-bottom: $space-xs;
    }

    span {
      font-size: $font-size-body-sm;
    }
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: $space-sm;
    max-height: 400px;
    overflow-y: auto;
    padding-right: $space-xs;
    padding-bottom: $space-sm;
  }
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-md $space-lg;
  background: linear-gradient(135deg,
      color.change(white, $alpha: 0.85) 0%,
      color.change(white, $alpha: 0.7) 100%);
  border-radius: $radius-xl;
  transition: all $transition-normal;
  border: 1px solid color.change($surface-light-400, $alpha: 0.3);
  box-shadow: 0 2px 8px color.change(#000, $alpha: 0.03);

  &:hover {
    background: linear-gradient(135deg,
        color.change(white, $alpha: 0.95) 0%,
        color.change(white, $alpha: 0.85) 100%);
    transform: translateX(4px);
    box-shadow: 0 4px 12px color.change(#000, $alpha: 0.06);
  }

  &__visual {
    width: 8px;
    height: 36px;
    background: $surface-light-300;
    border-radius: $radius-full;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 2px color.change(#000, $alpha: 0.06);
  }

  &__level {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg,
        $accent-coral 0%,
        $accent-coral-dark 100%);
    border-radius: $radius-full;
    box-shadow: 0 -2px 4px color.change($accent-coral, $alpha: 0.3);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    display: block;
    font-weight: $font-weight-semibold;
    color: $text-dark-primary;
    font-size: $font-size-body-sm;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  &__quantity {
    font-family: $font-mono;
    font-size: $font-size-caption;
    color: $accent-coral;
    font-weight: $font-weight-medium;
  }

  &__alt {
    color: $text-dark-muted;
    margin-left: $space-2xs;
  }

  &__remove {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color.change($surface-light-200, $alpha: 0.8);
    border: 1px solid color.change($surface-light-400, $alpha: 0.3);
    border-radius: $radius-full;
    color: $text-dark-muted;
    cursor: pointer;
    font-size: 12px;
    transition: all $transition-normal;

    &:hover {
      background: color.change($accent-coral, $alpha: 0.1);
      border-color: color.change($accent-coral, $alpha: 0.3);
      color: $accent-coral;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

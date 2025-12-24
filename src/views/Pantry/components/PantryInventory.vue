<script setup lang="ts">
import { usePantryStore } from "@/stores/pantry";
import { usePantryFormatter } from "@/composables/usePantryFormatter";

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
      <span>🧪</span> Your Inventory
      <span class="inventory__count">{{ pantryStore.itemCount }}</span>
    </h2>

    <div v-if="pantryStore.items.length === 0" class="inventory__empty">
      <p>No ingredients yet</p>
      <span>Add some from the left!</span>
    </div>

    <div v-else class="inventory__grid">
      <div
        v-for="item in pantryStore.items"
        :key="item.id"
        class="inventory-item"
      >
        <div class="inventory-item__visual">
          <div
            class="inventory-item__level"
            :style="{
              height: `${Math.min(100, (item.quantityMl / 750) * 100)}%`,
            }"
          />
        </div>
        <div class="inventory-item__info">
          <span class="inventory-item__name">{{ item.ingredient.name }}</span>
          <span class="inventory-item__quantity">
            {{ formatPantryQuantity(item.quantityMl) }}
            <span class="inventory-item__alt"
              >({{ formatOz(item.quantityMl) }})</span
            >
          </span>
        </div>
        <button
          class="inventory-item__remove"
          @click="removeFromPantry(item.ingredientId)"
          aria-label="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
    margin-bottom: $space-md;
  }

  &__count {
    margin-left: auto;
    padding: $space-2xs $space-sm;
    background: $surface-light-300;
    border-radius: $radius-full;
    font-size: $font-size-caption;
    color: $text-dark-muted;
  }

  &__empty {
    text-align: center;
    padding: $space-2xl $space-lg;
    background: rgba(white, 0.5);
    border-radius: $radius-xl;
    color: $text-dark-muted;

    p {
      font-weight: $font-weight-semibold;
      color: $text-dark-secondary;
      margin-bottom: $space-2xs;
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
  }
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-sm $space-md;
  background: rgba(white, 0.7);
  border-radius: $radius-lg;
  transition: background $transition-fast;

  &:hover {
    background: rgba(white, 0.9);
  }

  &__visual {
    width: 6px;
    height: 32px;
    background: $surface-light-300;
    border-radius: $radius-full;
    overflow: hidden;
    position: relative;
  }

  &__level {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: $gradient-coral;
    border-radius: $radius-full;
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
  }

  &__quantity {
    font-family: $font-mono;
    font-size: $font-size-caption;
    color: $accent-coral;
  }

  &__alt {
    color: $text-dark-muted;
  }

  &__remove {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: $radius-full;
    color: $text-dark-muted;
    cursor: pointer;
    font-size: 12px;
    transition: all $transition-fast;

    &:hover {
      background: rgba($accent-coral, 0.15);
      color: $accent-coral;
    }
  }
}
</style>

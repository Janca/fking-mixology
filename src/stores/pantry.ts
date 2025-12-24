/**
 * Pantry store
 * Manages user's ingredient inventory with quantities
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { db } from "@/services/database";
import { toMl, fromMl, isConvertibleUnit } from "@/utils/unitConversions";
import type { PantryItemWithDetails, VolumeUnit } from "@/types";

export const usePantryStore = defineStore("pantry", () => {
  // ============================================
  // State
  // ============================================

  const items = ref<PantryItemWithDetails[]>([]);
  const isLoading = ref(false);

  // ============================================
  // Computed
  // ============================================

  const itemCount = computed(() => items.value.length);

  const ingredientIds = computed(() =>
    items.value.map((item) => item.ingredientId)
  );

  // ============================================
  // Actions
  // ============================================

  /**
   * Load all pantry items from database
   */
  async function loadItems() {
    isLoading.value = true;
    try {
      const pantryItems = await db.pantryItems.toArray();
      const withDetails: PantryItemWithDetails[] = [];

      for (const item of pantryItems) {
        const ingredient = await db.ingredients.get(item.ingredientId);
        if (ingredient) {
          withDetails.push({ ...item, ingredient });
        }
      }

      items.value = withDetails;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add or update an ingredient in the pantry
   */
  async function addItem(
    ingredientId: number,
    quantity: number,
    unit: string
  ): Promise<void> {
    // Convert to ml for storage
    const quantityMl = isConvertibleUnit(unit) ? toMl(quantity, unit) : 0;

    // Check if already exists
    const existing = await db.pantryItems
      .where("ingredientId")
      .equals(ingredientId)
      .first();

    if (existing) {
      // Update existing - add to current quantity
      await db.pantryItems.update(existing.id!, {
        quantityMl: existing.quantityMl + quantityMl,
        updatedAt: new Date(),
      });
    } else {
      // Add new
      await db.pantryItems.add({
        ingredientId,
        quantityMl,
        updatedAt: new Date(),
      });
    }

    await loadItems();
  }

  /**
   * Set exact quantity for an ingredient (replaces)
   */
  async function setItemQuantity(
    ingredientId: number,
    quantity: number,
    unit: string
  ): Promise<void> {
    const quantityMl = isConvertibleUnit(unit) ? toMl(quantity, unit) : 0;

    const existing = await db.pantryItems
      .where("ingredientId")
      .equals(ingredientId)
      .first();

    if (existing) {
      await db.pantryItems.update(existing.id!, {
        quantityMl,
        updatedAt: new Date(),
      });
    } else {
      await db.pantryItems.add({
        ingredientId,
        quantityMl,
        updatedAt: new Date(),
      });
    }

    await loadItems();
  }

  /**
   * Use (deduct) quantity from pantry
   */
  async function useIngredient(
    ingredientId: number,
    quantity: number,
    unit: string
  ): Promise<boolean> {
    const item = await db.pantryItems
      .where("ingredientId")
      .equals(ingredientId)
      .first();

    if (!item) {
      // Ingredient not in pantry - ignore
      return false;
    }

    const useMl = isConvertibleUnit(unit) ? toMl(quantity, unit) : 0;

    if (useMl === 0) {
      // Non-measurable unit - just acknowledge
      return true;
    }

    const newQuantity = Math.max(0, item.quantityMl - useMl);

    if (newQuantity === 0) {
      // Remove item if depleted
      await db.pantryItems.delete(item.id!);
    } else {
      await db.pantryItems.update(item.id!, {
        quantityMl: newQuantity,
        updatedAt: new Date(),
      });
    }

    await loadItems();
    return true;
  }

  /**
   * Remove an ingredient from pantry completely
   */
  async function removeItem(ingredientId: number): Promise<void> {
    await db.pantryItems.where("ingredientId").equals(ingredientId).delete();
    await loadItems();
  }

  /**
   * Clear the entire pantry
   */
  async function clearPantry(): Promise<void> {
    await db.pantryItems.clear();
    items.value = [];
  }

  /**
   * Check if ingredient exists in pantry
   */
  function hasIngredient(ingredientId: number): boolean {
    return ingredientIds.value.includes(ingredientId);
  }

  /**
   * Get quantity of an ingredient in a specific unit
   */
  function getQuantity(ingredientId: number, unit: VolumeUnit = "ml"): number {
    const item = items.value.find((i) => i.ingredientId === ingredientId);
    if (!item) return 0;
    return fromMl(item.quantityMl, unit);
  }

  /**
   * Get raw ml quantity
   */
  function getQuantityMl(ingredientId: number): number {
    const item = items.value.find((i) => i.ingredientId === ingredientId);
    return item?.quantityMl ?? 0;
  }

  /**
   * Check if there's enough of an ingredient
   */
  function hasEnough(
    ingredientId: number,
    quantity: number,
    unit: string
  ): boolean {
    const item = items.value.find((i) => i.ingredientId === ingredientId);
    if (!item) return false;

    const requiredMl = isConvertibleUnit(unit) ? toMl(quantity, unit) : 0;

    // For non-convertible units, just check if ingredient exists
    if (requiredMl === 0) return true;

    return item.quantityMl >= requiredMl;
  }

  return {
    // State
    items,
    isLoading,

    // Computed
    itemCount,
    ingredientIds,

    // Actions
    loadItems,
    addItem,
    setItemQuantity,
    useIngredient,
    removeItem,
    clearPantry,
    hasIngredient,
    getQuantity,
    getQuantityMl,
    hasEnough,
  };
});

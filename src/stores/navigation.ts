/**
 * Navigation store
 * Manages scroll restoration state across views
 */

import { ref } from "vue";
import { defineStore } from "pinia";

export const useNavigationStore = defineStore("navigation", () => {
  // ============================================
  // State
  // ============================================

  /**
   * The scroll target slug for each view that supports scroll restoration.
   * Key is the view/route name, value is the element slug to scroll to.
   */
  const scrollTargets = ref<Record<string, string | null>>({
    home: null,
    browse: null,
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Set scroll target for a specific view before navigating away
   * @param view - The view name (e.g., 'home', 'browse')
   * @param slug - The element slug to scroll to when returning
   */
  function setScrollTarget(view: string, slug: string) {
    scrollTargets.value[view] = slug;
  }

  /**
   * Get and clear the scroll target for a view (consume it)
   * @param view - The view name
   * @returns The slug to scroll to, or null if none
   */
  function consumeScrollTarget(view: string): string | null {
    const target = scrollTargets.value[view];
    scrollTargets.value[view] = null;
    return target;
  }

  /**
   * Clear scroll target for a specific view without consuming
   * Useful when state changes (like ingredient selection) invalidate the target
   * @param view - The view name
   */
  function clearScrollTarget(view: string) {
    scrollTargets.value[view] = null;
  }

  /**
   * Clear all scroll targets
   */
  function clearAllScrollTargets() {
    Object.keys(scrollTargets.value).forEach((key) => {
      scrollTargets.value[key] = null;
    });
  }

  return {
    // State
    scrollTargets,

    // Actions
    setScrollTarget,
    consumeScrollTarget,
    clearScrollTarget,
    clearAllScrollTargets,
  };
});

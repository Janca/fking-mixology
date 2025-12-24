import { watch, nextTick, type Ref, onActivated } from "vue";
import { useNavigationStore } from "@/stores/navigation";

/**
 * Manages scroll restoration based on Pinia navigation state.
 *
 * @param viewName - The name of the current view (e.g., 'home', 'browse')
 * @param isLoading - Ref indicating if the list data is currently loading
 * @param checkItemExists - Function to check if the scroll target exists in the loaded data
 */
export function useScrollRestoration(
  viewName: string,
  isLoading: Ref<boolean>,
  checkItemExists: (slug: string) => boolean
) {
  const navigationStore = useNavigationStore();

  /**
   * Recursively attempt to find and scroll to element
   */
  function attemptScrollTo(slug: string, attempts = 0) {
    // Prevent infinite loops or excessive attempts
    if (attempts > 10) {
      // Failed to find element after max attempts, clear the target
      navigationStore.clearScrollTarget(viewName);
      return;
    }

    let el: HTMLElement | null = null;

    // Try getElementById first (most reliable)
    el = document.getElementById(slug);

    // Fallback: try query selector with hash
    if (!el) {
      try {
        el = document.querySelector(`#${CSS.escape(slug)}`) as HTMLElement;
      } catch {
        // Ignore invalid selector errors
      }
    }

    if (el) {
      // Scroll behavior: 'auto' is instant, safer for restoration
      el.scrollIntoView({ behavior: "auto", block: "center" });
    } else {
      // Retry with delay
      setTimeout(() => attemptScrollTo(slug, attempts + 1), 100);
    }
  }

  /**
   * Validates the scroll target against the data and scrolls or clears
   */
  function handleScrollCheck() {
    const slug = navigationStore.consumeScrollTarget(viewName);
    if (!slug) return;

    // If the item exists in our data, scroll to it
    if (checkItemExists(slug)) {
      // Wait for DOM
      nextTick(() => {
        attemptScrollTo(slug);
      });
    }
    // If item doesn't exist, target was already consumed/cleared
  }

  // Watch loading state: when loading finishes, check scroll target
  watch(isLoading, (currentLoading, prevLoading) => {
    // Only trigger on finish (true -> false)
    if (!currentLoading && prevLoading) {
      handleScrollCheck();
    }
  });

  // Also handle initial activation (if kept alive) or mount if not loading
  onActivated(() => {
    if (!isLoading.value) {
      handleScrollCheck();
    }
  });

  // Provide a way to manually trigger check (e.g. if data changes without loading state)
  return {
    checkAndScroll: handleScrollCheck,
  };
}

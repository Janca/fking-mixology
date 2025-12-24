import { watch, nextTick, type Ref, onActivated } from "vue";
import { useRoute } from "vue-router";

/**
 * Manages scroll restoration based on URL hash.
 *
 * @param isLoading - Ref indicating if the list data is currently loading
 * @param checkItemExists - Function to check if the hash target exists in the loaded data
 */
export function useScrollRestoration(
  isLoading: Ref<boolean>,
  checkItemExists: (slug: string) => boolean
) {
  const route = useRoute();

  /**
   * Recursively attempt to find and scroll to element
   */
  function attemptScrollTo(hash: string, attempts = 0) {
    // Prevent infinite loops or excessive attempts
    if (attempts > 10) return;

    let el: HTMLElement | null = null;
    try {
      // Try standard query selector (handles valid IDs)
      el = document.querySelector(hash) as HTMLElement;
    } catch {
      // Ignore invalid selector errors
    }

    // Fallback: try getElementById (handles IDs that are invalid selectors like starting with number)
    if (!el && hash.startsWith("#")) {
      el = document.getElementById(hash.slice(1));
    }

    if (el) {
      // Scroll behavior: 'auto' is instant, 'smooth' might be better but 'auto' is safer for restoration
      el.scrollIntoView({ behavior: "auto", block: "center" });

      // Optional: Add a temporary highlight class if needed (not implemented here)
    } else {
      // Retry with exponential backoff or simple delay
      setTimeout(() => attemptScrollTo(hash, attempts + 1), 100);
    }
  }

  /**
   * Validates the hash against the data and scrolls or clears
   */
  function handleHashCheck() {
    const hash = route.hash;
    if (!hash) return;

    // Remove # for ID checking
    const slug = hash.replace(/^#/, "");

    // If the item exists in our data, scroll to it
    if (checkItemExists(slug)) {
      // Wait for DOM
      nextTick(() => {
        attemptScrollTo(hash);
      });
    }
    // If item doesn't exist, do nothing - let useUrlSync handle URL cleanup
    // Attempting to clear the hash here interferes with proper URL updates
  }

  // Watch loading state: when loading finishes, check hash
  watch(isLoading, (currentLoading, prevLoading) => {
    // Only trigger on finish (true -> false)
    if (!currentLoading && prevLoading) {
      handleHashCheck();
    }
  });

  // Also handle initial activation (if kept alive) or mount if not loading
  onActivated(() => {
    if (!isLoading.value) {
      handleHashCheck();
    }
  });

  // Provide a way to manually trigger check (e.g. if data changes without loading state)
  return {
    checkAndScroll: handleHashCheck,
  };
}

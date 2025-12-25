/**
 * Vue Router instance for Mixology Matcher
 */

import { createRouter, createWebHashHistory } from "vue-router";
import { routes } from "./routes";

import { setTitle } from "@/utils/documentUtils";

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      // Delay scroll logic to match page transition duration
      // This prevents the "scroll to top" jump from happening on the leaving page
      setTimeout(() => {
        const appRoot = document.querySelector(".app-root");

        // RESET SCROLL: Only if changing pages (path)
        // With WebHashHistory, `to.hash` is now the route path, so we only check path changes
        if (appRoot && to.path !== from.path) {
          appRoot.scrollTop = 0;
        }

        // Standard Vue Router return values
        if (savedPosition) {
          resolve(savedPosition);
        } else {
          resolve({ top: 0, behavior: "auto" });
        }
      }, 350); // Matches $transition-normal/smooth roughly
    });
  },
});

// Update document title on navigation
router.beforeEach(async (to, _from, next) => {
  let pageTitle: string | undefined;

  const titleMeta = to.meta.title;
  if (typeof titleMeta === "function") {
    try {
      pageTitle = await titleMeta(to);
    } catch (e) {
      console.error("Error generating title:", e);
      pageTitle = "Mixology Matcher";
    }
  } else {
    pageTitle = titleMeta as string | undefined;
  }

  setTitle(pageTitle);

  next();
});

export default router;

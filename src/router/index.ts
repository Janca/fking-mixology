/**
 * Vue Router instance for Mixology Matcher
 */

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      // Delay scroll logic to match page transition duration
      // This prevents the "scroll to top" jump from happening on the leaving page
      setTimeout(() => {
        const appRoot = document.querySelector(".app-root");

        // RESET SCROLL: Only if changing pages (path) AND not returning to a specific hash anchor
        // This ensures:
        // 1. Browsing -> clicking drink (Hash change only) -> NO Scroll
        // 2. Back button to Browse (Path change + Hash) -> NO Scroll (let onActivated handle it)
        // 3. Browse -> Cocktail (Path change + No Hash) -> Scroll to top
        if (appRoot && to.path !== from.path && !to.hash) {
          appRoot.scrollTop = 0;
        }

        // Standard Vue Router return values
        if (savedPosition) {
          resolve(savedPosition);
        } else if (to.hash) {
          // If purely just updating hash on same page (e.g. clicking drink), don't scroll
          if (to.path === from.path && to.path.match(/\/browse/)) {
            resolve(false);
          } else {
            resolve({ el: to.hash, behavior: "smooth" });
          }
        } else {
          resolve({ top: 0, behavior: "auto" });
        }
      }, 350); // Matches $transition-normal/smooth roughly
    });
  },
});

// Update document title on navigation
router.beforeEach((to, _from, next) => {
  const baseTitle = "Mixology Matcher";
  const pageTitle = to.meta.title as string | undefined;

  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;

  next();
});

export default router;

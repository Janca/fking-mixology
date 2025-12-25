/**
 * Route definitions for Mixology Matcher
 */

import type { RouteRecordRaw } from "vue-router";
import { db } from "@/services/database";
import { toTitleCase } from "@/utils/stringUtils";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home"),
    meta: {
      title: "Match Ingredients",
    },
  },
  {
    path: "/cocktail/:slug",
    name: "cocktail",
    component: () => import("@/views/Cocktail"),
    props: true,
    meta: {
      title: async (route: any) => {
        const slug = route.params.slug as string;
        if (!slug) return "Recipe";
        try {
          const cocktail = await db.cocktails
            .where("slug")
            .equals(slug)
            .first();
          return cocktail ? toTitleCase(cocktail.name) : "Recipe Not Found";
        } catch {
          return "Recipe";
        }
      },
    },
  },
  {
    path: "/browse",
    name: "browse",
    component: () => import("@/views/Browse"),
    meta: {
      title: async (route: any) => {
        const categorySlug = route.query.category as string;
        if (!categorySlug || categorySlug === "all") return "Browse Drinks";
        if (categorySlug === "favorites") return "Favorite Drinks";

        try {
          const category = await db.categories
            .where("slug")
            .equals(categorySlug)
            .first();

          if (category == null) {
            return "Browse Drinks";
          }

          const name = category.name;

          if (name.endsWith("Drink")) {
            return `${toTitleCase(name)}s`;
          }

          if (name.endsWith("Cocktail") || name.endsWith("Liqueur")) {
            return `${toTitleCase(name)}s`;
          }

          const special = ["Beer", "Shot"];
          if (special.includes(name)) {
            return `${toTitleCase(name)}s`;
          }

          return category
            ? `${toTitleCase(category.name)} Drinks`
            : "Browse Drinks";
        } catch {
          return "Browse Drinks";
        }
      },
    },
  },
  {
    path: "/pantry",
    name: "pantry",
    component: () => import("@/views/Pantry"),
    meta: {
      title: "Your Pantry",
    },
  },
  {
    path: "/ledger",
    name: "ledger",
    component: () => import("@/views/Ledger"),
    meta: {
      title: "Drink Ledger",
    },
  },
  {
    path: "/ledger/:id",
    name: "session-detail",
    component: () => import("@/views/Ledger/SessionDetailView.vue"),
    props: true,
    meta: {
      title: "Session Details",
    },
  },
  {
    path: "/achievements",
    name: "achievements",
    component: () => import("@/views/Achievements/AchievementsView.vue"),
    meta: {
      title: "Achievements",
    },
  },
  {
    path: "/user-data",
    name: "user-data",
    component: () => import("@/views/UserData/UserDataView.vue"),
    meta: {
      title: "Data Management",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFound"),
    meta: {
      title: "404 - Too Drunk?",
    },
  },
];

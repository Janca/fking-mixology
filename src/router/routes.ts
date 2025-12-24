/**
 * Route definitions for Mixology Matcher
 */

import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home"),
    meta: {
      title: "Mixology Matcher",
    },
  },
  {
    path: "/cocktail/:slug",
    name: "cocktail",
    component: () => import("@/views/Cocktail"),
    props: true,
    meta: {
      title: "Recipe",
    },
  },
  {
    path: "/browse",
    name: "browse",
    component: () => import("@/views/Browse"),
    meta: {
      title: "Browse Cocktails",
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
    path: "/category/:slug",
    name: "category",
    component: () => import("@/views/Category"),
    props: true,
    meta: {
      title: "Category",
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
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFound"),
    meta: {
      title: "404 - Too Drunk?",
    },
  },
];

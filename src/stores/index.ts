/**
 * Central store exports
 */

import { createPinia } from "pinia";

export const pinia = createPinia();

export * from "./app";
export * from "./ingredients";
export * from "./cocktails";
export * from "./pantry";
export * from "./ledger";

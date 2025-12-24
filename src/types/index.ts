/**
 * Central type exports for Mixology Matcher
 */

export * from "./cocktails";
export * from "./ledger";
export * from "./user";
export * from "./achievements";

// ============================================
// App-level Types
// ============================================

export interface AppSettings {
  preferredUnit: "ml" | "oz";
  theme: "dark"; // Only dark mode for this app
  reducedMotion: boolean;
}

export type ViewMode = "search" | "results" | "recipe";

export interface AppState {
  isLoading: boolean;
  isDataReady: boolean;
  currentView: ViewMode;
  error: string | null;
}

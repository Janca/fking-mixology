/**
 * Utility functions for cocktail-related data
 */

/**
 * Get emoji for a cocktail category
 * @param categoryName The name of the category
 * @returns An emoji string
 */
export function getCategoryEmoji(categoryName: string): string {
  const lower = categoryName.toLowerCase();

  if (lower.includes("all")) return "📚";
  if (lower.includes("beer")) return "🍺";
  if (lower.includes("cocktail")) return "🍸";
  if (lower.includes("cocoa")) return "☕";
  if (lower.includes("coffee") || lower.includes("tea")) return "🍵";
  if (lower.includes("homemade liqueur")) return "🏺";
  if (lower.includes("ordinary drink")) return "🥃";
  if (lower.includes("punch") || lower.includes("party drink")) return "🍹";
  if (lower.includes("shake")) return "🍦";
  if (lower.includes("shot")) return "🥃";
  if (lower.includes("soft drink")) return "🥤";
  if (lower.includes("other") || lower.includes("unknown")) return "✨";

  // Legacy mappings or fallbacks
  if (lower.includes("unforgettable")) return "🥃";
  if (lower.includes("contemporary")) return "🍸";
  if (lower.includes("new era")) return "🍹";

  return "🍷"; // Default fallback
}

/**
 * Convert a string to Title Case
 * Each word starts with uppercase, rest lowercase
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Capitalize the first letter of a sentence
 * Preserves the rest of the string as-is
 */
export function toSentenceCase(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format ingredient name with proper title case
 */
export function formatIngredientName(name: string): string {
  return toTitleCase(name);
}

/**
 * Format method/instructions with proper sentence capitalization
 */
export function formatInstructions(instructions: string): string {
  if (!instructions) return "";
  // Split by sentence-ending punctuation
  return instructions
    .split(/([.!?]+\s*)/)
    .map((segment, i) => {
      // Only capitalize segments that are actual sentences (not punctuation)
      if (i % 2 === 0 && segment.trim()) {
        return toSentenceCase(segment.trim());
      }
      return segment;
    })
    .join("");
}

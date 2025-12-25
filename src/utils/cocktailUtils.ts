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
  if (lower.includes("favorites")) return "❤️";
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
 * Get emoji for an ingredient based on its name
 * @param ingredientName The name of the ingredient
 * @returns An emoji string
 */
export function getIngredientEmoji(ingredientName: string): string {
  const lower = ingredientName.toLowerCase();

  // Spirits
  if (lower.includes("vodka")) return "🫙";
  if (lower.includes("gin")) return "🌿";
  if (lower.includes("rum")) return "🏝️";
  if (lower.includes("tequila") || lower.includes("mezcal")) return "🌵";
  if (
    lower.includes("whiskey") ||
    lower.includes("whisky") ||
    lower.includes("bourbon") ||
    lower.includes("scotch") ||
    lower.includes("rye")
  )
    return "🥃";
  if (
    lower.includes("brandy") ||
    lower.includes("cognac") ||
    lower.includes("armagnac")
  )
    return "🍇";
  if (lower.includes("absinthe")) return "💚";

  // Liqueurs
  if (
    lower.includes("triple sec") ||
    lower.includes("cointreau") ||
    lower.includes("curacao") ||
    lower.includes("grand marnier")
  )
    return "🍊";
  if (lower.includes("kahlua") || lower.includes("coffee liqueur")) return "☕";
  if (lower.includes("amaretto") || lower.includes("almond")) return "🌰";
  if (
    lower.includes("baileys") ||
    lower.includes("cream liqueur") ||
    lower.includes("irish cream")
  )
    return "🍦";
  if (lower.includes("chambord") || lower.includes("raspberry")) return "🫐";
  if (lower.includes("midori") || lower.includes("melon")) return "🍈";
  if (lower.includes("peach")) return "🍑";
  if (
    lower.includes("cherry") ||
    lower.includes("maraschino") ||
    lower.includes("kirsch")
  )
    return "🍒";
  if (lower.includes("campari") || lower.includes("aperol")) return "🔴";
  if (lower.includes("chartreuse")) return "🌿";
  if (lower.includes("schnapps")) return "🍬";
  if (
    lower.includes("sambuca") ||
    lower.includes("anise") ||
    lower.includes("ouzo") ||
    lower.includes("pastis")
  )
    return "⭐";
  if (lower.includes("creme de") || lower.includes("crème de")) return "🎨";
  if (lower.includes("benedictine") || lower.includes("drambuie")) return "🍯";
  if (lower.includes("frangelico") || lower.includes("hazelnut")) return "🌰";
  if (lower.includes("limoncello")) return "🍋";
  if (lower.includes("vermouth")) return "🍸";

  // Fortified wines
  if (lower.includes("sherry")) return "🍷";
  if (lower.includes("port")) return "🍇";

  // Mixers
  if (lower.includes("tonic")) return "🫧";
  if (
    lower.includes("soda") ||
    lower.includes("club soda") ||
    lower.includes("sparkling water")
  )
    return "💧";
  if (
    lower.includes("cola") ||
    lower.includes("coke") ||
    lower.includes("pepsi")
  )
    return "🥤";
  if (lower.includes("ginger ale") || lower.includes("ginger beer")) return "🫚";
  if (
    lower.includes("cream") ||
    lower.includes("half-and-half") ||
    lower.includes("milk")
  )
    return "🥛";
  if (lower.includes("coconut")) return "🥥";
  if (lower.includes("coffee")) return "☕";
  if (lower.includes("tea")) return "🍵";
  if (lower.includes("water")) return "💧";

  // Juices
  if (lower.includes("orange juice") || lower === "oj") return "🍊";
  if (lower.includes("lemon juice") || lower === "lemon") return "🍋";
  if (lower.includes("lime juice") || lower === "lime") return "🍋";
  if (lower.includes("grapefruit")) return "🍊";
  if (lower.includes("cranberry")) return "🔴";
  if (lower.includes("pineapple")) return "🍍";
  if (lower.includes("apple")) return "🍎";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("grape")) return "🍇";
  if (lower.includes("pomegranate")) return "🔴";
  if (lower.includes("passion") || lower.includes("passionfruit")) return "💛";

  // Sweeteners & Syrups
  if (
    lower.includes("syrup") ||
    lower.includes("simple syrup") ||
    lower.includes("sugar")
  )
    return "🍯";
  if (lower.includes("grenadine")) return "🌹";
  if (lower.includes("honey")) return "🍯";
  if (lower.includes("agave")) return "🌵";
  if (lower.includes("maple")) return "🍁";

  // Bitters
  if (lower.includes("bitters") || lower.includes("angostura")) return "🫗";

  // Garnishes & Fruits
  if (lower.includes("mint")) return "🌿";
  if (lower.includes("basil")) return "🌿";
  if (lower.includes("rosemary")) return "🌲";
  if (lower.includes("thyme")) return "🌿";
  if (lower.includes("olive")) return "🫒";
  if (lower.includes("celery")) return "🥬";
  if (lower.includes("cucumber")) return "🥒";
  if (lower.includes("strawberry") || lower.includes("strawberries"))
    return "🍓";
  if (lower.includes("blueberry") || lower.includes("blueberries")) return "🫐";
  if (lower.includes("banana")) return "🍌";
  if (lower.includes("mango")) return "🥭";
  if (lower.includes("watermelon")) return "🍉";
  if (
    lower.includes("egg") ||
    lower.includes("egg white") ||
    lower.includes("egg yolk")
  )
    return "🥚";
  if (lower.includes("cinnamon")) return "🪵";
  if (lower.includes("nutmeg")) return "🌰";
  if (lower.includes("vanilla")) return "🤍";
  if (lower.includes("ginger")) return "🫚";
  if (
    lower.includes("pepper") ||
    lower.includes("jalapeño") ||
    lower.includes("tabasco")
  )
    return "🌶️";
  if (lower.includes("salt")) return "🧂";
  if (lower.includes("chocolate") || lower.includes("cocoa")) return "🍫";

  // Beer & Wine
  if (
    lower.includes("beer") ||
    lower.includes("lager") ||
    lower.includes("ale") ||
    lower.includes("stout")
  )
    return "🍺";
  if (
    lower.includes("champagne") ||
    lower.includes("prosecco") ||
    lower.includes("sparkling wine") ||
    lower.includes("cava")
  )
    return "🥂";
  if (lower.includes("wine")) return "🍷";

  // Default
  return "🧴"; // Generic bottle
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

/**
 * Cocktail data models for Mixology Matcher
 * Designed to work with the IBA cocktails JSON dataset
 */

// ============================================
// Raw API/JSON Types (from external source)
// ============================================

export interface JsonCocktail {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate: string | null;
  strTags: string | null;
  strVideo: string | null;
  strCategory: string;
  strIBA: string | null;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strInstructionsES: string | null;
  strInstructionsDE: string | null;
  strInstructionsFR: string | null;
  strInstructionsIT: string | null;
  strDrinkThumb: string | null;
  strImageSource: string | null;
  strImageAttribution: string | null;
  strCreativeCommonsConfirmed: string;
  dateModified: string | null;
  // Dynamic ingredient/measure fields
  [key: string]: string | null | undefined;
}

export interface JsonIngredient {
  idIngredient: string;
  strIngredient: string;
  strDescription: string | null;
  strType: string | null;
  strAlcohol: string | null;
  strABV: string | null;
}

export interface RawIngredient {
  direction: string;
  quantity: string;
  unit: string;
  ingredient: string;
  note?: string;
}

export interface RawCocktail {
  category: string;
  name: string;
  method: string;
  garnish?: string;
  ingredients: RawIngredient[];
}

// ============================================
// Database Entity Types
// ============================================

export interface Category {
  id?: number;
  name: string;
  slug: string;
}

export interface Ingredient {
  id?: number;
  name: string;
  normalizedName: string; // Lowercase, trimmed for matching
  description?: string;
  type?: string;
  isAlcoholic?: boolean;
  abv?: number;
  imageUrl?: string;
}

export interface Cocktail {
  id?: number;
  name: string;
  slug: string;
  categoryId: number;
  method: string;
  garnish?: string;
  imageUrl?: string;
  glass?: string;
  tags?: string[];
  isAlcoholic?: boolean;
  ibaCategory?: string;
}

export interface RecipeIngredient {
  id?: number;
  cocktailId: number;
  ingredientId: number;
  direction: string; // Original direction text (e.g., "60 ml Vodka")
  quantity: number | null; // Parsed numeric value (or min value for ranges)
  quantityMax?: number | null; // Max value for ranges
  unit: string; // Measurement unit
  note?: string; // Optional notes (e.g., "Optional")
  sortOrder: number; // Display order in recipe
  isGarnish?: boolean; // True if measure was "Garnish with" or similar
}

// ============================================
// Computed/Display Types
// ============================================

export interface CocktailWithDetails extends Cocktail {
  category: Category;
  ingredients: RecipeIngredientWithDetails[];
}

export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient: Ingredient;
  scaledQuantity?: number; // For party mode scaling
}

export interface CocktailMatch {
  cocktail: CocktailWithDetails;
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  matchPercentage: number;
}

// ============================================
// User Selection/State Types
// ============================================

export interface SelectedIngredient {
  id: number;
  name: string;
}

export interface PrepModeState {
  cocktailId: number;
  completedIngredientIds: number[];
  scale: number;
}

// ============================================
// Utility Types
// ============================================

export type UnitType =
  | "ml"
  | "cl"
  | "oz"
  | "dash"
  | "drop"
  | "piece"
  | "bar spoon"
  | "pinch"
  | "splash"
  | "top up"
  | "fill up"
  | "shot"
  | "tsp"
  | "tbsp"
  | "cup"
  | "l"
  | "part"
  | "pint"
  | "other";

// Volume units that can be converted
export type VolumeUnit =
  | "ml"
  | "cl"
  | "l"
  | "oz"
  | "tsp"
  | "tbsp"
  | "cup"
  | "shot"
  | "pint";

export interface UnitConversion {
  from: UnitType;
  to: UnitType;
  multiplier: number;
}

// ============================================
// Pantry Types
// ============================================

export interface PantryItem {
  id?: number;
  ingredientId: number;
  quantityMl: number; // Store everything in ml for consistency
  updatedAt: Date;
}

export interface PantryItemWithDetails extends PantryItem {
  ingredient: Ingredient;
}

/**
 * Unit conversion utilities for cocktail measurements
 * Handles conversion between imperial and metric units
 */

import type { UnitType, VolumeUnit } from "@/types";

// ============================================
// Volume Conversions (all in ml)
// ============================================

const ML_CONVERSIONS: Record<VolumeUnit, number> = {
  ml: 1,
  cl: 10,
  l: 1000,
  oz: 29.5735, // US fluid ounce
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  shot: 44.3603, // 1.5 oz standard shot
  pint: 473.176, // US pint
};

// Non-volume units with approximate ml values (for rough tracking)
const APPROXIMATE_ML: Partial<Record<UnitType, number>> = {
  dash: 0.9, // ~3 drops
  drop: 0.05,
  "bar spoon": 5, // ~1 tsp
  splash: 15, // ~1 tbsp
  pinch: 0.3,
};

/**
 * Check if a unit is a convertible volume unit
 */
export function isVolumeUnit(unit: string): unit is VolumeUnit {
  return unit in ML_CONVERSIONS;
}

/**
 * Check if a unit can be approximately converted to ml
 */
export function isConvertibleUnit(unit: string): boolean {
  return isVolumeUnit(unit) || unit in APPROXIMATE_ML;
}

/**
 * Convert a volume to ml
 */
export function toMl(value: number, unit: string): number {
  if (isVolumeUnit(unit)) {
    return value * ML_CONVERSIONS[unit];
  }

  if (unit in APPROXIMATE_ML) {
    return value * (APPROXIMATE_ML[unit as UnitType] ?? 0);
  }

  // Non-convertible units (piece, etc.) - return 0
  return 0;
}

/**
 * Convert ml to another unit
 */
export function fromMl(ml: number, unit: VolumeUnit): number {
  return ml / ML_CONVERSIONS[unit];
}

/**
 * Convert between two units
 */
export function convertVolume(
  value: number,
  fromUnit: string,
  toUnit: VolumeUnit
): number {
  const ml = toMl(value, fromUnit);
  return fromMl(ml, toUnit);
}

/**
 * Format a quantity with appropriate precision
 */
export function formatQuantityValue(value: number): string {
  if (value === 0) return "0";

  // Very small values
  if (value < 0.1) {
    return value.toFixed(2);
  }

  // Small values
  if (value < 1) {
    return value.toFixed(1);
  }

  // Check if it's close to a whole number
  if (Math.abs(value - Math.round(value)) < 0.05) {
    return Math.round(value).toString();
  }

  // Check for common fractions
  const fractions: [number, string][] = [
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.66, "⅔"],
    [0.75, "¾"],
  ];

  const whole = Math.floor(value);
  const decimal = value - whole;

  for (const [frac, symbol] of fractions) {
    if (Math.abs(decimal - frac) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }

  // Default to 1 decimal place
  return value.toFixed(1);
}

/**
 * Get a display-friendly unit label
 */
export function getUnitLabel(unit: string, plural = false): string {
  const labels: Record<string, [string, string]> = {
    ml: ["ml", "ml"],
    cl: ["cl", "cl"],
    l: ["l", "l"],
    oz: ["oz", "oz"],
    tsp: ["tsp", "tsp"],
    tbsp: ["tbsp", "tbsp"],
    cup: ["cup", "cups"],
    shot: ["shot", "shots"],
    pint: ["pint", "pints"],
    dash: ["dash", "dashes"],
    drop: ["drop", "drops"],
    "bar spoon": ["bar spoon", "bar spoons"],
    splash: ["splash", "splashes"],
    pinch: ["pinch", "pinches"],
    piece: ["piece", "pieces"],
    "top up": ["top up", "top up"],
    "fill up": ["fill up", "fill up"],
    garnish: ["garnish", "garnish"],
  };

  const [singular, pluralForm] = labels[unit] ?? [unit, unit];
  return plural ? pluralForm : singular;
}

/**
 * Parse a unit string to a normalized UnitType
 */
export function parseUnit(unitStr: string): UnitType {
  const normalized = unitStr.toLowerCase().trim();

  const unitMap: Record<string, UnitType> = {
    ml: "ml",
    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    cl: "cl",
    centiliter: "cl",
    centiliters: "cl",
    centilitre: "cl",
    centilitres: "cl",
    l: "l",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    oz: "oz",
    ounce: "oz",
    ounces: "oz",
    "fl oz": "oz",
    "fluid ounce": "oz",
    tsp: "tsp",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tbsp: "tbsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    cup: "cup",
    cups: "cup",
    shot: "shot",
    shots: "shot",
    pint: "pint",
    pints: "pint",
    dash: "dash",
    dashes: "dash",
    drop: "drop",
    drops: "drop",
    "bar spoon": "bar spoon",
    barspoon: "bar spoon",
    "bar spoons": "bar spoon",
    splash: "splash",
    splashes: "splash",
    pinch: "pinch",
    pinches: "pinch",
    piece: "piece",
    pieces: "piece",
    "top up": "top up",
    "fill up": "fill up",
  };

  return unitMap[normalized] ?? "other";
}
// Dry ingredients that should use cups/tbsp/tsp instead of fluid oz
const KNOWN_DRY_INGREDIENTS = new Set([
  "sugar",
  "brown sugar",
  "powdered sugar",
  "salt",
  "celery salt",
  "pepper",
  "nutmeg",
  "cinnamon",
  "cocoa",
  "cocoa powder",
  "flour",
  "baking soda",
  "chocolate chips",
]);

// Countable ingredients (return number only, no "piece")
const KNOWN_COUNTABLES = new Set([
  "lime",
  "lemon",
  "orange",
  "apple",
  "banana",
  "cherry",
  "olive",
  "egg",
  "egg white",
  "egg yolk",
  "ice cube",
  "sugar cube",
  "mint sprig",
  "cinnamon stick",
  "vanilla bean",
  "strawberry",
  "raspberry",
  "blackberry",
  "blueberry",
  "cucumber slice",
  "lemon wedge",
  "lime wedge",
  "orange slice",
  "twist",
  "peel",
]);

export function isDryIngredient(name: string): boolean {
  if (!name) return false;
  return KNOWN_DRY_INGREDIENTS.has(name.toLowerCase());
}

export function isCountableIngredient(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  // Check exact match or ends with (e.g. "fresh lime")
  for (const item of KNOWN_COUNTABLES) {
    if (lower === item || lower.endsWith(" " + item)) return true;
  }
  return false;
}

/**
 * Simplify measurement to standard larger units (recursive)
 * e.g. 12 tsp -> 4 tbsp -> 2 oz
 */
export function simplifyMeasure(
  value: number,
  unit: string,
  isDry = false
): { value: number; unit: string } {
  const unitLower = unit.toLowerCase();

  // ML -> L
  if (unitLower === "ml" && value >= 1000) {
    return simplifyMeasure(value / 1000, "L", isDry);
  }

  // CL -> L
  if (unitLower === "cl" && value >= 100) {
    return simplifyMeasure(value / 100, "L", isDry);
  }

  // TSP -> TBSP
  if ((unitLower === "tsp" || unitLower === "teaspoon") && value >= 3) {
    return simplifyMeasure(value / 3, "tbsp", isDry);
  }

  // DRY: TBSP -> CUP (16 tbsp = 1 cup)
  if (
    isDry &&
    (unitLower === "tbsp" || unitLower === "tablespoon") &&
    value >= 16
  ) {
    return simplifyMeasure(value / 16, "cup", isDry);
  }

  // LIQUID: TBSP -> OZ (Approx 2 tbsp = 1 oz)
  if (
    !isDry &&
    (unitLower === "tbsp" || unitLower === "tablespoon") &&
    value >= 2
  ) {
    return simplifyMeasure(value / 2, "oz", isDry);
  }

  // LIQUID: OZ -> Pint
  if (!isDry && (unitLower === "oz" || unitLower === "ounce") && value >= 16) {
    return simplifyMeasure(value / 16, "pint", isDry);
  }

  // Pint -> Quart (2 pints = 1 quart) - optional but nice
  if (unitLower === "pint" && value >= 2) {
    // return simplifyMeasure(value / 2, "quart");
    // Standard cocktails rarely stick to quart, but for punch bowl maybe?
    // Stick to pint for now per request.
  }

  return {
    value,
    unit:
      unitLower === "ounce"
        ? "oz"
        : unitLower === "teaspoon"
        ? "tsp"
        : unitLower === "tablespoon"
        ? "tbsp"
        : unit,
  };
}

/**
 * Convert a number to a fraction string if it matches common fractions
 */
export function toFraction(value: number): string {
  const whole = Math.floor(value);
  const fraction = value - whole;
  const tolerance = 0.05;

  if (fraction < tolerance) return Math.round(value).toString();
  if (Math.abs(fraction - 1) < tolerance) return (whole + 1).toString();

  const commonFractions = [
    { val: 0.25, str: "1/4" },
    { val: 0.33, str: "1/3" },
    { val: 0.5, str: "1/2" },
    { val: 0.66, str: "2/3" },
    { val: 0.75, str: "3/4" },
  ];

  for (const f of commonFractions) {
    if (Math.abs(fraction - f.val) < tolerance) {
      return whole > 0 ? `${whole} ${f.str}` : f.str;
    }
  }

  // Fallback to max 2 decimals if small, else integer
  if (Number.isInteger(value)) return value.toString();
  if (value < 10)
    return Number(value.toFixed(2))
      .toString()
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1"); // Clean trailing zeros

  return Math.round(value).toString();
}

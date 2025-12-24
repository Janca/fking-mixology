import { fromMl } from "@/utils/unitConversions";

export function usePantryFormatter() {
  function formatPantryQuantity(quantityMl: number): string {
    if (quantityMl >= 1000) {
      return `${(quantityMl / 1000).toFixed(1)}L`;
    }
    return `${Math.round(quantityMl)}ml`;
  }

  function formatOz(quantityMl: number): string {
    const oz = fromMl(quantityMl, "oz");
    return `${oz.toFixed(1)}oz`;
  }

  return {
    formatPantryQuantity,
    formatOz,
  };
}

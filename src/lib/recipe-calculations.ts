import type { Recipe } from "@/types/recipe";
import type { Unit, ServingUnit } from "@/types/ingredient";

// Unit conversion factors (all relative to base units)
const UNIT_CONVERSIONS = {
  // Weight conversions (to grams)
  g: 1,
  oz: 28.3495,
  lb: 453.592,

  // Volume conversions (to ml)
  ml: 1,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,

  // Count
  unit: 1,
} as const;

// Function to get ingredient serving unit
const getIngredientServingUnit = (ingredient: {
  servingUnit?: ServingUnit | null;
}): Unit => {
  // Map Prisma enum to UI unit
  const unitMapping: Record<ServingUnit, Unit> = {
    GRAM: "g",
    OUNCE: "oz",
    MILLIILITER: "ml",
    CUP: "cup",
    TABLESPOON: "tbsp",
    TEASPOON: "tsp",
    POUND: "lb",
    UNIT: "unit",
  };

  if (ingredient.servingUnit && unitMapping[ingredient.servingUnit]) {
    return unitMapping[ingredient.servingUnit];
  }
  return "unit";
};

// Function to convert recipe quantity to ingredient serving size equivalent
const getConversionMultiplier = (
  ingredientServingUnit: Unit,
  recipeQuantity: number,
  recipeUnit: Unit
): number => {
  // If units are the same, simple multiplication
  if (ingredientServingUnit === recipeUnit) {
    return recipeQuantity;
  }

  // Find unit groups
  const weightUnits: Unit[] = ["g", "oz", "lb"];
  const volumeUnits: Unit[] = ["ml", "tsp", "tbsp", "cup"];
  const countUnits: Unit[] = ["unit"];

  // Check if both units are in the same group
  const ingredientInWeight = weightUnits.includes(ingredientServingUnit);
  const recipeInWeight = weightUnits.includes(recipeUnit);
  const ingredientInVolume = volumeUnits.includes(ingredientServingUnit);
  const recipeInVolume = volumeUnits.includes(recipeUnit);
  const ingredientInCount = countUnits.includes(ingredientServingUnit);
  const recipeInCount = countUnits.includes(recipeUnit);

  // Both must be in the same group for conversion
  if (ingredientInWeight && recipeInWeight) {
    // Convert recipe amount to grams, then divide by ingredient serving unit in grams
    const recipeInGrams = recipeQuantity * UNIT_CONVERSIONS[recipeUnit];
    const ingredientServingInGrams = UNIT_CONVERSIONS[ingredientServingUnit];
    return recipeInGrams / ingredientServingInGrams;
  } else if (ingredientInVolume && recipeInVolume) {
    // Convert recipe amount to ml, then divide by ingredient serving unit in ml
    const recipeInMl = recipeQuantity * UNIT_CONVERSIONS[recipeUnit];
    const ingredientServingInMl = UNIT_CONVERSIONS[ingredientServingUnit];
    return recipeInMl / ingredientServingInMl;
  } else if (ingredientInCount && recipeInCount) {
    return recipeQuantity;
  }

  // If units are incompatible, return the quantity as-is (fallback)
  return recipeQuantity;
};

// Helper function to calculate recipe nutrition with proper unit conversions
export const calculateRecipeNutrition = (recipe: Recipe) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalSugar = 0;

  recipe.ingredients.forEach((ri) => {
    if (ri.ingredient) {
      const ingredientServingUnit = getIngredientServingUnit(ri.ingredient);
      const recipeQuantity = ri.quantity || 0;
      const recipeUnit = (ri.unit as Unit) || "unit";

      // Calculate the conversion multiplier
      const multiplier = getConversionMultiplier(
        ingredientServingUnit,
        recipeQuantity,
        recipeUnit
      );

      totalCalories += (ri.ingredient.calories || 0) * multiplier;
      totalProtein += (ri.ingredient.protein || 0) * multiplier;
      totalFat += (ri.ingredient.fat || 0) * multiplier;
      totalCarbs += (ri.ingredient.carbs || 0) * multiplier;
      totalSugar += (ri.ingredient.sugar || 0) * multiplier;
    }
  });

  // Return both total and per-serving values
  const servings = recipe.servings || 1;
  return {
    total: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
      sugar: Math.round(totalSugar),
    },
    perServing: {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings),
      fat: Math.round(totalFat / servings),
      carbs: Math.round(totalCarbs / servings),
      sugar: Math.round(totalSugar / servings),
    },
  };
};

// Helper function to calculate recipe allergens from ingredients
export const calculateRecipeAllergens = (recipe: Recipe): string[] => {
  const allergenSet = new Set<string>();

  recipe.ingredients.forEach((ri) => {
    if (ri.ingredient?.allergens) {
      ri.ingredient.allergens.forEach((allergen) => {
        allergenSet.add(allergen);
      });
    }
  });

  return Array.from(allergenSet).sort();
};

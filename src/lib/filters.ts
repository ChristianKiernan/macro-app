import type { Ingredient } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";

export interface IngredientFilters {
  sortBy: string;
  searchQuery: string;
  dietaryRestrictions: string[];
  caloriesMin?: number;
  caloriesMax?: number;
}

export interface RecipeFilters {
  sortBy: string;
  searchQuery: string;
  dietaryRestrictions: string[];
  caloriesMin?: number;
  caloriesMax?: number;
}

/**
 * Filter and sort ingredients based on provided criteria
 */
export function filterIngredients(
  ingredients: Ingredient[],
  filters: IngredientFilters
): Ingredient[] {
  let filtered = [...ingredients];

  // Apply search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.brand?.toLowerCase().includes(query) ||
        ingredient.allergens?.some((allergen) =>
          allergen.toLowerCase().includes(query)
        )
    );
  }

  // Apply dietary restriction filters (for ingredients, filter by allergens)
  if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
    filtered = filtered.filter((ingredient) => {
      // For ingredients, dietary restrictions work by filtering OUT allergens
      // e.g., "Dairy-Free" means the ingredient should NOT contain "Dairy"
      return filters.dietaryRestrictions.every((restriction) => {
        const allergenToAvoid = restriction.replace("-Free", "");
        return !ingredient.allergens?.some((ingredientAllergen) =>
          ingredientAllergen
            .toLowerCase()
            .includes(allergenToAvoid.toLowerCase())
        );
      });
    });
  }

  // Apply calorie range filter
  if (filters.caloriesMin !== undefined) {
    filtered = filtered.filter(
      (ingredient) => (ingredient.calories || 0) >= filters.caloriesMin!
    );
  }
  if (filters.caloriesMax !== undefined) {
    filtered = filtered.filter(
      (ingredient) => (ingredient.calories || 0) <= filters.caloriesMax!
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "calories":
        return (a.calories || 0) - (b.calories || 0);
      case "calories-desc":
        return (b.calories || 0) - (a.calories || 0);
      case "protein":
        return (a.protein || 0) - (b.protein || 0);
      case "protein-desc":
        return (b.protein || 0) - (a.protein || 0);
      case "recent":
        // Assuming newer items have higher IDs or you could use createdAt if available
        return b.id.localeCompare(a.id);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
}

/**
 * Filter and sort recipes based on provided criteria
 */
export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters
): Recipe[] {
  let filtered = [...recipes];

  // Apply search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query)
    );
  }

  // Apply dietary restriction filters
  if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
    filtered = filtered.filter((recipe) => {
      // For recipes, check if ALL ingredients meet the dietary restrictions
      return filters.dietaryRestrictions.every((restriction) => {
        const allergenToAvoid = restriction.replace("-Free", "");
        return recipe.ingredients.every((recipeIngredient) => {
          if (!recipeIngredient.ingredient) return true;
          return !recipeIngredient.ingredient.allergens?.some(
            (ingredientAllergen) =>
              ingredientAllergen
                .toLowerCase()
                .includes(allergenToAvoid.toLowerCase())
          );
        });
      });
    });
  }

  // Apply calorie range filter
  if (filters.caloriesMin !== undefined) {
    filtered = filtered.filter((recipe) => {
      const totalCalories = calculateRecipeCalories(recipe);
      return totalCalories >= filters.caloriesMin!;
    });
  }
  if (filters.caloriesMax !== undefined) {
    filtered = filtered.filter((recipe) => {
      const totalCalories = calculateRecipeCalories(recipe);
      return totalCalories <= filters.caloriesMax!;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "calories":
        return calculateRecipeCalories(a) - calculateRecipeCalories(b);
      case "calories-desc":
        return calculateRecipeCalories(b) - calculateRecipeCalories(a);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
}

/**
 * Calculate total calories for a recipe
 */
function calculateRecipeCalories(recipe: Recipe): number {
  return recipe.ingredients.reduce((total, recipeIngredient) => {
    if (recipeIngredient.ingredient) {
      return (
        total +
        (recipeIngredient.ingredient.calories || 0) *
          (recipeIngredient.quantity || 0)
      );
    }
    return total;
  }, 0);
}

/**
 * Get unique allergens from ingredients for filter options
 */
export function getUniqueAllergens(ingredients: Ingredient[]): string[] {
  const allergens = new Set<string>();
  ingredients.forEach((ingredient) => {
    ingredient.allergens?.forEach((allergen) => {
      allergens.add(allergen);
    });
  });
  return Array.from(allergens).sort();
}

/**
 * Get dietary restrictions based on available allergens
 * Converts allergens like "Dairy" to "Dairy-Free"
 */
export function getDietaryRestrictionsFromAllergens(
  ingredients: Ingredient[]
): string[] {
  const allergens = getUniqueAllergens(ingredients);
  return allergens.map((allergen) => `${allergen}-Free`).sort();
}

/**
 * Get nutrition statistics from ingredients
 */
export function getIngredientStats(ingredients: Ingredient[]) {
  if (ingredients.length === 0) {
    return {
      totalIngredients: 0,
      withAllergens: 0,
      uniqueBrands: 0,
      avgCalories: 0,
    };
  }

  const withAllergens = ingredients.filter(
    (i) => i.allergens && i.allergens.length > 0
  ).length;

  const uniqueBrands = new Set(
    ingredients.filter((i) => i.brand).map((i) => i.brand)
  ).size;

  const avgCalories = Math.round(
    ingredients.reduce((sum, i) => sum + (i.calories || 0), 0) /
      ingredients.length
  );

  return {
    totalIngredients: ingredients.length,
    withAllergens,
    uniqueBrands,
    avgCalories,
  };
}

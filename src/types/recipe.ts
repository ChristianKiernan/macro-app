import { Ingredient } from "./ingredient";

// Recipe ingredient with quantity and unit
export interface RecipeIngredient {
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
}

// Base recipe interface for forms/editing
export interface BaseRecipe {
  name: string;
  description?: string | null;
  servings: number;
  ingredients?: RecipeIngredient[];
  allergens?: string[];
}

// Full recipe interface from API
export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  servings: number;
  ingredients: RecipeIngredient[];
  allergens: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for saving recipes
export interface RecipeSavePayload {
  name: string;
  description?: string;
  servings: number;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  allergens: string[];
}

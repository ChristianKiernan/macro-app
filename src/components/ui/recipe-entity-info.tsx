"use client";

import type { Recipe } from "@/types/recipe";

interface RecipeEntityInfoProps {
  recipe: Recipe;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
  };
}

export function RecipeEntityInfo({ recipe, nutrition }: RecipeEntityInfoProps) {
  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Recipe name and description */}
      <div>
        <h3 className="font-semibold text-card-foreground text-xl mb-1">
          {recipe.name}
        </h3>
        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Recipe metadata with icons */}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>
            {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔥</span>
          <span>{nutrition.calories} calories per serving</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🥄</span>
          <span>
            {recipe.ingredients.length} ingredient
            {recipe.ingredients.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Allergen Tags */}
      {recipe.allergens && recipe.allergens.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Contains:
          </span>
          <div className="flex flex-wrap gap-2">
            {recipe.allergens.map((allergen, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

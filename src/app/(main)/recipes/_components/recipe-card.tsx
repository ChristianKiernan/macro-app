"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RecipeEntityInfo } from "@/components/ui/recipe-entity-info";
import { MacroNutrients } from "@/components/ui/macro-nutrients";
import type { Recipe } from "@/types/recipe";

interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  nutrition: NutritionData;
  onView?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  orientation?: "horizontal" | "vertical";
}

export function RecipeCard({
  recipe,
  nutrition,
  onView,
  onDelete,
  orientation = "horizontal",
}: RecipeCardProps) {
  const containerClass =
    orientation === "horizontal" ? "flex gap-6" : "flex flex-col space-y-4";

  const macroContainerClass =
    orientation === "horizontal"
      ? "flex flex-col items-center space-y-4"
      : "flex flex-col space-y-4";

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Menu Button - Always in top right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView?.(recipe)}>
            View Recipe
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(recipe)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className={`${containerClass} pr-12`}>
        {/* Recipe Entity Information */}
        <RecipeEntityInfo recipe={recipe} nutrition={nutrition} />

        {/* Macro Information */}
        <div className={macroContainerClass}>
          <MacroNutrients
            calories={nutrition.calories}
            protein={nutrition.protein}
            fat={nutrition.fat}
            carbs={nutrition.carbs}
            sugar={nutrition.sugar}
            orientation="horizontal"
            size={orientation === "horizontal" ? "large" : "medium"}
          />
        </div>
      </div>
    </div>
  );
}

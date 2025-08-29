"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Ingredient } from "@/types/ingredient";
import { PRISMA_TO_UI_MAPPING } from "@/types/ingredient";

interface IngredientCardProps {
  cardData: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

export default function IngredientCard({
  cardData,
  onEdit,
  onDelete,
}: IngredientCardProps) {
  const formatValue = (value?: number | null, fallback: string = "0") => {
    return value !== null && value !== undefined ? value.toString() : fallback;
  };

  const formatServing = () => {
    if (cardData.servingSize && cardData.servingUnit) {
      const uiUnit = PRISMA_TO_UI_MAPPING[cardData.servingUnit];
      return `${cardData.servingSize} ${uiUnit}`;
    }
    return "N/A";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between">
        {/* Left side - Ingredient name and serving */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground text-lg truncate">
            {cardData.name}{cardData.brand ? ` (${cardData.brand})` : ""}
          </h3>
          <p className="text-sm text-muted-foreground">
            Serving: {formatServing()}
          </p>
          {/* Allergen Tags */}
          {cardData.allergens && cardData.allergens.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contains:
              </span>
              <div className="flex flex-wrap gap-2">
                {cardData.allergens.map((allergen, index) => (
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

        {/* Right side - Macro information and menu button */}
        <div className="flex items-center space-x-6 ml-4">
          {/* Calories */}
          <div className="text-center">
            <div className="text-lg font-bold text-chart-1">
              {formatValue(cardData.calories)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Cal
            </div>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="text-lg font-bold text-chart-2">
              {formatValue(cardData.protein)}g
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Protein
            </div>
          </div>

          {/* Fat */}
          <div className="text-center">
            <div className="text-lg font-bold text-chart-3">
              {formatValue(cardData.fat)}g
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Fat
            </div>
          </div>

          {/* Carbs */}
          <div className="text-center">
            <div className="text-lg font-bold text-chart-4">
              {formatValue(cardData.carbs)}g
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Carbs
            </div>
          </div>

          {/* Sugar */}
          <div className="text-center">
            <div className="text-lg font-bold text-chart-5">
              {formatValue(cardData.sugar)}g
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Sugar
            </div>
          </div>

          {/* Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(cardData)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(cardData)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { MoreHorizontal, Search, ArrowRightLeft, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EntityInfo } from "@/components/ui/entity-info";
import { MacroNutrients } from "@/components/ui/macro-nutrients";
import type { Ingredient, Unit } from "@/types/ingredient";
import { PRISMA_TO_UI_MAPPING } from "@/types/ingredient";

// Unit compatibility groups
const UNIT_GROUPS = {
  weight: ["g", "oz", "lb"] as Unit[],
  volume: ["ml", "cup", "tbsp", "tsp"] as Unit[],
  count: ["unit"] as Unit[],
} as const;

// Function to get compatible units for a given unit
const getCompatibleUnits = (baseUnit: Unit): Unit[] => {
  for (const group of Object.values(UNIT_GROUPS)) {
    if (group.includes(baseUnit)) {
      return [...group];
    }
  }
  return [baseUnit];
};

interface IngredientCardProps {
  cardData: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  orientation?: "horizontal" | "vertical";
  showSwapOption?: boolean;
  availableIngredients?: Ingredient[];
  onSwap?: (newIngredient: Ingredient, quantity?: number, unit?: Unit) => void;
  onQuantityEdit?: (quantity: number, unit: Unit) => void; // New prop for quantity editing
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  currentQuantity?: number;
  currentUnit?: Unit;
  showDeleteOption?: boolean;
  servingLabel?: string;
}

export default function IngredientCard({
  cardData,
  onEdit,
  onDelete,
  orientation = "horizontal",
  showSwapOption = false,
  availableIngredients = [],
  onSwap,
  onQuantityEdit, // New prop
  searchQuery = "",
  onSearchChange,
  currentQuantity = 1,
  currentUnit = "unit",
  showDeleteOption = true,
  servingLabel = "Serving",
}: IngredientCardProps) {
  const [swapSheetOpen, setSwapSheetOpen] = useState(false);
  const [editQuantitySheetOpen, setEditQuantitySheetOpen] = useState(false); // New state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [newUnit, setNewUnit] = useState<Unit>(currentUnit);

  // For direct quantity editing
  const [editingQuantity, setEditingQuantity] = useState(currentQuantity);
  const [editingUnit, setEditingUnit] = useState<Unit>(currentUnit);

  // Get compatible units based on the ingredient's serving unit
  const getIngredientServingUnit = (ingredient: Ingredient): Unit => {
    if (
      ingredient.servingUnit &&
      PRISMA_TO_UI_MAPPING[ingredient.servingUnit]
    ) {
      return PRISMA_TO_UI_MAPPING[ingredient.servingUnit];
    }
    return "unit";
  };

  const allUnits: Unit[] = [
    "g",
    "oz",
    "ml",
    "cup",
    "tbsp",
    "tsp",
    "lb",
    "unit",
  ];

  const compatibleUnits = selectedIngredient
    ? getCompatibleUnits(getIngredientServingUnit(selectedIngredient))
    : allUnits;

  const containerClass =
    orientation === "horizontal" ? "flex gap-6" : "flex flex-col space-y-4";

  const macroContainerClass =
    orientation === "horizontal"
      ? "flex flex-col items-center space-y-4"
      : "flex flex-col space-y-4";

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSwap = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    // Set default unit to the ingredient's serving unit when selecting
    const ingredientUnit = getIngredientServingUnit(ingredient);
    setNewUnit(ingredientUnit);
  };

  const confirmSwap = () => {
    if (selectedIngredient && onSwap) {
      onSwap(selectedIngredient, newQuantity, newUnit);
      cancelSwap();
    }
  };

  const cancelSwap = () => {
    setSelectedIngredient(null);
    setNewQuantity(currentQuantity);
    setNewUnit(currentUnit);
    setLocalSearchQuery("");
    setSwapSheetOpen(false);
  };

  // Handlers for direct quantity editing
  const handleEditQuantity = () => {
    setEditingQuantity(currentQuantity);
    setEditingUnit(currentUnit);
    setEditQuantitySheetOpen(true);
  };

  const confirmQuantityEdit = () => {
    if (onQuantityEdit) {
      onQuantityEdit(editingQuantity, editingUnit);
      setEditQuantitySheetOpen(false);
    }
  };

  const cancelQuantityEdit = () => {
    setEditingQuantity(currentQuantity);
    setEditingUnit(currentUnit);
    setEditQuantitySheetOpen(false);
  };

  const filteredIngredients = availableIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(localSearchQuery.toLowerCase())
  );

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
          {showSwapOption && (
            <>
              <DropdownMenuItem
                onClick={() => setSwapSheetOpen(true)}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swap Ingredient
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleEditQuantity}
                className="text-green-600 focus:text-green-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Quantity
              </DropdownMenuItem>
            </>
          )}
          {!showSwapOption && (
            <DropdownMenuItem onClick={() => onEdit(cardData)}>
              Edit
            </DropdownMenuItem>
          )}
          {showDeleteOption && (
            <DropdownMenuItem
              onClick={() => onDelete(cardData)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className={`${containerClass} pr-12`}>
        {/* Entity Information */}
        <EntityInfo
          name={cardData.name}
          brand={cardData.brand}
          servingSize={cardData.servingSize}
          servingUnit={cardData.servingUnit}
          allergens={cardData.allergens}
          servingUnitMapping={PRISMA_TO_UI_MAPPING}
          servingLabel={servingLabel}
        />

        {/* Macro Information */}
        <div className={macroContainerClass}>
          <MacroNutrients
            calories={cardData.calories}
            protein={cardData.protein}
            fat={cardData.fat}
            carbs={cardData.carbs}
            sugar={cardData.sugar}
            orientation={orientation}
          />
        </div>
      </div>

      {/* Edit Quantity Sheet */}
      {showSwapOption && onQuantityEdit && (
        <Sheet
          open={editQuantitySheetOpen}
          onOpenChange={(open) => {
            if (!open) cancelQuantityEdit();
            setEditQuantitySheetOpen(open);
          }}
        >
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Edit Quantity</SheetTitle>
              <SheetDescription>
                Adjust the quantity and unit for &ldquo;{cardData.name}&rdquo;
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Current Ingredient</h4>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/20 rounded-lg p-4 border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{cardData.name}</p>
                        {cardData.brand && (
                          <p className="text-sm text-muted-foreground">
                            {cardData.brand}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-medium">Quantity & Unit</h4>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-quantity">Quantity</Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        step="0.1"
                        min="0"
                        value={editingQuantity}
                        onChange={(e) =>
                          setEditingQuantity(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-unit">Unit</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {editingUnit}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {getCompatibleUnits(
                            getIngredientServingUnit(cardData)
                          ).map((unitOption) => (
                            <DropdownMenuItem
                              key={unitOption}
                              onClick={() => setEditingUnit(unitOption)}
                            >
                              {unitOption}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex gap-3">
                    <Button onClick={confirmQuantityEdit} className="flex-1">
                      Update Quantity
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelQuantityEdit}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Swap Ingredient Sheet */}
      {showSwapOption && (
        <Sheet
          open={swapSheetOpen}
          onOpenChange={(open) => {
            if (!open) cancelSwap();
            setSwapSheetOpen(open);
          }}
        >
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Swap Ingredient</SheetTitle>
              <SheetDescription>
                Choose a different ingredient to replace &ldquo;{cardData.name}
                &rdquo; and adjust the quantity/unit as needed
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {!selectedIngredient ? (
                <>
                  {/* Search */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Search Ingredients</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search ingredients..."
                          value={localSearchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ingredients List */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Available Ingredients</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[400px] overflow-y-auto space-y-3">
                        {filteredIngredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            onClick={() => handleSwap(ingredient)}
                            className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">
                                  {ingredient.name}
                                </h4>
                                {ingredient.brand && (
                                  <p className="text-sm text-muted-foreground">
                                    {ingredient.brand}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">
                                  {ingredient.calories} cal
                                </div>
                                <div className="text-muted-foreground">
                                  {ingredient.protein}p • {ingredient.carbs}c •{" "}
                                  {ingredient.fat}f
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {filteredIngredients.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No ingredients found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Selected Ingredient */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Selected Ingredient</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-accent/20 rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {selectedIngredient.name}
                            </p>
                            {selectedIngredient.brand && (
                              <p className="text-sm text-muted-foreground">
                                {selectedIngredient.brand}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {selectedIngredient.calories} cal
                            </div>
                            <div className="text-muted-foreground">
                              {selectedIngredient.protein}p •{" "}
                              {selectedIngredient.carbs}c •{" "}
                              {selectedIngredient.fat}f
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quantity and Unit Editor */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Quantity & Unit</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="swap-quantity">Quantity</Label>
                          <Input
                            id="swap-quantity"
                            type="number"
                            step="0.1"
                            min="0"
                            value={newQuantity}
                            onChange={(e) =>
                              setNewQuantity(Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="swap-unit">Unit</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between"
                              >
                                {newUnit}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              {compatibleUnits.map((unitOption) => (
                                <DropdownMenuItem
                                  key={unitOption}
                                  onClick={() => setNewUnit(unitOption)}
                                >
                                  {unitOption}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <Card>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button onClick={confirmSwap} className="flex-1">
                          Swap Ingredient
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelSwap}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

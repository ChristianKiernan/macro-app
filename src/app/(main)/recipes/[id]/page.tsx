"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FractionInput } from "@/components/ui/fraction-input";
import IngredientCard from "@/app/(main)/ingredients/_components/ingredient-card";
import { ArrowLeft, Plus, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Recipe } from "@/types/recipe";
import type { Ingredient, Unit } from "@/types/ingredient";
import { UNIT_MAPPING } from "@/types/ingredient";

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

// Function to get ingredient serving unit
const getIngredientServingUnit = (ingredient: Ingredient): Unit => {
  // Map Prisma enum to UI unit
  const unitMapping: Record<string, Unit> = {
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

export default function RecipeViewPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null); // For tracking changes
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // For swapping
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [addIngredientSheetOpen, setAddIngredientSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load recipe and all ingredients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the specific recipe
        const recipeResponse = await fetch(`/api/recipes/${recipeId}`);
        if (recipeResponse.ok) {
          const recipeData = await recipeResponse.json();
          setRecipe(recipeData);
          setOriginalRecipe(JSON.parse(JSON.stringify(recipeData))); // Deep copy for comparison
        }

        // Fetch all ingredients for swapping
        const ingredientsResponse = await fetch("/api/ingredients");
        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          setIngredients(ingredientsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recipeId]);

  // Check if recipe has changes compared to original
  const checkForChanges = (currentRecipe: Recipe, original: Recipe) => {
    if (!currentRecipe || !original) return false;
    return (
      currentRecipe.name !== original.name ||
      currentRecipe.description !== original.description ||
      currentRecipe.servings !== original.servings ||
      JSON.stringify(currentRecipe.ingredients) !==
        JSON.stringify(original.ingredients)
    );
  };

  // Calculate total and per-serving macros
  const calculateMacros = () => {
    if (!recipe) return { total: {}, perServing: {} };

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

  // Handle recipe basic info updates
  const handleRecipeNameChange = (name: string) => {
    if (!recipe) return;
    const updatedRecipe = { ...recipe, name };
    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };

  const handleRecipeDescriptionChange = (description: string) => {
    if (!recipe) return;
    const updatedRecipe = { ...recipe, description };
    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };

  const handleRecipeServingsChange = (servings: number) => {
    if (!recipe) return;
    const updatedRecipe = { ...recipe, servings };
    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };

  // Handle ingredient swap with quantity and unit
  const handleSwapIngredient = (
    oldIngredientId: string,
    newIngredient: Ingredient,
    quantity?: number,
    unit?: Unit
  ) => {
    if (!recipe) return;

    const updatedIngredients = recipe.ingredients.map((ri) => {
      if (ri.ingredient?.id === oldIngredientId) {
        return {
          ...ri,
          ingredient: newIngredient,
          quantity: quantity !== undefined ? quantity : ri.quantity,
          unit: unit !== undefined ? unit : ri.unit,
        };
      }
      return ri;
    });

    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
    };

    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };

  // Handle ingredient deletion from recipe
  const handleDeleteIngredient = (ingredientId: string) => {
    if (!recipe) return;

    const updatedIngredients = recipe.ingredients.filter(
      (ri) => ri.ingredient?.id !== ingredientId
    );

    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
    };

    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };

  // Handle quantity edit for existing ingredient
  const handleQuantityEdit = (
    ingredientId: string,
    quantity: number,
    unit: Unit
  ) => {
    if (!recipe) return;

    const updatedIngredients = recipe.ingredients.map((ri) => {
      if (ri.ingredient?.id === ingredientId) {
        return {
          ...ri,
          quantity,
          unit,
        };
      }
      return ri;
    });

    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
    };

    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
  };
  const handleAddIngredient = (
    ingredient: Ingredient,
    quantity: number,
    unit: Unit
  ) => {
    if (!recipe) return;

    const newRecipeIngredient = {
      id: `temp-${Date.now()}`, // Temporary ID
      recipeId: recipe.id,
      ingredientId: ingredient.id,
      quantity,
      unit,
      ingredient,
    };

    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, newRecipeIngredient],
    };

    setRecipe(updatedRecipe);
    if (originalRecipe) {
      setHasChanges(checkForChanges(updatedRecipe, originalRecipe));
    }
    setAddIngredientSheetOpen(false);
  };

  // Save changes to the recipe
  const handleSaveChanges = async () => {
    if (!recipe || !hasChanges) return;

    try {
      setSaving(true);

      // Prepare the recipe data for saving
      const recipePayload = {
        name: recipe.name,
        description: recipe.description,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map((ri) => ({
          ingredientId: ri.ingredient?.id,
          quantity: ri.quantity,
          unit: ri.unit,
        })),
      };

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipePayload),
      });

      if (response.ok) {
        const updatedRecipe = await response.json();
        setRecipe(updatedRecipe);
        setOriginalRecipe(JSON.parse(JSON.stringify(updatedRecipe)));
        setHasChanges(false);

        // Show success message and redirect to recipes library
        alert("Changes published successfully!");
        router.push("/recipes");
      } else {
        console.error("Failed to save recipe changes");
        alert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Filter ingredients for swapping (exclude current recipe ingredients)
  const availableIngredients = ingredients.filter(
    (ingredient) =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !recipe?.ingredients.some((ri) => ri.ingredient?.id === ingredient.id)
  );

  const macros = calculateMacros();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recipe not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>

        {/* Recipe Header Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-2xl font-bold">Recipe Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-name">Recipe Name</Label>
                <Input
                  id="recipe-name"
                  value={recipe.name}
                  onChange={(e) => handleRecipeNameChange(e.target.value)}
                  placeholder="Enter recipe name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-servings">Servings</Label>
                <Input
                  id="recipe-servings"
                  type="number"
                  min="1"
                  value={recipe.servings}
                  onChange={(e) =>
                    handleRecipeServingsChange(Number(e.target.value))
                  }
                  placeholder="Number of servings"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-description">Description</Label>
              <Input
                id="recipe-description"
                value={recipe.description || ""}
                onChange={(e) => handleRecipeDescriptionChange(e.target.value)}
                placeholder="Enter recipe description (optional)"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Live Tracker Only */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Macro Tracker */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Live Tracker</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Per Serving */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Per Serving
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-1">
                          {macros.perServing.calories}
                        </div>
                        <div className="text-xs text-muted-foreground">Cal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-2">
                          {macros.perServing.protein}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Protein
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-3">
                          {macros.perServing.fat}g
                        </div>
                        <div className="text-xs text-muted-foreground">Fat</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-4">
                          {macros.perServing.carbs}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Carbs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-5">
                          {macros.perServing.sugar}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sugar
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Total Recipe
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-1">
                          {macros.total.calories}
                        </div>
                        <div className="text-xs text-muted-foreground">Cal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-2">
                          {macros.total.protein}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Protein
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-3">
                          {macros.total.fat}g
                        </div>
                        <div className="text-xs text-muted-foreground">Fat</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-4">
                          {macros.total.carbs}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Carbs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-chart-5">
                          {macros.total.sugar}g
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sugar
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Ingredients List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Recipe Ingredients
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Click the three dots on any ingredient to swap it out
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddIngredientSheetOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </Button>
                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {recipe.ingredients.map((ri, index) => {
                    if (!ri.ingredient) return null;

                    // Calculate adjusted macros for this specific quantity/unit
                    const ingredientServingUnit = getIngredientServingUnit(
                      ri.ingredient
                    );
                    const recipeQuantity = ri.quantity || 0;
                    const recipeUnit = (ri.unit as Unit) || "unit";
                    const conversionMultiplier = getConversionMultiplier(
                      ingredientServingUnit,
                      recipeQuantity,
                      recipeUnit
                    );

                    // Create enhanced ingredient with adjusted macros and proper display
                    const enhancedIngredient = {
                      ...ri.ingredient,
                      // Keep original name, don't modify it
                      name: ri.ingredient.name,
                      // Adjust macros based on the actual quantity being used
                      calories: Math.round(
                        (ri.ingredient.calories || 0) * conversionMultiplier
                      ),
                      protein: Math.round(
                        (ri.ingredient.protein || 0) * conversionMultiplier
                      ),
                      fat: Math.round(
                        (ri.ingredient.fat || 0) * conversionMultiplier
                      ),
                      carbs: Math.round(
                        (ri.ingredient.carbs || 0) * conversionMultiplier
                      ),
                      sugar: Math.round(
                        (ri.ingredient.sugar || 0) * conversionMultiplier
                      ),
                      // Override serving size display to show recipe quantity
                      servingSize: recipeQuantity,
                      servingUnit: UNIT_MAPPING[recipeUnit], // Convert to proper Prisma enum
                    };

                    return (
                      <IngredientCard
                        key={`${ri.ingredient.id}-${index}`}
                        cardData={enhancedIngredient}
                        onEdit={() => {}} // Disabled in this view
                        onDelete={() =>
                          handleDeleteIngredient(ri.ingredient!.id)
                        } // Enable delete functionality
                        orientation="horizontal"
                        showSwapOption={true}
                        showDeleteOption={true} // Enable delete in recipe view
                        servingLabel="Quantity" // Show "Quantity" instead of "Serving"
                        availableIngredients={availableIngredients}
                        onSwap={(
                          newIngredient: Ingredient,
                          quantity?: number,
                          unit?: Unit
                        ) =>
                          handleSwapIngredient(
                            ri.ingredient!.id,
                            newIngredient,
                            quantity,
                            unit
                          )
                        }
                        onQuantityEdit={(quantity: number, unit: Unit) =>
                          handleQuantityEdit(ri.ingredient!.id, quantity, unit)
                        }
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        currentQuantity={ri.quantity || 1}
                        currentUnit={(ri.unit as Unit) || "unit"}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Ingredient Sheet */}
        <Sheet
          open={addIngredientSheetOpen}
          onOpenChange={setAddIngredientSheetOpen}
        >
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Add Ingredient</SheetTitle>
              <SheetDescription>
                Add a new ingredient to this recipe
              </SheetDescription>
            </SheetHeader>

            <AddIngredientForm
              ingredients={ingredients.filter(
                (ingredient) =>
                  !recipe?.ingredients.some(
                    (ri) => ri.ingredient?.id === ingredient.id
                  )
              )}
              onAdd={handleAddIngredient}
              onCancel={() => setAddIngredientSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Add Ingredient Form Component
function AddIngredientForm({
  ingredients,
  onAdd,
  onCancel,
}: {
  ingredients: Ingredient[];
  onAdd: (ingredient: Ingredient, quantity: number, unit: Unit) => void;
  onCancel: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>("unit");

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

  // Get compatible units for the selected ingredient
  const compatibleUnits = selectedIngredient
    ? getCompatibleUnits(getIngredientServingUnit(selectedIngredient))
    : allUnits;

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    // Set default unit to the ingredient's serving unit
    const ingredientUnit = getIngredientServingUnit(ingredient);
    setUnit(ingredientUnit);
  };

  const handleAdd = () => {
    if (selectedIngredient) {
      onAdd(selectedIngredient, quantity, unit);
      // Reset form
      setSelectedIngredient(null);
      setQuantity(1);
      setUnit("unit");
      setSearchQuery("");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {!selectedIngredient ? (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <h4 className="font-medium">Search Ingredients</h4>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Ingredients List */}
          <Card>
            <CardHeader>
              <h4 className="font-medium">Available Ingredients</h4>
              <p className="text-sm text-muted-foreground">
                Only showing ingredients not already in this recipe
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {filteredIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => handleSelectIngredient(ingredient)}
                    className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{ingredient.name}</h4>
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
                    {searchQuery ? (
                      <>
                        No ingredients found matching &ldquo;{searchQuery}
                        &rdquo;
                      </>
                    ) : ingredients.length === 0 ? (
                      <>
                        No ingredients available. Create some ingredients first!
                      </>
                    ) : (
                      <>All available ingredients are already in this recipe</>
                    )}
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
                    <p className="font-medium">{selectedIngredient.name}</p>
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
                      {selectedIngredient.protein}p • {selectedIngredient.carbs}
                      c • {selectedIngredient.fat}f
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
                  <Label htmlFor="add-quantity">Quantity</Label>
                  <FractionInput
                    id="add-quantity"
                    value={quantity}
                    onChange={setQuantity}
                    unit={unit}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-unit">Unit</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {unit}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {compatibleUnits.map((unitOption) => (
                        <DropdownMenuItem
                          key={unitOption}
                          onClick={() => setUnit(unitOption)}
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
                <Button onClick={handleAdd} className="flex-1">
                  Add Ingredient
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FractionInput } from "@/components/ui/fraction-input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { RecipeSavePayload, RecipeIngredient } from "@/types/recipe";
import type { Ingredient, Unit } from "@/types/ingredient";
import { PRISMA_TO_UI_MAPPING } from "@/types/ingredient";

export interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: RecipeSavePayload) => void;
  ingredients: Ingredient[];
}

type FormState = {
  name: string;
  description: string;
  servings: string;
  recipeIngredients: RecipeIngredient[];
};

const initialFormState = (): FormState => ({
  name: "",
  description: "",
  servings: "1",
  recipeIngredients: [],
});

// Use the same units as the ingredient library for consistency
const availableUnits: Unit[] = [
  "g",
  "oz",
  "lb",
  "ml",
  "cup",
  "tbsp",
  "tsp",
  "unit",
];

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  ingredients,
}) => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [ingredientSearch, setIngredientSearch] = useState<string>("");
  const [showIngredientDropdown, setShowIngredientDropdown] =
    useState<boolean>(false);

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState());
      setIngredientSearch("");
      setShowIngredientDropdown(false);
    }
  }, [isOpen]);

  const handleInputChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addIngredient = (ingredient: Ingredient) => {
    // Check if ingredient is already added
    const exists = formData.recipeIngredients.some(
      (ri) => ri.ingredientId === ingredient.id
    );

    if (!exists) {
      // Convert ingredient's serving unit to UI unit for consistency
      const defaultUnit: Unit = ingredient.servingUnit
        ? PRISMA_TO_UI_MAPPING[ingredient.servingUnit]
        : "g";

      const newRecipeIngredient: RecipeIngredient = {
        ingredientId: ingredient.id,
        ingredient: ingredient,
        quantity: 1,
        unit: defaultUnit,
      };

      setFormData((prev) => ({
        ...prev,
        recipeIngredients: [...prev.recipeIngredients, newRecipeIngredient],
      }));
    }

    setIngredientSearch("");
    setShowIngredientDropdown(false);
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.map((ri) =>
        ri.ingredientId === ingredientId ? { ...ri, quantity } : ri
      ),
    }));
  };

  const updateIngredientUnit = (ingredientId: string, unit: Unit) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.map((ri) =>
        ri.ingredientId === ingredientId ? { ...ri, unit } : ri
      ),
    }));
  };

  const removeIngredient = (ingredientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.filter(
        (ri) => ri.ingredientId !== ingredientId
      ),
    }));
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const num = (s: string): number =>
    s.trim() === "" ? 0 : Number.parseFloat(s);

  const handleCreate = () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a recipe name");
      return;
    }
    if (!formData.servings.trim() || num(formData.servings) <= 0) {
      alert("Please enter a valid number of servings");
      return;
    }
    if (formData.recipeIngredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    const payload: RecipeSavePayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      servings: num(formData.servings),
      ingredients: formData.recipeIngredients.map((ri) => ({
        ingredientId: ri.ingredientId,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
      allergens: [], // Allergens will be derived from ingredients
    };

    onCreate(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">
            Create New Recipe
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label="Close add recipe modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter recipe name"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Brief description of the recipe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Number of Servings</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => handleInputChange("servings", e.target.value)}
                placeholder="1"
                min="1"
                className="w-32"
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search ingredients..."
                    value={ingredientSearch}
                    onChange={(e) => {
                      setIngredientSearch(e.target.value);
                      setShowIngredientDropdown(true);
                    }}
                    onFocus={() => setShowIngredientDropdown(true)}
                    className="w-64"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowIngredientDropdown(!showIngredientDropdown)
                    }
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {showIngredientDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredIngredients.length > 0 ? (
                      filteredIngredients.map((ingredient) => (
                        <button
                          key={ingredient.id}
                          type="button"
                          onClick={() => addIngredient(ingredient)}
                          className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                        >
                          <div>
                            <span className="font-medium">
                              {ingredient.name}
                            </span>
                            {ingredient.brand && (
                              <span className="text-muted-foreground ml-2">
                                ({ingredient.brand})
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No ingredients found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ingredients */}
            {formData.recipeIngredients.length > 0 && (
              <div className="space-y-3">
                {formData.recipeIngredients.map((recipeIngredient) => (
                  <Card key={recipeIngredient.ingredientId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {recipeIngredient.ingredient?.name}
                          </h4>
                          {recipeIngredient.ingredient?.brand && (
                            <p className="text-sm text-muted-foreground">
                              {recipeIngredient.ingredient.brand}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FractionInput
                              value={recipeIngredient.quantity}
                              onChange={(value) =>
                                updateIngredientQuantity(
                                  recipeIngredient.ingredientId,
                                  value
                                )
                              }
                              unit={recipeIngredient.unit}
                              className="w-20"
                              min="0"
                              step="0.1"
                            />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="w-20 h-9 px-3 py-1 border border-input bg-transparent rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between text-sm"
                                >
                                  <span>{recipeIngredient.unit}</span>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                  value={recipeIngredient.unit}
                                  onValueChange={(value) =>
                                    updateIngredientUnit(
                                      recipeIngredient.ingredientId,
                                      value as Unit
                                    )
                                  }
                                >
                                  {availableUnits.map((unit) => (
                                    <DropdownMenuRadioItem
                                      key={unit}
                                      value={unit}
                                    >
                                      {unit}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeIngredient(recipeIngredient.ingredientId)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="flex-1">
            Create Recipe
          </Button>
        </div>
      </div>
    </div>
  );
};

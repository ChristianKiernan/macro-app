import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import type { BaseIngredient, SavePayload, Unit } from "@/types/ingredient";
import { UNIT_MAPPING } from "@/types/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// Re-export types for backwards compatibility
export type { SavePayload, Unit } from "@/types/ingredient";

export interface EditIngredientModalProps {
  ingredient?: BaseIngredient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SavePayload) => void;
}

type FormState = {
  name: string;
  brand: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  sugar: string;
  servingSize: string;
  servingUnit: Unit;
  allergens: string[];
};

const parseServing = (raw?: number | null): { amount: string; unit: Unit } => {
  // For numbers, we just return the number as string and default unit
  const amount = raw !== null && raw !== undefined ? String(raw) : "";
  const unit: Unit = "g"; // Default unit, will be overridden by actual servingUnit
  return { amount, unit };
};

const toStr = (n?: number | null) => (typeof n === "number" ? String(n) : "");

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient,
  isOpen,
  onClose,
  onSave,
}) => {
  const initial = (): FormState => {
    const { amount, unit } = parseServing(ingredient?.servingSize ?? undefined);
    // BaseIngredient already uses UI units, so no conversion needed

    return {
      name: ingredient?.name ?? "",
      brand: ingredient?.brand ?? "",
      calories: toStr(ingredient?.calories),
      protein: toStr(ingredient?.protein),
      fat: toStr(ingredient?.fat),
      carbs: toStr(ingredient?.carbs),
      sugar: toStr(ingredient?.sugar),
      servingSize: amount || "",
      servingUnit: ingredient?.servingUnit ?? unit ?? "g",
      allergens: ingredient?.allergens ?? [],
    };
  };

  const [formData, setFormData] = useState<FormState>(initial);
  const [newAllergen, setNewAllergen] = useState<string>("");

  // Reset form whenever the modal opens with a different ingredient or toggles
  useEffect(() => {
    if (isOpen) {
      setFormData(initial());
      setNewAllergen("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ingredient?.name]); // name usually identifies the record; add more deps if needed

  const handleInputChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addAllergen = () => {
    const input = newAllergen.trim();
    if (!input) return;

    // Split by commas and clean up each allergen
    const newAllergens = input
      .split(",")
      .map((allergen) => allergen.trim())
      .filter((allergen) => allergen.length > 0)
      .filter((allergen) => !formData.allergens.includes(allergen));

    if (newAllergens.length > 0) {
      setFormData((prev) => ({
        ...prev,
        allergens: [...prev.allergens, ...newAllergens],
      }));
      setNewAllergen("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((a) => a !== allergen),
    }));
  };

  const num = (s: string): number =>
    s.trim() === "" ? 0 : Number.parseFloat(s);

  const handleSave = () => {
    const payload: SavePayload = {
      name: formData.name.trim(),
      brand: formData.brand.trim() || undefined,
      servingUnit: UNIT_MAPPING[formData.servingUnit], // Convert UI unit to Prisma enum
      servingSize: num(formData.servingSize), // Just the number, not concatenated with unit
      calories: num(formData.calories),
      protein: num(formData.protein),
      fat: num(formData.fat),
      carbs: num(formData.carbs),
      sugar: num(formData.sugar),
      allergens: formData.allergens,
    };
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">
            {ingredient ? "Edit Ingredient" : "Add New Ingredient"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label="Close edit ingredient modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter ingredient name"
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="edit-brand">Brand</Label>
            <Input
              id="edit-brand"
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="Enter brand name"
            />
          </div>

          {/* Serving Size & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-servingSize">Serving Size</Label>
              <Input
                id="edit-servingSize"
                type="number"
                value={formData.servingSize}
                onChange={(e) =>
                  handleInputChange("servingSize", e.target.value)
                }
                placeholder="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-1/3 h-9 px-3 py-1 border border-input bg-transparent rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between text-sm"
                  >
                    <span>{formData.servingUnit}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={formData.servingUnit}
                    onValueChange={(value) =>
                      handleInputChange("servingUnit", value as Unit)
                    }
                  >
                    <DropdownMenuRadioItem value="g">g</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oz">oz</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="lb">lb</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ml">ml</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cup">
                      cup
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="tbsp">
                      tbsp
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="tsp">
                      tsp
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unit">
                      unit
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-calories">Calories</Label>
              <Input
                id="edit-calories"
                type="number"
                value={formData.calories}
                onChange={(e) => handleInputChange("calories", e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-protein">Protein (g)</Label>
              <Input
                id="edit-protein"
                type="number"
                value={formData.protein}
                onChange={(e) => handleInputChange("protein", e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fat">Fat (g)</Label>
              <Input
                id="edit-fat"
                type="number"
                value={formData.fat}
                onChange={(e) => handleInputChange("fat", e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-carbs">Carbs (g)</Label>
              <Input
                id="edit-carbs"
                type="number"
                value={formData.carbs}
                onChange={(e) => handleInputChange("carbs", e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Sugar */}
          <div className="space-y-2">
            <Label htmlFor="edit-sugar">Sugar (g)</Label>
            <Input
              id="edit-sugar"
              type="number"
              value={formData.sugar}
              onChange={(e) => handleInputChange("sugar", e.target.value)}
              placeholder="0"
              step="0.1"
            />
          </div>

          {/* Allergens */}
          <div className="space-y-2">
            <Label htmlFor="allergen-input">Allergens</Label>
            <div className="flex gap-2">
              <Input
                id="allergen-input"
                type="text"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAllergen()}
                className="flex-1"
                placeholder="Add allergens (e.g., milk, nuts, gluten)"
              />
              <Button type="button" onClick={addAllergen}>
                Add
              </Button>
            </div>
            {formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="hover:text-destructive"
                      aria-label={`Remove ${allergen}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
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
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

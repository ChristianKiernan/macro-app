"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import IngredientCard from "@/components/ingredients/ingredient-card";
import { EditIngredientModal } from "@/components/ingredients/edit-ingredient";
import { AddIngredientModal } from "@/components/ingredients/add-ingredient";
import type {
  Ingredient,
  SavePayload,
  BaseIngredient,
} from "@/types/ingredient";
import { PRISMA_TO_UI_MAPPING } from "@/types/ingredient";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Convert database ingredient to form format
  const convertToFormFormat = (ingredient: Ingredient): BaseIngredient => {
    return {
      name: ingredient.name,
      brand: ingredient.brand,
      calories: ingredient.calories,
      protein: ingredient.protein,
      fat: ingredient.fat,
      carbs: ingredient.carbs,
      sugar: ingredient.sugar,
      servingSize: ingredient.servingSize,
      servingUnit: ingredient.servingUnit
        ? PRISMA_TO_UI_MAPPING[ingredient.servingUnit]
        : null,
      allergens: ingredient.allergens,
    };
  };

  // Fetch ingredients on component mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (confirm(`Are you sure you want to delete ${ingredient.name}?`)) {
      try {
        const response = await fetch(`/api/ingredients/${ingredient.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Remove from local state
          setIngredients((prev) => prev.filter((i) => i.id !== ingredient.id));
        }
      } catch (error) {
        console.error("Failed to delete ingredient:", error);
      }
    }
  };

  const handleSave = async (payload: SavePayload) => {
    if (!editingIngredient) return;

    try {
      // Update existing ingredient
      const response = await fetch(`/api/ingredients/${editingIngredient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedIngredient = await response.json();
        // Update local state
        setIngredients((prev) =>
          prev.map((i) =>
            i.id === editingIngredient.id ? updatedIngredient : i
          )
        );
      }
    } catch (error) {
      console.error("Failed to update ingredient:", error);
    }
  };

  const handleCreate = async (payload: SavePayload) => {
    try {
      // Create new ingredient
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newIngredient = await response.json();
        // Add to local state
        setIngredients((prev) => [...prev, newIngredient]);
      }
    } catch (error) {
      console.error("Failed to create ingredient:", error);
    }
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-6xl">
        <Card>
          <CardHeader>
            <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Ingredients Library</CardTitle>
                <CardDescription>
                  Manage your ingredient database
                </CardDescription>
              </div>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4" />
                Add Ingredient
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading ingredients...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && ingredients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No ingredients found
                </p>
              </div>
            )}

            {/* Ingredients Grid */}
            {!loading && ingredients.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-4">
                {ingredients.map((ingredient) => (
                  <IngredientCard
                    key={ingredient.id}
                    cardData={ingredient}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <EditIngredientModal
        ingredient={
          editingIngredient ? convertToFormFormat(editingIngredient) : null
        }
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingIngredient(null);
        }}
        onSave={handleSave}
      />

      {/* Add Modal */}
      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

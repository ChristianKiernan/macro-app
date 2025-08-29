"use client";

import { useState, useEffect } from "react";
import { Plus, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import IngredientCard from "@/app/(main)/ingredients/_components/ingredient-card";
import { AddIngredientModal } from "@/app/(main)/ingredients/_components/add-ingredient";
import { EditIngredientModal } from "@/app/(main)/ingredients/_components/edit-ingredient";
import { FilterCard, type FilterState } from "@/components/filters";
import type {
  Ingredient,
  BaseIngredient,
  SavePayload,
} from "@/types/ingredient";
import { PRISMA_TO_UI_MAPPING } from "@/types/ingredient";
import {
  filterIngredients,
  getDietaryRestrictionsFromAllergens,
  getIngredientStats,
} from "@/lib/filters";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name",
    searchQuery: "",
    caloriesMin: "",
    caloriesMax: "",
    dietaryRestrictions: [],
  });
  const [isGridView, setIsGridView] = useState(false);

  // Apply filters and get filtered ingredients
  const filteredIngredients = filterIngredients(ingredients, {
    sortBy: filters.sortBy,
    searchQuery: filters.searchQuery,
    dietaryRestrictions: filters.dietaryRestrictions,
    caloriesMin: filters.caloriesMin ? Number(filters.caloriesMin) : undefined,
    caloriesMax: filters.caloriesMax ? Number(filters.caloriesMax) : undefined,
  });

  // Get available dietary restrictions from allergens
  const availableDietaryRestrictions =
    getDietaryRestrictionsFromAllergens(ingredients);
  const stats = getIngredientStats(filteredIngredients);

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
    <>
      <PageHeader
        title="Ingredients Library"
        description="Manage your ingredient database"
      />
      <div className="p-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleAddNew} className="w-full">
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </Button>
                <Button variant="outline" className="w-full">
                  Import from CSV
                </Button>
                <Button variant="outline" className="w-full">
                  Export Library
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <FilterCard
              filters={filters}
              onFiltersChange={setFilters}
              availableDietaryRestrictions={availableDietaryRestrictions}
            />

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Library Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Ingredients
                    </span>
                    <span className="text-sm font-medium">
                      {stats.totalIngredients}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      With Allergens
                    </span>
                    <span className="text-sm font-medium">
                      {stats.withAllergens}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Brands
                    </span>
                    <span className="text-sm font-medium">
                      {stats.uniqueBrands}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Calories
                    </span>
                    <span className="text-sm font-medium">
                      {stats.avgCalories}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Ingredients Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {filteredIngredients.length} Ingredients
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredIngredients.length === ingredients.length
                        ? "Your complete ingredient library"
                        : `Showing ${filteredIngredients.length} of ${ingredients.length} ingredients`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Search */}
                    <Input
                      type="text"
                      placeholder="Search ingredients..."
                      className="text-sm w-64"
                      value={filters.searchQuery}
                      onChange={(e) =>
                        setFilters({ ...filters, searchQuery: e.target.value })
                      }
                    />
                    {/* View Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsGridView(!isGridView)}
                    >
                      {isGridView ? (
                        <>
                          <List className="w-4 h-4 mr-2" />
                          List View
                        </>
                      ) : (
                        <>
                          <Grid3X3 className="w-4 h-4 mr-2" />
                          Grid View
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Loading ingredients...
                    </p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && ingredients.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No ingredients found
                    </p>
                    <Button onClick={handleAddNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Ingredient
                    </Button>
                  </div>
                )}

                {/* No Results State */}
                {!loading &&
                  ingredients.length > 0 &&
                  filteredIngredients.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No ingredients match your current filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilters({
                            sortBy: "name",
                            searchQuery: "",
                            caloriesMin: "",
                            caloriesMax: "",
                            dietaryRestrictions: [],
                          });
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}

                {/* Ingredients Grid */}
                {!loading && filteredIngredients.length > 0 && (
                  <div
                    className={`grid gap-4 ${
                      isGridView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {filteredIngredients.map((ingredient) => (
                      <IngredientCard
                        key={ingredient.id}
                        cardData={ingredient}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        orientation={isGridView ? "vertical" : "horizontal"}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
    </>
  );
}

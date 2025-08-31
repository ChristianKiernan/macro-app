"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { AddRecipeModal } from "@/app/(main)/recipes/_components/add-recipe";
import { RecipeCard } from "@/app/(main)/recipes/_components/recipe-card";
import { FilterCard, type FilterState } from "@/components/filters";
import { Plus, Grid3X3, List } from "lucide-react";
import type { Ingredient } from "@/types/ingredient";
import type { RecipeSavePayload, Recipe } from "@/types/recipe";
import {
  filterRecipes,
  getDietaryRestrictionsFromAllergens,
} from "@/lib/filters";
import {
  calculateRecipeNutrition,
  calculateRecipeAllergens,
} from "@/lib/recipe-calculations";

export default function RecipesPage() {
  const router = useRouter();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name",
    searchQuery: "",
    caloriesMin: "",
    caloriesMax: "",
    dietaryRestrictions: [],
  });

  const [isGridView, setIsGridView] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ingredients and recipes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch ingredients for the recipe modal
        const ingredientsResponse = await fetch("/api/ingredients");
        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          setIngredients(ingredientsData);
        }

        // Fetch recipes for the main list
        const recipesResponse = await fetch("/api/recipes");
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json();
          setRecipes(recipesData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRecipe = async (payload: RecipeSavePayload) => {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newRecipe = await response.json();
        // Add the new recipe to the list
        setRecipes((prev) => [newRecipe, ...prev]);
        console.log("Recipe created successfully");
      } else {
        console.error("Failed to create recipe");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
    }
  };

  // Handle recipe deletion
  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the recipe from the list
        setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
        console.log("Recipe deleted successfully");
      } else {
        console.error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  // Helper function to calculate recipe nutrition - now using shared utility
  const getRecipeNutrition = (recipe: Recipe) => {
    const nutrition = calculateRecipeNutrition(recipe);
    return nutrition.perServing; // Return per-serving values for the card display
  };

  // Helper function to calculate recipe allergens from ingredients - now using shared utility
  const getRecipeAllergens = (recipe: Recipe): string[] => {
    return calculateRecipeAllergens(recipe);
  };

  // Get available dietary restrictions from ingredients
  const availableDietaryRestrictions =
    getDietaryRestrictionsFromAllergens(ingredients);

  // Apply filters to recipes
  const filteredRecipes = filterRecipes(recipes, {
    sortBy: filters.sortBy,
    searchQuery: filters.searchQuery,
    dietaryRestrictions: filters.dietaryRestrictions,
    caloriesMin: filters.caloriesMin ? Number(filters.caloriesMin) : undefined,
    caloriesMax: filters.caloriesMax ? Number(filters.caloriesMax) : undefined,
  });

  return (
    <>
      <PageHeader
        title="Recipe Library"
        description="Create and manage your recipes"
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
                <Button
                  className="w-full"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Recipe
                </Button>
                <Button variant="outline" className="w-full">
                  Import Recipes
                </Button>
                <Button variant="outline" className="w-full">
                  Recipe Collections
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
                <h3 className="text-lg font-semibold">Recipe Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Recipes
                    </span>
                    <span className="text-sm font-medium">
                      {recipes.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Dietary Types
                    </span>
                    <span className="text-sm font-medium">
                      {filters.dietaryRestrictions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Prep Time
                    </span>
                    <span className="text-sm font-medium">
                      {recipes.length > 0 ? "13 min" : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Calories
                    </span>
                    <span className="text-sm font-medium">
                      {recipes.length > 0 ? "383" : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Recipes Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {loading
                        ? "Loading..."
                        : `${filteredRecipes.length} Recipe${
                            filteredRecipes.length !== 1 ? "s" : ""
                          } ${
                            filteredRecipes.length !== recipes.length
                              ? `of ${recipes.length}`
                              : ""
                          }`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your recipe collection
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Search */}
                    <Input
                      type="text"
                      placeholder="Search recipes..."
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
                {/* Recipes Display */}
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading recipes...</p>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No recipes found. Create your first recipe to get started!
                    </p>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Recipe
                    </Button>
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No recipes match your current filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          sortBy: "name",
                          searchQuery: "",
                          caloriesMin: "",
                          caloriesMax: "",
                          dietaryRestrictions: [],
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`gap-4 ${
                      isGridView
                        ? "grid grid-cols-1 md:grid-cols-2"
                        : "space-y-4"
                    }`}
                  >
                    {filteredRecipes.map((recipe) => {
                      const nutrition = getRecipeNutrition(recipe);
                      const calculatedAllergens = getRecipeAllergens(recipe);

                      // Create enhanced recipe with calculated allergens
                      const enhancedRecipe = {
                        ...recipe,
                        allergens: calculatedAllergens,
                      };

                      return (
                        <RecipeCard
                          key={recipe.id}
                          recipe={enhancedRecipe}
                          nutrition={nutrition}
                          orientation={isGridView ? "vertical" : "horizontal"}
                          onView={(recipe) => {
                            // Navigate to recipe view page
                            router.push(`/recipes/${recipe.id}`);
                          }}
                          onDelete={handleDeleteRecipe}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateRecipe}
        ingredients={ingredients}
      />
    </>
  );
}

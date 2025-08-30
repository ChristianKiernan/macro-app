"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Adjust this number as needed

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Generate page numbers for pagination
  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages
        );
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Get available dietary restrictions from allergens
  const availableDietaryRestrictions =
    getDietaryRestrictionsFromAllergens(ingredients);
  const stats = getIngredientStats(filteredIngredients);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of ingredients section
    document.querySelector("[data-ingredients-section]")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Convert database ingredient to form format
  const convertToFormFormat = (ingredient: Ingredient): BaseIngredient => {
    return {
      ...ingredient,
      servingUnit: ingredient.servingUnit
        ? PRISMA_TO_UI_MAPPING[ingredient.servingUnit]
        : null,
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
          <div className="lg:col-span-3" data-ingredients-section>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {filteredIngredients.length} Ingredients
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredIngredients.length === ingredients.length
                        ? `Page ${currentPage} of ${totalPages} - Your complete ingredient library`
                        : `Showing ${startIndex + 1}-${Math.min(
                            endIndex,
                            filteredIngredients.length
                          )} of ${
                            filteredIngredients.length
                          } filtered ingredients`}
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
                {!loading && paginatedIngredients.length > 0 && (
                  <>
                    <div
                      className={`grid gap-4 ${
                        isGridView
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {paginatedIngredients.map((ingredient) => (
                        <IngredientCard
                          key={ingredient.id}
                          cardData={ingredient}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          orientation={isGridView ? "vertical" : "horizontal"}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={handlePreviousPage}
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {getPageNumbers.map((page, index) => (
                              <PaginationItem key={index}>
                                {page === "ellipsis" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={() =>
                                      handlePageChange(page as number)
                                    }
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={handleNextPage}
                                className={
                                  currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
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

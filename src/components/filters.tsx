"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export interface FilterState {
  sortBy: string;
  searchQuery: string;
  caloriesMin: string;
  caloriesMax: string;
  dietaryRestrictions: string[];
}

export interface FilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableDietaryRestrictions: string[];
  title?: string;
}

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "calories", label: "Calories (Low to High)" },
  { value: "calories-desc", label: "Calories (High to Low)" },
];

export function FilterCard({
  filters,
  onFiltersChange,
  availableDietaryRestrictions,
  title = "Filters",
}: FilterProps) {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: "name",
      searchQuery: "",
      caloriesMin: "",
      caloriesMax: "",
      dietaryRestrictions: [],
    });
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    if (checked) {
      updateFilters({
        dietaryRestrictions: [...filters.dietaryRestrictions, restriction],
      });
    } else {
      updateFilters({
        dietaryRestrictions: filters.dietaryRestrictions.filter(
          (r) => r !== restriction
        ),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sort Options */}
        <div>
          <Label className="text-muted-foreground mb-2 block">Sort by</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full h-9 px-3 py-1 border border-input bg-transparent rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between text-sm"
              >
                <span>
                  {SORT_OPTIONS.find((option) => option.value === filters.sortBy)
                    ?.label || "Name (A-Z)"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuRadioGroup
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dietary Restrictions */}
        {availableDietaryRestrictions.length > 0 && (
          <div>
            <Label className="text-muted-foreground mb-2 block">
              Filter by Dietary Restrictions
            </Label>
            <div className="space-y-2">
              {availableDietaryRestrictions.map((restriction) => (
                <div
                  key={restriction}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`dietary-${restriction}`}
                    checked={filters.dietaryRestrictions.includes(restriction)}
                    onCheckedChange={(checked) =>
                      handleDietaryRestrictionChange(restriction, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`dietary-${restriction}`}
                    className="text-sm cursor-pointer"
                  >
                    {restriction}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calorie Range */}
        <div>
          <Label className="text-muted-foreground mb-2 block">
            Calories per serving
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              className="w-full text-sm"
              value={filters.caloriesMin}
              onChange={(e) => updateFilters({ caloriesMin: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max"
              className="w-full text-sm"
              value={filters.caloriesMax}
              onChange={(e) => updateFilters({ caloriesMax: e.target.value })}
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-2">
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// UI-friendly unit abbreviations
export type Unit = "g" | "oz" | "ml" | "cup" | "tbsp" | "tsp" | "lb" | "unit";

// Prisma enum values (generated from schema)
export type ServingUnit =
  | "GRAM"
  | "OUNCE"
  | "MILLIILITER"
  | "CUP"
  | "TABLESPOON"
  | "TEASPOON"
  | "POUND"
  | "UNIT";

// Mapping between UI abbreviations and Prisma enum values
export const UNIT_MAPPING: Record<Unit, ServingUnit> = {
  g: "GRAM",
  oz: "OUNCE",
  ml: "MILLIILITER",
  cup: "CUP",
  tbsp: "TABLESPOON",
  tsp: "TEASPOON",
  lb: "POUND",
  unit: "UNIT",
};

// Reverse mapping for displaying UI values from database
export const PRISMA_TO_UI_MAPPING: Record<ServingUnit, Unit> = {
  GRAM: "g",
  OUNCE: "oz",
  MILLIILITER: "ml",
  CUP: "cup",
  TABLESPOON: "tbsp",
  TEASPOON: "tsp",
  POUND: "lb",
  UNIT: "unit",
};

// Base ingredient interface for forms/editing (uses UI units)
export interface BaseIngredient {
  name: string;
  brand?: string | null;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  sugar?: number | null;
  servingSize?: number | null; 
  servingUnit?: Unit | null; 
  allergens?: string[] | null;
}

// Full ingredient interface from API (uses Prisma enum values)
export interface Ingredient {
  id: string;
  name: string;
  brand?: string | null;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  sugar?: number | null;
  servingSize?: number | null; // Changed from string to number
  servingUnit?: ServingUnit | null; // Prisma enum values from database
  allergens?: string[] | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for saving ingredients (uses Prisma enum values)
export interface SavePayload {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  servingSize: number; // Changed from string to number to match Prisma Float
  servingUnit: ServingUnit;
  allergens: string[];
}

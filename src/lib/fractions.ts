import type { Unit } from "@/types/ingredient";

// Common cooking fractions
export const COMMON_FRACTIONS = [
  { display: "1/8", decimal: 0.125 },
  { display: "1/4", decimal: 0.25 },
  { display: "1/3", decimal: 0.333333 },
  { display: "3/8", decimal: 0.375 },
  { display: "1/2", decimal: 0.5 },
  { display: "5/8", decimal: 0.625 },
  { display: "2/3", decimal: 0.666667 },
  { display: "3/4", decimal: 0.75 },
  { display: "7/8", decimal: 0.875 },
] as const;

// Volume units that support fractions
export const VOLUME_UNITS: Unit[] = ["ml", "cup", "tbsp", "tsp"];

// Check if a unit is a volume measurement
export function isVolumeUnit(unit: Unit): boolean {
  return VOLUME_UNITS.includes(unit);
}

// Combine whole number and fraction into decimal
export function combineFraction(
  wholeNumber: number,
  fractionDecimal: number
): number {
  return wholeNumber + fractionDecimal;
}

// Extract whole and fractional parts from a decimal
export function splitDecimal(decimal: number): {
  whole: number;
  fraction: number;
} {
  const whole = Math.floor(decimal);
  const fractionalPart = decimal - whole;

  // Find closest matching fraction
  let closestFraction = 0;
  let closestDiff = 1;

  for (const fraction of COMMON_FRACTIONS) {
    const diff = Math.abs(fractionalPart - fraction.decimal);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestFraction = fraction.decimal;
    }
  }

  // If the difference is very small, use the fraction, otherwise use 0
  const fraction = closestDiff < 0.01 ? closestFraction : 0;

  return { whole, fraction };
}

// Get the display string for a fraction decimal value
export function getFractionDisplay(decimal: number): string {
  const fraction = COMMON_FRACTIONS.find(
    (f) => Math.abs(f.decimal - decimal) < 0.0001
  );
  return fraction ? fraction.display : "";
}

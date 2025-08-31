import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Unit } from "@/types/ingredient";
import {
  COMMON_FRACTIONS,
  isVolumeUnit,
  combineFraction,
  splitDecimal,
  getFractionDisplay,
} from "@/lib/fractions";

interface FractionInputProps {
  value: number;
  onChange: (value: number) => void;
  unit: Unit;
  className?: string;
  placeholder?: string;
  min?: string;
  step?: string;
  id?: string;
}

export function FractionInput({
  value,
  onChange,
  unit,
  className,
  placeholder = "0",
  min = "0",
  step = "0.1",
  id,
}: FractionInputProps) {
  const [wholeNumber, setWholeNumber] = useState<number>(0);
  const [selectedFraction, setSelectedFraction] = useState<number>(0);

  // Update internal state when value prop changes
  useEffect(() => {
    if (isVolumeUnit(unit)) {
      const { whole, fraction } = splitDecimal(value);
      setWholeNumber(whole);
      setSelectedFraction(fraction);
    } else {
      setWholeNumber(value);
      setSelectedFraction(0);
    }
  }, [value, unit]);

  // Handle whole number input change
  const handleWholeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWhole = parseFloat(e.target.value) || 0;
    setWholeNumber(newWhole);

    if (isVolumeUnit(unit)) {
      onChange(combineFraction(newWhole, selectedFraction));
    } else {
      onChange(newWhole);
    }
  };

  // Handle fraction selection
  const handleFractionSelect = (fractionDecimal: number) => {
    setSelectedFraction(fractionDecimal);
    onChange(combineFraction(wholeNumber, fractionDecimal));
  };

  // Get current fraction display
  const currentFractionDisplay = getFractionDisplay(selectedFraction) || "0";

  // For non-volume units, just show a regular input
  if (!isVolumeUnit(unit)) {
    return (
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={className}
        placeholder={placeholder}
        min={min}
        step={step}
      />
    );
  }

  // For volume units, show whole number + fraction dropdown
  return (
    <div className="space-y-1">
      <div className={`flex gap-1 ${className}`}>
        <Input
          id={id}
          type="number"
          value={wholeNumber}
          onChange={handleWholeNumberChange}
          className="flex-1"
          placeholder="0"
          min="0"
          step="1"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-16 px-2 flex items-center justify-between text-sm"
            >
              <span>{currentFractionDisplay}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20">
            <DropdownMenuLabel className="text-xs">Fraction</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleFractionSelect(0)}
              className={selectedFraction === 0 ? "bg-accent" : ""}
            >
              0
            </DropdownMenuItem>
            {COMMON_FRACTIONS.map((fraction) => (
              <DropdownMenuItem
                key={fraction.display}
                onClick={() => handleFractionSelect(fraction.decimal)}
                className={
                  selectedFraction === fraction.decimal ? "bg-accent" : ""
                }
              >
                {fraction.display}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

interface MacroNutrientsProps {
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  sugar?: number | null;
  orientation?: "horizontal" | "vertical";
  size?: "small" | "medium" | "large";
}

export function MacroNutrients({
  calories,
  protein,
  fat,
  carbs,
  sugar,
  orientation = "horizontal",
  size = "medium",
}: MacroNutrientsProps) {
  const formatValue = (value?: number | null, fallback: string = "0") => {
    return value !== null && value !== undefined ? value.toString() : fallback;
  };

  const macros = [
    {
      value: formatValue(calories),
      label: "Cal",
      color: "text-chart-1",
      unit: "",
    },
    {
      value: formatValue(protein),
      label: "Protein",
      color: "text-chart-2",
      unit: "g",
    },
    {
      value: formatValue(fat),
      label: "Fat",
      color: "text-chart-3",
      unit: "g",
    },
    {
      value: formatValue(carbs),
      label: "Carbs",
      color: "text-chart-4",
      unit: "g",
    },
    {
      value: formatValue(sugar),
      label: "Sugar",
      color: "text-chart-5",
      unit: "g",
    },
  ];

  const containerClass =
    orientation === "horizontal"
      ? "flex items-center space-x-6"
      : orientation === "vertical" && size === "large"
      ? "flex flex-col items-center space-y-4 min-w-[100px]"
      : "grid grid-cols-2 gap-3";

  const textSizeClass =
    size === "large" ? "text-2xl" : size === "medium" ? "text-xl" : "text-lg";

  const caloriesTextSizeClass =
    size === "large" ? "text-2xl" : size === "medium" ? "text-xl" : "text-lg";

  return (
    <div className={containerClass}>
      {macros.map((macro, index) => (
        <div key={index} className="text-center">
          <div
            className={`font-bold ${macro.color} ${
              index === 0 ? caloriesTextSizeClass : textSizeClass
            }`}
          >
            {macro.value}
            {macro.unit}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {macro.label}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

interface EntityInfoProps {
  name: string;
  brand?: string | null;
  servingSize?: number | null;
  servingUnit?: string | null;
  allergens?: string[] | null;
  servingUnitMapping?: Record<string, string>;
  servingLabel?: string; // New prop for custom label
}

export function EntityInfo({
  name,
  brand,
  servingSize,
  servingUnit,
  allergens,
  servingUnitMapping,
  servingLabel = "Serving", // Default to "Serving"
}: EntityInfoProps) {
  const formatServing = () => {
    if (servingSize && servingUnit) {
      const uiUnit = servingUnitMapping?.[servingUnit] || servingUnit;
      return `${servingSize} ${uiUnit}`;
    }
    return "N/A";
  };

  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-card-foreground text-lg truncate">
        {name}
        {brand ? ` (${brand})` : ""}
      </h3>
      <p className="text-sm text-muted-foreground">
        {servingLabel}: {formatServing()}
      </p>
      {/* Allergen Tags */}
      {allergens && allergens.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Contains:
          </span>
          <div className="flex flex-wrap gap-2">
            {allergens.map((allergen, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

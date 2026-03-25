import FormField from "./FormField";

interface Areas {
  sales_area_sqm: string;
  kitchen_sqm: string;
  storage_sqm: string;
  basement_sqm: string;
  upper_sqm: string;
  outdoor_seating: boolean;
}

interface AreaBreakdownProps {
  areas: Areas;
  onChange: (areas: Areas) => void;
  niaSqm: number;
  errors?: Record<string, string>;
  businessType?: string;
  floorConfig?: string;
  salesAreaLabel?: string;
  descriptionText?: string;
}

const AreaBreakdown = ({ areas, onChange, niaSqm, errors, businessType, floorConfig, salesAreaLabel = "Sales / dining area (sqm)", descriptionText = "Break your total floor space into the areas below. These don't need to be exact — use your best estimate." }: AreaBreakdownProps) => {
  // Determine which fields to show based on floor config
  const hasBasement = floorConfig === "ground_lower_ground" || floorConfig === "ground_lower_ground_first";
  const hasUpper = floorConfig === "ground_first" || floorConfig === "ground_lower_ground_first";

  const fields: { key: keyof Omit<Areas, "outdoor_seating">; label: string; helper?: string; visible: boolean }[] = [
    { key: "sales_area_sqm", label: salesAreaLabel, visible: true },
    { key: "kitchen_sqm", label: "Kitchen area (sqm)", helper: "Total kitchen and food prep space", visible: true },
    { key: "storage_sqm", label: "Storage / back-of-house (sqm)", visible: true },
    { key: "basement_sqm", label: "Basement storage (sqm)", visible: hasBasement },
    { key: "upper_sqm", label: "Upper floor / mezzanine (sqm)", visible: hasUpper },
  ];

  const visibleFields = fields.filter(f => f.visible);

  const total = visibleFields.reduce((sum, f) => sum + (parseFloat(areas[f.key] as string) || 0), 0);
  const diverges = niaSqm > 0 && total > 0 && Math.abs(total - niaSqm) / niaSqm > 0.20;

  // Outdoor seating only relevant for restaurant_cafe and pub
  const showOutdoorSeating = !businessType || businessType === "restaurant_cafe" || businessType === "pub";

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold font-serif text-foreground">Floor area breakdown</legend>
      <p className="text-sm text-muted-foreground">
        {descriptionText}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleFields.map((f) => (
          <FormField
            key={f.key}
            id={f.key}
            label={f.label}
            type="number"
            value={areas[f.key] as string}
            onChange={(v) => onChange({ ...areas, [f.key]: v })}
            error={errors?.[f.key]}
            helperText={f.helper}
          />
        ))}
      </div>

      {showOutdoorSeating && (
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={areas.outdoor_seating}
            onChange={(e) => onChange({ ...areas, outdoor_seating: e.target.checked })}
            className="rounded border-input"
          />
          This property has outdoor seating
        </label>
      )}

      <p className="text-sm font-medium text-foreground">Total entered: {total} sqm</p>

      {diverges && (
        <p className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm text-foreground">
          Your breakdown doesn't quite match your total floor area — double check if you can, but you can still continue
        </p>
      )}
    </fieldset>
  );
};

export default AreaBreakdown;

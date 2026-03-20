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
}

const fields: { key: keyof Omit<Areas, "outdoor_seating">; label: string; helper?: string }[] = [
  { key: "sales_area_sqm", label: "Sales / dining area (sqm)" },
  { key: "kitchen_sqm", label: "Kitchen area (sqm)", helper: "Total kitchen and food prep space" },
  { key: "storage_sqm", label: "Storage / back-of-house (sqm)" },
  { key: "basement_sqm", label: "Basement storage (sqm)" },
  { key: "upper_sqm", label: "Upper floor / mezzanine (sqm)" },
];

const AreaBreakdown = ({ areas, onChange, niaSqm, errors }: AreaBreakdownProps) => {
  const total = fields.reduce((sum, f) => sum + (parseFloat(areas[f.key] as string) || 0), 0);
  const diverges = niaSqm > 0 && total > 0 && Math.abs(total - niaSqm) / niaSqm > 0.20;

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold font-serif text-foreground">Floor area breakdown</legend>
      <p className="text-sm text-muted-foreground">
        Break your total floor space into the areas below. These don't need to be exact — use your best estimate.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
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

      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={areas.outdoor_seating}
          onChange={(e) => onChange({ ...areas, outdoor_seating: e.target.checked })}
          className="rounded border-input"
        />
        This property has outdoor seating
      </label>

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

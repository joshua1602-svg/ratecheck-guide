import FormField from "@/components/FormField";

type FloorConfig =
  | "ground_only"
  | "ground_lower_ground"
  | "ground_first"
  | "ground_lower_ground_first"
  | "other";

export interface LayoutInputState {
  floor_config: FloorConfig;
  ground_floor_trading_sqm: string;
  ground_floor_storage_sqm: string;
  ground_floor_kitchen_sqm: string;
  ground_floor_other_sqm: string;
  ground_floor_other_label: string;
  lower_ground_trading_sqm: string;
  lower_ground_storage_sqm: string;
  lower_ground_kitchen_sqm: string;
  lower_ground_other_sqm: string;
  lower_ground_other_label: string;
  upper_floor_trading_sqm: string;
  upper_floor_storage_sqm: string;
  upper_floor_kitchen_sqm: string;
  upper_floor_other_sqm: string;
  upper_floor_other_label: string;
}

export const LAYOUT_DEFAULTS: LayoutInputState = {
  floor_config: "ground_only",
  ground_floor_trading_sqm: "",
  ground_floor_storage_sqm: "",
  ground_floor_kitchen_sqm: "",
  ground_floor_other_sqm: "",
  ground_floor_other_label: "",
  lower_ground_trading_sqm: "",
  lower_ground_storage_sqm: "",
  lower_ground_kitchen_sqm: "",
  lower_ground_other_sqm: "",
  lower_ground_other_label: "",
  upper_floor_trading_sqm: "",
  upper_floor_storage_sqm: "",
  upper_floor_kitchen_sqm: "",
  upper_floor_other_sqm: "",
  upper_floor_other_label: "",
};

const FLOOR_CONFIG_OPTIONS = [
  { value: "ground_only", label: "Ground floor only" },
  { value: "ground_lower_ground", label: "Ground + lower ground" },
  { value: "ground_first", label: "Ground + first floor" },
  { value: "ground_lower_ground_first", label: "Ground + lower ground + first floor" },
  { value: "other", label: "Other" },
];

interface LayoutSectionProps {
  layout: LayoutInputState;
  onChange: (layout: LayoutInputState) => void;
  showKitchen: boolean;
  outdoorSeating?: boolean;
  onOutdoorSeatingChange?: (value: boolean) => void;
  niaSqm?: number;
  errors?: Record<string, string>;
  hideRequiredLabel?: boolean;
}

interface FloorBreakdownProps {
  prefix: string;
  title: string;
  layout: LayoutInputState;
  showKitchen: boolean;
  subtotal: number;
  niaSqm: number;
  onUpdate: (field: keyof LayoutInputState, value: string) => void;
}

const FloorBreakdown = ({ prefix, title, layout, showKitchen, subtotal, niaSqm, onUpdate }: FloorBreakdownProps) => {
  const tradingKey = `${prefix}_trading_sqm` as keyof LayoutInputState;
  const storageKey = `${prefix}_storage_sqm` as keyof LayoutInputState;
  const kitchenKey = `${prefix}_kitchen_sqm` as keyof LayoutInputState;
  const otherKey = `${prefix}_other_sqm` as keyof LayoutInputState;
  const otherLabelKey = `${prefix}_other_label` as keyof LayoutInputState;

  return (
    <>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enter the space on this floor by use (leave blank if none).
        </p>
      </div>
      <FormField
        id={tradingKey}
        label="Trading area (sqm)"
        type="number"
        value={layout[tradingKey]}
        onChange={(v) => onUpdate(tradingKey, v)}
        helperText="Customer-facing trading or service area."
      />
      <FormField
        id={storageKey}
        label="Storage area (sqm)"
        type="number"
        value={layout[storageKey]}
        onChange={(v) => onUpdate(storageKey, v)}
        helperText="Stock, storage, or back-of-house area."
      />
      {showKitchen && (
        <FormField
          id={kitchenKey}
          label="Kitchen / prep area (sqm)"
          type="number"
          value={layout[kitchenKey]}
          onChange={(v) => onUpdate(kitchenKey, v)}
          helperText="Kitchen, food prep, or food-service area."
        />
      )}
      <FormField
        id={otherKey}
        label={showKitchen ? "Other (e.g., toilet) (sqm)" : "Other (e.g., kitchen, toilet) (sqm)"}
        type="number"
        value={layout[otherKey]}
        onChange={(v) => onUpdate(otherKey, v)}
      />
      <FormField
        id={otherLabelKey}
        label="Other area description (optional)"
        value={layout[otherLabelKey]}
        onChange={(v) => onUpdate(otherLabelKey, v)}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {title.replace(" breakdown", "")} subtotal: {subtotal} sqm
        </p>
        {niaSqm > 0 && subtotal > niaSqm && (
          <p className="text-xs text-destructive">Exceeds total floor area</p>
        )}
      </div>
    </>
  );
};

const LayoutSection = ({
  layout,
  onChange,
  showKitchen,
  outdoorSeating = false,
  onOutdoorSeatingChange,
  niaSqm = 0,
  errors,
  hideRequiredLabel = false,
}: LayoutSectionProps) => {
  const update = (field: keyof LayoutInputState, value: string) => {
    const next = { ...layout, [field]: value };

    if (field === "floor_config") {
      const cfg = value as FloorConfig;
      const hasLower = cfg === "ground_lower_ground" || cfg === "ground_lower_ground_first";
      const hasUpper = cfg === "ground_first" || cfg === "ground_lower_ground_first";
      if (!hasLower) {
        next.lower_ground_trading_sqm = "";
        next.lower_ground_storage_sqm = "";
        next.lower_ground_kitchen_sqm = "";
        next.lower_ground_other_sqm = "";
        next.lower_ground_other_label = "";
      }
      if (!hasUpper) {
        next.upper_floor_trading_sqm = "";
        next.upper_floor_storage_sqm = "";
        next.upper_floor_kitchen_sqm = "";
        next.upper_floor_other_sqm = "";
        next.upper_floor_other_label = "";
      }
    }

    onChange(next);
  };

  const hasLowerGround =
    layout.floor_config === "ground_lower_ground" ||
    layout.floor_config === "ground_lower_ground_first";

  const hasUpperFloor =
    layout.floor_config === "ground_first" ||
    layout.floor_config === "ground_lower_ground_first";

  const toNum = (value: string) => parseFloat(value) || 0;

  const groundSubtotal =
    toNum(layout.ground_floor_trading_sqm) +
    toNum(layout.ground_floor_storage_sqm) +
    (showKitchen ? toNum(layout.ground_floor_kitchen_sqm) : 0) +
    toNum(layout.ground_floor_other_sqm);

  const lowerSubtotal = hasLowerGround
    ? toNum(layout.lower_ground_trading_sqm) +
      toNum(layout.lower_ground_storage_sqm) +
      (showKitchen ? toNum(layout.lower_ground_kitchen_sqm) : 0) +
      toNum(layout.lower_ground_other_sqm)
    : 0;

  const upperSubtotal = hasUpperFloor
    ? toNum(layout.upper_floor_trading_sqm) +
      toNum(layout.upper_floor_storage_sqm) +
      (showKitchen ? toNum(layout.upper_floor_kitchen_sqm) : 0) +
      toNum(layout.upper_floor_other_sqm)
    : 0;

  const consolidatedTotal = groundSubtotal + lowerSubtotal + upperSubtotal;
  const diverges = niaSqm > 0 && consolidatedTotal > 0 && Math.abs(consolidatedTotal - niaSqm) / niaSqm > 0.20;

  const hasMultipleFloors = hasLowerGround || hasUpperFloor;

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold font-heading text-foreground">
        Floor layout{!hideRequiredLabel && " — required"}
      </legend>
      <p className="text-xs text-muted-foreground">
        Helps us match your property more accurately against comparables.
      </p>

      <FormField
        id="floor_config"
        label="Floor configuration"
        type="select"
        value={layout.floor_config}
        onChange={(v) => update("floor_config", v)}
        options={FLOOR_CONFIG_OPTIONS}
        error={errors?.floor_config}
        required
      />

      {/* Ground floor breakdown */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Ground floor breakdown</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enter the space on this floor by use (leave blank if none).
        </p>
      </div>

      <FormField
        id="ground_floor_trading_sqm"
        label="Trading area (sqm)"
        type="number"
        value={layout.ground_floor_trading_sqm}
        onChange={(v) => update("ground_floor_trading_sqm", v)}
        helperText="Customer-facing trading or service area."
      />
      <FormField
        id="ground_floor_storage_sqm"
        label="Storage area (sqm)"
        type="number"
        value={layout.ground_floor_storage_sqm}
        onChange={(v) => update("ground_floor_storage_sqm", v)}
        helperText="Stock, storage, or back-of-house area."
      />
      {showKitchen && (
        <FormField
          id="ground_floor_kitchen_sqm"
          label="Kitchen / prep area (sqm)"
          type="number"
          value={layout.ground_floor_kitchen_sqm}
          onChange={(v) => update("ground_floor_kitchen_sqm", v)}
          helperText="Kitchen, food prep, or food-service area."
        />
      )}
      <FormField
        id="ground_floor_other_sqm"
        label={showKitchen ? "Other (e.g., toilet) (sqm)" : "Other (e.g., kitchen, toilet) (sqm)"}
        type="number"
        value={layout.ground_floor_other_sqm}
        onChange={(v) => update("ground_floor_other_sqm", v)}
      />
      <FormField
        id="ground_floor_other_label"
        label="Other area description (optional)"
        value={layout.ground_floor_other_label}
        onChange={(v) => update("ground_floor_other_label", v)}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Ground floor subtotal: {groundSubtotal} sqm</p>
        {niaSqm > 0 && groundSubtotal > niaSqm && (
          <p className="text-xs text-destructive">Exceeds total floor area</p>
        )}
      </div>

      {/* Non-ground floor intro copy */}
      {hasMultipleFloors && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Enter each non-ground floor area by use so we can value the layout more accurately.
          </p>
        </div>
      )}

      {/* Lower ground floor breakdown */}
      {hasLowerGround && (
        <FloorBreakdown
          prefix="lower_ground"
          title="Lower ground floor breakdown"
          layout={layout}
          showKitchen={showKitchen}
          subtotal={lowerSubtotal}
          niaSqm={niaSqm}
          onUpdate={update}
        />
      )}

      {/* Upper floor breakdown */}
      {hasUpperFloor && (
        <FloorBreakdown
          prefix="upper_floor"
          title="Upper floor breakdown"
          layout={layout}
          showKitchen={showKitchen}
          subtotal={upperSubtotal}
          niaSqm={niaSqm}
          onUpdate={update}
        />
      )}

      {/* Consolidated total */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">Total entered: {consolidatedTotal} sqm</p>
      </div>
      {diverges && (
        <p className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm text-foreground">
          Your floor breakdown differs from your total floor area by more than 20% — please review if possible, but you can continue.
        </p>
      )}

      {showKitchen && onOutdoorSeatingChange && (
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={outdoorSeating}
            onChange={(e) => onOutdoorSeatingChange(e.target.checked)}
            className="rounded border-input"
          />
          This property has outdoor seating
        </label>
      )}
    </fieldset>
  );
};

export default LayoutSection;

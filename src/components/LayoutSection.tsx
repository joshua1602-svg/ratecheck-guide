import FormField from "@/components/FormField";

type FloorConfig =
  | "ground_only"
  | "ground_lower_ground"
  | "ground_first"
  | "ground_lower_ground_first"
  | "other";

type LowerGroundUse = "trading" | "storage" | "kitchen" | "office" | "not_applicable";
type UpperFloorUse = "trading" | "storage" | "office" | "not_applicable";
type KitchenOnGround = "yes" | "no" | "no_kitchen";

export interface LayoutInputState {
  floor_config: FloorConfig;
  ground_floor_trading_sqm: string;
  ground_floor_storage_sqm: string;
  lower_ground_use: LowerGroundUse;
  upper_floor_use: UpperFloorUse;
  kitchen_on_ground: KitchenOnGround;
}

export const LAYOUT_DEFAULTS: LayoutInputState = {
  floor_config: "ground_only",
  ground_floor_trading_sqm: "",
  ground_floor_storage_sqm: "",
  lower_ground_use: "not_applicable",
  upper_floor_use: "not_applicable",
  kitchen_on_ground: "no_kitchen",
};

const FLOOR_CONFIG_OPTIONS = [
  { value: "ground_only", label: "Ground floor only" },
  { value: "ground_lower_ground", label: "Ground + lower ground" },
  { value: "ground_first", label: "Ground + first floor" },
  { value: "ground_lower_ground_first", label: "Ground + lower ground + first floor" },
  { value: "other", label: "Other" },
];

const LOWER_GROUND_USE_OPTIONS = [
  { value: "not_applicable", label: "Not applicable" },
  { value: "trading", label: "Trading" },
  { value: "storage", label: "Storage" },
  { value: "kitchen", label: "Kitchen" },
  { value: "office", label: "Office" },
];

const UPPER_FLOOR_USE_OPTIONS = [
  { value: "not_applicable", label: "Not applicable" },
  { value: "trading", label: "Trading" },
  { value: "storage", label: "Storage" },
  { value: "office", label: "Office" },
];

const KITCHEN_ON_GROUND_OPTIONS = [
  { value: "no_kitchen", label: "No kitchen" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No (kitchen is on another floor)" },
];

interface LayoutSectionProps {
  layout: LayoutInputState;
  onChange: (layout: LayoutInputState) => void;
  showKitchen: boolean;
  showConsolidatedAreas?: boolean;
  consolidatedAreas?: {
    basement_sqm: string;
    upper_sqm: string;
    visible_kitchen_sqm: string;
    outdoor_seating: boolean;
  };
  onConsolidatedAreasChange?: (areas: {
    basement_sqm: string;
    upper_sqm: string;
    visible_kitchen_sqm: string;
    outdoor_seating: boolean;
  }) => void;
  niaSqm?: number;
  errors?: Record<string, string>;
  hideRequiredLabel?: boolean;
  naOptionLabel?: string;
}

const LayoutSection = ({
  layout,
  onChange,
  showKitchen,
  showConsolidatedAreas = false,
  consolidatedAreas,
  onConsolidatedAreasChange,
  niaSqm = 0,
  errors,
  hideRequiredLabel = false,
  naOptionLabel = "Not applicable",
}: LayoutSectionProps) => {
  const update = (field: keyof LayoutInputState, value: string) => {
    const next = { ...layout, [field]: value };

    if (field === "floor_config") {
      const cfg = value as FloorConfig;
      const hasLower = cfg === "ground_lower_ground" || cfg === "ground_lower_ground_first";
      const hasUpper = cfg === "ground_first" || cfg === "ground_lower_ground_first";
      if (!hasLower) next.lower_ground_use = "not_applicable";
      if (!hasUpper) next.upper_floor_use = "not_applicable";
    }

    onChange(next);
  };

  const hasLowerGround =
    layout.floor_config === "ground_lower_ground" ||
    layout.floor_config === "ground_lower_ground_first";

  const hasUpperFloor =
    layout.floor_config === "ground_first" ||
    layout.floor_config === "ground_lower_ground_first";

  const consolidatedTotal = showConsolidatedAreas && consolidatedAreas
    ? (parseFloat(layout.ground_floor_trading_sqm) || 0) +
      (parseFloat(layout.ground_floor_storage_sqm) || 0) +
      (parseFloat(consolidatedAreas.visible_kitchen_sqm) || 0) +
      (parseFloat(consolidatedAreas.basement_sqm) || 0) +
      (parseFloat(consolidatedAreas.upper_sqm) || 0)
    : 0;
  const diverges = niaSqm > 0 && consolidatedTotal > 0 && Math.abs(consolidatedTotal - niaSqm) / niaSqm > 0.20;

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold font-serif text-foreground">
        Floor layout{!hideRequiredLabel && " — required"}
      </legend>
      <p className="text-xs text-muted-foreground">
        Helps us match your property more accurately against comparables
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

      <FormField
        id="ground_floor_trading_sqm"
        label="Ground floor trading area (sqm)"
        type="number"
        value={layout.ground_floor_trading_sqm}
        onChange={(v) => update("ground_floor_trading_sqm", v)}
        helperText="Customer-facing sales or service area on the ground floor"
      />

      <FormField
        id="ground_floor_storage_sqm"
        label="Ground floor storage area (sqm)"
        type="number"
        value={layout.ground_floor_storage_sqm}
        onChange={(v) => update("ground_floor_storage_sqm", v)}
        helperText="Back-of-house storage on the ground floor"
      />

      {hasLowerGround && (
        <FormField
          id="lower_ground_use"
          label="Lower ground floor use"
          type="select"
          value={layout.lower_ground_use}
          onChange={(v) => update("lower_ground_use", v)}
          options={LOWER_GROUND_USE_OPTIONS.map(o => o.value === "not_applicable" ? { ...o, label: naOptionLabel } : o)}
        />
      )}

      {hasUpperFloor && (
        <FormField
          id="upper_floor_use"
          label="Upper floor use"
          type="select"
          value={layout.upper_floor_use}
          onChange={(v) => update("upper_floor_use", v)}
          options={UPPER_FLOOR_USE_OPTIONS.map(o => o.value === "not_applicable" ? { ...o, label: naOptionLabel } : o)}
        />
      )}

      {showKitchen && (
        <FormField
          id="kitchen_on_ground"
          label="Kitchen on the ground floor?"
          type="select"
          value={layout.kitchen_on_ground}
          onChange={(v) => update("kitchen_on_ground", v)}
          options={KITCHEN_ON_GROUND_OPTIONS}
        />
      )}

      {showConsolidatedAreas && consolidatedAreas && onConsolidatedAreasChange && (
        <>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Add any non-ground-floor or restaurant-specific areas below. We only ask for each area once, then map it to required backend fields.
            </p>
          </div>

          {showKitchen && (
            <FormField
              id="visible_kitchen_sqm"
              label="Kitchen area (sqm)"
              type="number"
              value={consolidatedAreas.visible_kitchen_sqm}
              onChange={(v) => onConsolidatedAreasChange({ ...consolidatedAreas, visible_kitchen_sqm: v })}
              helperText="Total visible / active kitchen and prep space"
              error={errors?.visible_kitchen_sqm}
            />
          )}

          {hasLowerGround && (
            <FormField
              id="basement_sqm"
              label="Basement area (sqm)"
              type="number"
              value={consolidatedAreas.basement_sqm}
              onChange={(v) => onConsolidatedAreasChange({ ...consolidatedAreas, basement_sqm: v })}
              error={errors?.basement_sqm}
            />
          )}

          {hasUpperFloor && (
            <FormField
              id="upper_sqm"
              label="Upper floor / mezzanine area (sqm)"
              type="number"
              value={consolidatedAreas.upper_sqm}
              onChange={(v) => onConsolidatedAreasChange({ ...consolidatedAreas, upper_sqm: v })}
              error={errors?.upper_sqm}
            />
          )}

          {showKitchen && (
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={consolidatedAreas.outdoor_seating}
                onChange={(e) => onConsolidatedAreasChange({ ...consolidatedAreas, outdoor_seating: e.target.checked })}
                className="rounded border-input"
              />
              This property has outdoor seating
            </label>
          )}

          <p className="text-sm font-medium text-foreground">Total entered: {consolidatedTotal} sqm</p>
          {diverges && (
            <p className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm text-foreground">
              Your breakdown doesn't quite match your total floor area — double check if you can, but you can still continue
            </p>
          )}
        </>
      )}
    </fieldset>
  );
};

export default LayoutSection;

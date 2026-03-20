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
  errors?: Record<string, string>;
}

const LayoutSection = ({ layout, onChange, showKitchen, errors }: LayoutSectionProps) => {
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

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold font-serif text-foreground">
        Floor layout — required
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
          options={LOWER_GROUND_USE_OPTIONS}
        />
      )}

      {hasUpperFloor && (
        <FormField
          id="upper_floor_use"
          label="Upper floor use"
          type="select"
          value={layout.upper_floor_use}
          onChange={(v) => update("upper_floor_use", v)}
          options={UPPER_FLOOR_USE_OPTIONS}
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
    </fieldset>
  );
};

export default LayoutSection;

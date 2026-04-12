# Floor layout UX and data-capture review (Intake)

## Scope
This review focuses on how `src/pages/Intake.tsx` captures and submits floor-layout data, and how the current floor-layout UI constraints affect data quality for valuation.

## Current behavior (objective)

1. Intake sends `layout` and `areas` payloads derived from `layoutInput` plus `consolidatedAreas`.
2. Ground-floor data capture is split into only:
   - `ground_floor_trading_sqm`
   - `ground_floor_storage_sqm`
   - plus restaurant-only `visible_kitchen_sqm` from `consolidatedAreas`
3. Lower/upper floors capture only **single-use classification** (`lower_ground_use`, `upper_floor_use`) and a **single total sqm** bucket (`basement_sqm`, `upper_sqm`) rather than multi-use splits.
4. As a result, non-ground floors cannot express mixed uses (e.g., 40 sqm trading + 15 sqm storage + 20 sqm kitchen on the same floor), even when this is operationally common.

## Why this is problematic for valuation

- **Information loss:** single-use selectors force a dominant category, flattening mixed-use floors.
- **Feature ambiguity:** backend receives floor totals (`basement_sqm`, `upper_sqm`) without reliable per-use distribution, reducing comparability quality.
- **Inconsistent granularity:** ground floor has partial split by use, but upper/lower floors do not.
- **Restaurant underfit:** kitchen area can be captured overall, but not consistently attributed by floor for weighting and floor-utility analysis.

## Proposed UX changes (optimal but incremental)

### 1) Replace per-floor "single use" with per-floor usage matrix
For each present floor (ground / lower ground / first+): capture numeric sqm for:
- Trading
- Storage
- Kitchen (shown only for `restaurant_cafe`)
- Other (optional descriptor + sqm, non-valued by default)

This allows mixed-use input naturally and removes forced categorization.

### 2) Keep floor configuration as a progressive disclosure control
Retain `floor_config` to decide which floor cards appear, but each shown floor card should include all relevant usage inputs.

### 3) Add per-floor and total validation feedback
- Subtotal per floor
- Overall total vs NIA delta indicator (existing divergence pattern can be reused)
- Soft warning for >20% mismatch, not hard-blocking submit

### 4) Improve labels and helper copy
Use plain-language labels like:
- "Lower ground floor breakdown"
- "Enter sqm for each use on this floor (leave blank if none)"

### 5) Preserve low-friction completion
- Default blank fields to `0` in payload mapping
- Keep optional inputs optional
- Keep current submit flow and consent flow unchanged

## Proposed backend-oriented payload contract

### New canonical structure
```json
{
  "layout": {
    "floor_config": "ground_lower_ground_first",
    "floors": [
      {
        "level": "ground",
        "uses": {
          "trading_sqm": 60,
          "storage_sqm": 20,
          "kitchen_sqm": 10,
          "other_sqm": 5,
          "other_label": "public_toilet"
        }
      },
      {
        "level": "lower_ground",
        "uses": {
          "trading_sqm": 15,
          "storage_sqm": 30,
          "kitchen_sqm": 5,
          "other_sqm": 0
        }
      },
      {
        "level": "first",
        "uses": {
          "trading_sqm": 10,
          "storage_sqm": 20,
          "kitchen_sqm": 0,
          "other_sqm": 5,
          "other_label": "staff_welfare"
        }
      }
    ]
  }
}
```

### Backward compatibility recommendation
Continue deriving legacy fields (`sales_area_sqm`, `storage_sqm`, `basement_sqm`, `upper_sqm`, etc.) from the canonical `floors` array during migration so existing valuation logic remains stable.

## Required data-capture fields to enhance valuation

Minimum useful additions:
1. `layout.floors[].level`
2. `layout.floors[].uses.trading_sqm`
3. `layout.floors[].uses.storage_sqm`
4. `layout.floors[].uses.kitchen_sqm` (restaurant only)
5. `layout.floors[].uses.other_sqm`
6. `layout.floors[].uses.other_label` (optional, taxonomy-ready)
7. `layout.total_entered_sqm`
8. `layout.total_vs_nia_delta_pct`

High-value optional additions:
- `layout.floors[].customer_access` (public-facing vs back-of-house)
- `layout.floors[].fitout_condition` (if known)

## Rollout approach

1. Introduce canonical `floors[]` in intake payload.
2. Derive current legacy area fields server-side for compatibility.
3. Update valuation features to consume per-floor per-use data.
4. Decommission single-use floor fields once model parity is confirmed.

## Backend changes required if these UX edits are implemented

Yes — implementing the proposed UX/data model requires backend work. The minimum set is:

1. **API schema updates**
   - Extend `paid_intake.layout` to accept `floors[]` with per-floor per-use sqm fields.
   - Add validation rules for allowed `level` values and non-negative numeric sqm inputs.

2. **Compatibility mapping layer**
   - Keep existing downstream contracts operational by deriving current legacy fields:
     - `sales_area_sqm`, `storage_sqm`, `basement_sqm`, `upper_sqm`, `visible_kitchen_sqm`, etc.
   - Prefer server-side mapping so frontend and valuation consumers can migrate independently.

3. **Persistence changes**
   - Store canonical `layout.floors[]` in the intake record (JSON column or relational child table).
   - Version payloads (or add feature flag) so old and new payload shapes can coexist during rollout.

4. **Valuation feature pipeline updates**
   - Update feature engineering to use floor-level mixed-use signals (not only floor totals).
   - Preserve fallback behavior when only legacy fields are available.

5. **Data quality and observability**
   - Add checks/metrics for NIA vs entered-total divergence and missing floor-use allocations.
   - Add structured logging for parse/validation failures on the new payload shape.

6. **Testing and migration**
   - Add unit tests for mapping from `floors[]` to legacy fields.
   - Add integration tests for `/purchase` (old payload and new payload).
   - Backfill strategy is optional; historical rows can remain legacy if consumers handle both schemas.

## Constraint noted
This review intentionally does not modify unrelated frontend sections; it focuses on floor-layout UX/data strategy and Intake payload design.

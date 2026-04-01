import { useState } from "react";
import { useLocation, useSearchParams, Navigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import FormField from "@/components/FormField";
import StatusBanner from "@/components/StatusBanner";
import LayoutSection, { LAYOUT_DEFAULTS, type LayoutInputState } from "@/components/LayoutSection";

const API_URL = import.meta.env.VITE_API_URL || "https://ratechecker-production.up.railway.app";

const AREA_TYPES = ["restaurant_cafe", "retail", "hair_beauty"];
const SHOW_PARKING = ["nursery", "pub", "retail"];
// hide parking for restaurant_cafe and hair_beauty

const Intake = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as { assessRequest?: any; assessmentResult: any; freeFormData: any; ratedComps?: any[] } | null;

  const freeFormData = state?.freeFormData;
  const product = searchParams.get("product") || "report";

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState(freeFormData?.postcode || "");
  const [voaRv, setVoaRv] = useState(freeFormData?.voa_rv?.toString() || "");
  const [totalFloorArea, setTotalFloorArea] = useState(freeFormData?.nia_sqm?.toString() || "");

  const [consolidatedAreas, setConsolidatedAreas] = useState({
    visible_kitchen_sqm: "",
    basement_sqm: "",
    upper_sqm: "",
    outdoor_seating: false,
  });

  const [layoutInput, setLayoutInput] = useState<LayoutInputState>({ ...LAYOUT_DEFAULTS });

  const [nurseryPurposeBuilt, setNurseryPurposeBuilt] = useState(false);
  const [nurseryOutdoorPlay, setNurseryOutdoorPlay] = useState(false);
  const [hasParking, setHasParking] = useState(false);

  const [layoutFlag, setLayoutFlag] = useState(false);
  const [crampedFlag, setCrampedFlag] = useState(false);
  const [fitoutYear, setFitoutYear] = useState("");
  const [consentDisclaimer, setConsentDisclaimer] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [apiError, setApiError] = useState<string | null>(null);

  // TEMPORARY: allow preview without state — remove when done testing
  // if (!state || !freeFormData) return <Navigate to="/" replace />;
  const safeFreeFormData = freeFormData || { business_type: "retail", email: "", postcode: "", nia_sqm: 0, voa_rv: 0 };

  const showAreas = AREA_TYPES.includes(safeFreeFormData.business_type);
  const isNursery = safeFreeFormData.business_type === "nursery";
  const showParking = SHOW_PARKING.includes(safeFreeFormData.business_type);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!businessName.trim()) errs.businessName = "Business name is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!postcode.trim()) errs.postcode = "Postcode is required — please re-enter";
    if (!voaRv.trim()) errs.voaRv = "Rateable value is required — please re-enter";
    if (!totalFloorArea.trim()) errs.totalFloorArea = "Total floor area is required";
    if (!layoutInput.floor_config) errs.floor_config = "Floor configuration is required";
    if (!consentDisclaimer) errs.consentDisclaimer = "You must accept to continue";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setApiError(null);

    const endpoint = product === "evidence" ? "evidence" : "report";
    const niaSqm = parseFloat(totalFloorArea) || safeFreeFormData.nia_sqm;
    const voaRvNum = voaRv ? parseFloat(voaRv) : 0;

    // paid_intake: user-entered property details from this form
    const paidIntake: Record<string, any> = {
      business_name: businessName,
      address,
      postcode: postcode.trim().toUpperCase(),
      nia_sqm: niaSqm,
      voa_rv: voaRvNum,
      layout: { ...layoutInput },
      flags: {
        layout_flag: layoutFlag,
        cramped_flag: crampedFlag,
        fitout_year: fitoutYear ? parseInt(fitoutYear) : undefined,
        consent_disclaimer: true,
      },
    };

    if (showAreas) {
      const tradingSqm = parseFloat(layoutInput.ground_floor_trading_sqm) || 0;
      const storageSqm = parseFloat(layoutInput.ground_floor_storage_sqm) || 0;
      const visibleKitchenSqm = safeFreeFormData.business_type === "restaurant_cafe"
        ? parseFloat(consolidatedAreas.visible_kitchen_sqm) || 0
        : 0;

      // Intentional contract mapping: one user-entered value powers both layout + areas fields expected by backend.
      paidIntake.layout = {
        ...layoutInput,
        ground_floor_trading_sqm: tradingSqm,
        ground_floor_storage_sqm: storageSqm,
      };

      paidIntake.areas = {
        sales_area_sqm: tradingSqm,
        visible_kitchen_sqm: visibleKitchenSqm,
        non_visible_kitchen_sqm: 0,
        storage_sqm: storageSqm,
        basement_sqm: parseFloat(consolidatedAreas.basement_sqm) || 0,
        upper_sqm: parseFloat(consolidatedAreas.upper_sqm) || 0,
        outdoor_seating: safeFreeFormData.business_type === "restaurant_cafe" ? consolidatedAreas.outdoor_seating : false,
      };
    }

    if (isNursery) {
      paidIntake.nursery = { purpose_built: nurseryPurposeBuilt, outdoor_play: nurseryOutdoorPlay };
    }

    if (showParking) {
      paidIntake.has_parking = hasParking;
    }

    // Send the original assess request/response + paid intake to backend
    // Backend persists everything and creates a Stripe checkout session
    const purchasePayload = {
      product: endpoint,
      assess_request: state?.assessRequest || null,
      assess_response: state?.assessmentResult || null,
      paid_intake: paidIntake,
      // Do not forward pre-intake /assess comps into paid report generation.
      // The initial free check is postcode-level and can predate address-aware
      // same-street matching; backend should reselect comps from paid intake.
      rated_comps: [],
    };

    try {
      const res = await fetch(`${API_URL}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchasePayload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || `Purchase failed (${res.status})`);
      }

      const { checkout_url } = await res.json();
      window.location.href = checkout_url;
    } catch (err: any) {
      setApiError(err.message || "Something went wrong — please try again.");
      setIsLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-8 flex justify-center"><BrandMark /></header>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Tell us more about your property
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This takes about 2 minutes. The more accurate your inputs, the better your report.
        </p>

        {apiError && <div className="mt-6"><StatusBanner message={apiError} onDismiss={() => setApiError(null)} /></div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {/* SECTION 1: Property Details */}
          <FormField id="businessName" label="Business name" value={businessName} onChange={setBusinessName} error={errors.businessName} required />
          <FormField id="address" label="Property address" type="textarea" value={address} onChange={setAddress} error={errors.address} required />
          <FormField id="postcode" label="Postcode" value={postcode} onChange={setPostcode} error={errors.postcode} required />
          <FormField
            id="voaRv"
            label="Current VOA rateable value (£)"
            type="number"
            value={voaRv}
            onChange={setVoaRv}
            error={errors.voaRv}
            helperText="Shown on your rates demand notice or at gov.uk/find-business-rates — different from your rates bill amount"
          />
          <FormField
            id="totalFloorArea"
            label="Total floor area (sqm)"
            type="number"
            value={totalFloorArea}
            onChange={setTotalFloorArea}
            error={errors.totalFloorArea}
            required
            helperText="The net internal area of your property — shown on your VOA record or rates demand. Exclude external areas."
          />

          {/* SECTION 2: Floor Layout */}
          <div className="border-t border-border pt-6">
            <LayoutSection
              layout={layoutInput}
              onChange={setLayoutInput}
              showKitchen={safeFreeFormData.business_type === "restaurant_cafe"}
              showConsolidatedAreas={showAreas}
              consolidatedAreas={consolidatedAreas}
              onConsolidatedAreasChange={setConsolidatedAreas}
              niaSqm={parseFloat(totalFloorArea) || 0}
              errors={errors}
              hideRequiredLabel={true}
              naOptionLabel="Other"
            />
          </div>


          {/* Year of last fit-out */}
          <div className="border-t border-border pt-6">
            <FormField id="fitoutYear" label="Year of last fit-out (if relevant)" type="number" value={fitoutYear} onChange={setFitoutYear} />
          </div>

          {/* Property characteristic checkboxes */}
          <fieldset className="space-y-3 border-t border-border pt-6">
            <legend className="text-lg font-bold font-heading text-foreground mb-2">Property characteristics</legend>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={layoutFlag} onChange={(e) => setLayoutFlag(e.target.checked)} className="h-4 w-4 rounded border-input" />
              The layout is awkward or irregular
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={crampedFlag} onChange={(e) => setCrampedFlag(e.target.checked)} className="h-4 w-4 rounded border-input" />
              The space feels cramped relative to its size
            </label>
            {showParking && (
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={hasParking} onChange={(e) => setHasParking(e.target.checked)} className="h-4 w-4 rounded border-input" />
                My property has dedicated car parking
              </label>
            )}
            {isNursery && (
              <>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={nurseryPurposeBuilt} onChange={(e) => setNurseryPurposeBuilt(e.target.checked)} className="h-4 w-4 rounded border-input" />
                  Purpose-built nursery
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={nurseryOutdoorPlay} onChange={(e) => setNurseryOutdoorPlay(e.target.checked)} className="h-4 w-4 rounded border-input" />
                  Has outdoor play area
                </label>
              </>
            )}
            <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={consentDisclaimer} onChange={(e) => setConsentDisclaimer(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-input" />
              <span>
                I understand this is an indicative assessment using VOA methods and not a guaranteed outcome
                <span className="text-destructive ml-0.5">*</span>
              </span>
            </label>
            {errors.consentDisclaimer && <p className="text-xs text-destructive">{errors.consentDisclaimer}</p>}
          </fieldset>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {isLoading ? "Generating report…" : "Generate report →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Intake;

import { useState } from "react";
import { useLocation, useSearchParams, Navigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import FormField from "@/components/FormField";
import AreaBreakdown from "@/components/AreaBreakdown";
import StatusBanner from "@/components/StatusBanner";

const API_URL = import.meta.env.VITE_API_URL || "https://ratechecker-production.up.railway.app";

const AREA_TYPES = ["restaurant_cafe", "retail", "hair_beauty"];

const Intake = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as { assessmentResult: any; freeFormData: any } | null;

  const freeFormData = state?.freeFormData;
  const product = searchParams.get("product") || "report";
  const isEvidence = product === "evidence";

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState(freeFormData?.postcode || "");
  const [voaRv, setVoaRv] = useState(freeFormData?.voa_rv?.toString() || "");
  const [floors, setFloors] = useState("");
  const [frontageM, setFrontageM] = useState("");
  const [depthM, setDepthM] = useState("");
  const [layoutNotes, setLayoutNotes] = useState("");

  const [areas, setAreas] = useState({
    sales_area_sqm: "",
    visible_kitchen_sqm: "",
    non_visible_kitchen_sqm: "",
    storage_sqm: "",
    basement_sqm: "",
    upper_sqm: "",
    outdoor_seating: false,
  });

  const [nurseryPurposeBuilt, setNurseryPurposeBuilt] = useState(false);
  const [nurseryOutdoorPlay, setNurseryOutdoorPlay] = useState(false);

  const [layoutFlag, setLayoutFlag] = useState(false);
  const [crampedFlag, setCrampedFlag] = useState(false);
  const [fitoutYear, setFitoutYear] = useState("");
  const [consentDisclaimer, setConsentDisclaimer] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!state || !freeFormData) return <Navigate to="/" replace />;

  const showAreas = AREA_TYPES.includes(freeFormData.business_type);
  const isNursery = freeFormData.business_type === "nursery";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!businessName.trim()) errs.businessName = "Business name is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!postcode.trim()) errs.postcode = "Postcode is required";
    if (!consentDisclaimer) errs.consentDisclaimer = "You must accept to continue";
    if (isEvidence) {
      if (!frontageM.trim()) errs.frontageM = "Required for evidence pack";
      if (!depthM.trim()) errs.depthM = "Required for evidence pack";
      if (showAreas && !areas.sales_area_sqm.trim()) errs.sales_area_sqm = "Required for evidence pack";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setApiError(null);

    const formData = {
      contact: { email: freeFormData.email, business_name: businessName },
      property: {
        postcode: postcode.trim().toUpperCase(),
        business_type: freeFormData.business_type,
        nia_sqm: freeFormData.nia_sqm,
        voa_rv: voaRv ? parseFloat(voaRv) : 0,
        address,
        floors: floors ? parseInt(floors) : undefined,
        frontage_m: frontageM ? parseFloat(frontageM) : undefined,
        depth_m: depthM ? parseFloat(depthM) : undefined,
        layout_notes: layoutNotes || undefined,
      },
      areas: showAreas
        ? {
            sales_area_sqm: parseFloat(areas.sales_area_sqm) || 0,
            visible_kitchen_sqm: parseFloat(areas.visible_kitchen_sqm) || 0,
            non_visible_kitchen_sqm: parseFloat(areas.non_visible_kitchen_sqm) || 0,
            storage_sqm: parseFloat(areas.storage_sqm) || 0,
            basement_sqm: parseFloat(areas.basement_sqm) || 0,
            upper_sqm: parseFloat(areas.upper_sqm) || 0,
            outdoor_seating: areas.outdoor_seating,
          }
        : undefined,
      nursery: isNursery
        ? { purpose_built: nurseryPurposeBuilt, outdoor_play: nurseryOutdoorPlay }
        : undefined,
      flags: {
        layout_flag: layoutFlag,
        cramped_flag: crampedFlag,
        fitout_year: fitoutYear ? parseInt(fitoutYear) : undefined,
        consent_disclaimer: true,
      },
    };

    try {
      const res = await fetch(`${API_URL}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, form_data: formData }),
      });

      if (!res.ok) throw new Error("Request failed");
      const { checkout_url } = await res.json();
      window.location.href = checkout_url;
    } catch {
      setApiError("Something went wrong — please try again. If the problem persists, email hello@ratecheck.co.uk");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-8"><BrandMark /></header>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-semibold">Step 1 of 2</span> — Property details
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div className="h-1.5 w-1/2 rounded-full bg-accent transition-all" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {isEvidence ? "Measure your property for your evidence pack" : "Tell us more about your property"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEvidence
            ? "We need your measured floor areas to run the zoning calculation. Use a tape measure or your lease plan if available."
            : "This takes about 2 minutes. The more accurate your inputs, the better your report."}
        </p>

        {apiError && <div className="mt-6"><StatusBanner message={apiError} onDismiss={() => setApiError(null)} /></div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <FormField id="businessName" label="Business name" value={businessName} onChange={setBusinessName} error={errors.businessName} required />
          <FormField id="address" label="Property address" type="textarea" value={address} onChange={setAddress} error={errors.address} required />
          <FormField id="postcode" label="Postcode" value={postcode} onChange={setPostcode} error={errors.postcode} required />
          <FormField
            id="voaRv"
            label="Current VOA rateable value (£)"
            type="number"
            value={voaRv}
            onChange={setVoaRv}
            helperText="Shown on your rates demand notice or at gov.uk/find-business-rates — different from your rates bill amount"
          />
          <FormField id="floors" label="Number of floors" type="number" value={floors} onChange={setFloors} />
          <FormField
            id="frontageM"
            label="Frontage width (m)"
            type="number"
            value={frontageM}
            onChange={setFrontageM}
            error={errors.frontageM}
            required={isEvidence}
            helperText="Width of your shopfront — estimates are fine"
          />
          <FormField
            id="depthM"
            label="Shop depth (m)"
            type="number"
            value={depthM}
            onChange={setDepthM}
            error={errors.depthM}
            required={isEvidence}
            helperText="Depth of your sales floor from front to back"
          />
          <FormField id="layoutNotes" label="Layout notes" type="textarea" value={layoutNotes} onChange={setLayoutNotes} helperText="Anything unusual — irregular shape, split levels, etc." />

          {showAreas && (
            <AreaBreakdown
              areas={areas}
              onChange={setAreas}
              niaSqm={freeFormData.nia_sqm}
              errors={errors}
            />
          )}

          {isNursery && (
            <fieldset className="space-y-3">
              <legend className="text-lg font-bold font-serif text-foreground">Nursery details</legend>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={nurseryPurposeBuilt} onChange={(e) => setNurseryPurposeBuilt(e.target.checked)} className="rounded border-input" />
                Purpose-built nursery
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={nurseryOutdoorPlay} onChange={(e) => setNurseryOutdoorPlay(e.target.checked)} className="rounded border-input" />
                Has outdoor play area
              </label>
            </fieldset>
          )}

          {isEvidence && (
            <div className="rounded-md border border-border bg-secondary/50 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Measured dimensions</p>
              <p className="text-xs text-muted-foreground mt-1">
                These are used to calculate your exact Zone A area. Accuracy here directly affects the quality of your evidence pack.
              </p>
            </div>
          )}

          {/* Confirmations */}
          <fieldset className="space-y-3 border-t border-border pt-6">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={layoutFlag} onChange={(e) => setLayoutFlag(e.target.checked)} className="rounded border-input" />
              The layout is awkward or irregular
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={crampedFlag} onChange={(e) => setCrampedFlag(e.target.checked)} className="rounded border-input" />
              The space feels cramped relative to its size
            </label>
            <FormField id="fitoutYear" label="Year of last fit-out (if relevant)" type="number" value={fitoutYear} onChange={setFitoutYear} />
            <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={consentDisclaimer} onChange={(e) => setConsentDisclaimer(e.target.checked)} className="mt-0.5 rounded border-input" />
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
            {isLoading ? "Preparing payment…" : "Continue to payment →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Intake;

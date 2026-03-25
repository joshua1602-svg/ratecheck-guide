import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock, BarChart3 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import FormField from "@/components/FormField";
import StatusBanner from "@/components/StatusBanner";

const API_URL = import.meta.env.VITE_API_URL || "https://ratechecker-production.up.railway.app";
const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACrL_Queqta8Dqxg";

const BUSINESS_TYPES = [
  { value: "restaurant_cafe", label: "Restaurant / Café" },
  { value: "retail", label: "Retail" },
  { value: "hair_beauty", label: "Hair / Beauty" },
  { value: "nursery", label: "Nursery" },
  { value: "pub", label: "Pub" },
];

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

declare global {
  interface Window {
    onTurnstileSuccess?: (token: string) => void;
    onTurnstileError?: () => void;
  }
}

const TRUST_POINTS = [
  { icon: <Zap size={16} />, text: "60-second free check" },
  { icon: <Lock size={16} />, text: "No signup required" },
  { icon: <BarChart3 size={16} />, text: "Based on VOA data" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [postcode, setPostcode] = useState("");
  const [niaSqm, setNiaSqm] = useState("");
  const [voaRv, setVoaRv] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    window.onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
      setTurnstileError(false);
    };
    window.onTurnstileError = () => {
      setTurnstileToken(null);
      setTurnstileError(true);
    };
    return () => {
      delete window.onTurnstileSuccess;
      delete window.onTurnstileError;
    };
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!businessType) errs.businessType = "Select a business type";
    if (!postcode.trim()) errs.postcode = "Postcode is required";
    else if (!UK_POSTCODE_RE.test(postcode.trim())) errs.postcode = "Enter a valid UK postcode";
    if (!niaSqm.trim()) errs.niaSqm = "Floor area is required";
    else if (parseFloat(niaSqm) <= 0) errs.niaSqm = "Must be greater than 0";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setApiError(null);

    const freeFormData = {
      email,
      business_type: businessType,
      postcode: postcode.trim().toUpperCase(),
      nia_sqm: parseFloat(niaSqm),
      voa_rv: voaRv ? parseFloat(voaRv) : undefined,
    };

    try {
      const assessRequest = {
        contact: { email: freeFormData.email, business_name: "" },
        property: {
          postcode: freeFormData.postcode,
          business_type: freeFormData.business_type,
          nia_sqm: freeFormData.nia_sqm,
          voa_rv: freeFormData.voa_rv || 0,
          address: "",
        },
        layout: null,
        flags: { consent_disclaimer: true },
        captcha_token: turnstileToken,
      };

      const res = await fetch(`${API_URL}/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessRequest),
      });

      if (!res.ok) throw new Error("Request failed");
      const assessmentResult = await res.json();
      // rated_comps is the authoritative post-fit comparable pool from /assess
      const { rated_comps, ...restAssessment } = assessmentResult;
      navigate("/results", { state: { assessRequest, assessmentResult: restAssessment, ratedComps: rated_comps || [], freeFormData } });
    } catch {
      setApiError("Something went wrong — please try again. If the problem persists, email hello@ratecheck.co.uk");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section>
        <div className="mx-auto max-w-form px-5 pb-12 pt-8">
          <header className="mb-10 flex justify-center">
            <BrandMark variant="light" />
          </header>

          <h1 className="text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl text-center">
            Are you overpaying business rates? Check in 60 seconds
          </h1>

          <p className="mt-5 text-center text-sm text-primary-foreground/80">
            If your bill is fair, we'll tell you for free. If it's too high, we give you the data to fix it.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {TRUST_POINTS.map((tp) => (
              <span
                key={tp.text}
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/8 px-4 py-1.5 text-sm font-medium text-primary-foreground"
              >
                <span>{tp.icon}</span>
                {tp.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section>
        <div className="mx-auto max-w-form px-5 -mt-1 pb-12">
          <div className="rounded-2xl bg-card p-6 sm:p-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-1">Your property details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Based on the Valuation Office Agency's published rating data
            </p>

            {apiError && <StatusBanner message={apiError} onDismiss={() => setApiError(null)} />}

            {turnstileError && (
              <StatusBanner message="Security check failed — please refresh and try again" onDismiss={() => setTurnstileError(false)} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Turnstile disabled — widget fails in preview/sandbox.
                  Re-enable when deploying to production domain. */}
              {/* <div
                className="cf-turnstile"
                data-sitekey={TURNSTILE_KEY}
                data-callback="onTurnstileSuccess"
                data-error-callback="onTurnstileError"
              /> */}

              <FormField
                id="businessType"
                label="Business type"
                type="select"
                value={businessType}
                onChange={setBusinessType}
                error={errors.businessType}
                required
                options={BUSINESS_TYPES}
              />

              <FormField
                id="postcode"
                label="Property postcode"
                type="text"
                value={postcode}
                onChange={setPostcode}
                onBlur={() => setPostcode(postcode.trim().toUpperCase())}
                error={errors.postcode}
                required
                placeholder="E1 6AN"
              />

              <FormField
                id="niaSqm"
                label="Approximate floor area (sqm)"
                type="number"
                value={niaSqm}
                onChange={setNiaSqm}
                error={errors.niaSqm}
                helperText="Your best estimate is fine"
                required
              />

              <FormField
                id="voaRv"
                label="Approximate annual rates bill (£)"
                type="number"
                value={voaRv}
                onChange={setVoaRv}
                helperText="Found on your rates demand notice from your local council — not required but improves accuracy"
              />

              <FormField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                helperText="We'll send your result here"
                required
                placeholder="you@business.co.uk"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {isLoading ? "Checking…" : "Check my rates →"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            We do not share your contact details with third parties unless consent is given.{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy policy</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;

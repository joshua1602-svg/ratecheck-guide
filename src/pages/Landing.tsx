import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    // Turnstile token is optional in preview/dev for testing
    // if (!turnstileToken) return;

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
      const res = await fetch(`${API_URL}/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { email: freeFormData.email, business_name: "" },
          property: {
            postcode: freeFormData.postcode,
            business_type: freeFormData.business_type,
            nia_sqm: freeFormData.nia_sqm,
            voa_rv: freeFormData.voa_rv || 0,
            address: "",
          },
          flags: { consent_disclaimer: true },
          captcha_token: turnstileToken,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      const assessmentResult = await res.json();
      navigate("/results", { state: { assessmentResult, freeFormData } });
    } catch {
      setApiError("Something went wrong — please try again. If the problem persists, email hello@ratecheck.co.uk");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10">
          <BrandMark />
        </header>

        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Find out if your 2026 business rates are too high
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A free 60-second check — no signup required
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Based on the Valuation Office Agency's published rating data
        </p>

        {apiError && <div className="mt-6"><StatusBanner message={apiError} onDismiss={() => setApiError(null)} /></div>}

        {turnstileError && (
          <div className="mt-6">
            <StatusBanner message="Security check failed — please refresh and try again" onDismiss={() => setTurnstileError(false)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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

          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_KEY}
            data-callback="onTurnstileSuccess"
            data-error-callback="onTurnstileError"
          />

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {isLoading ? "Checking…" : "Check my rates →"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your data is used only to run your assessment. We do not share it with third parties.{" "}
          <a href="/privacy" className="underline hover:text-foreground">Privacy policy</a>
        </p>
      </div>
    </div>
  );
};

export default Landing;

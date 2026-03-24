import { useLocation, useNavigate, Navigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import ProductCard from "@/components/ProductCard";

const signalConfig: Record<string, { border: string; heading: string }> = {
  High: { border: "border-l-signal-high", heading: "There may be a case for overassessment" },
  Medium: { border: "border-l-signal-medium", heading: "Your rates may be worth reviewing" },
  Low: { border: "border-l-signal-low", heading: "Your rates appear broadly in line" },
  "Insufficient Data": { border: "border-l-signal-insufficient", heading: "We couldn't find enough comparable data" },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { assessRequest?: any; assessmentResult: any; freeFormData: any; ratedComps?: any[] } | null;

  if (!state) return <Navigate to="/" replace />;

  const { assessRequest, assessmentResult, freeFormData, ratedComps = [] } = state;
  const signal = assessmentResult?.signal || "Low";
  const config = signalConfig[signal] || signalConfig.Low;

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10 text-center sm:text-left"><BrandMark /></header>

        {/* Verdict Card */}
        <div className="rounded-lg border-2 border-accent bg-card p-6">
          <span className="mb-3 inline-block rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            Overassessment likelihood: {signal}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-card-foreground">Your property may be over-assessed</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your current rateable value appears higher than similar properties nearby. This may support a review or challenge.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This is an initial indication based on available data — not a formal valuation.
          </p>
        </div>

        {/* Layout indicator */}
        {assessmentResult?.layout_adjustment_applied === true && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Estimate refined using layout data
          </p>
        )}
        {assessmentResult?.layout_adjustment_applied === false && (
          <button
            type="button"
            onClick={() => navigate("/intake?product=report", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
            className="mt-3 text-xs text-accent hover:underline"
          >
            Add layout details to refine your estimate →
          </button>
        )}

        {/* Product Options */}
        <h2 className="mt-12 text-2xl font-bold text-foreground">
          Next step: understand your saving or prepare your challenge
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ProductCard
            badge="START HERE"
            title="Rates Assessment"
            price="£99"
            description="See if it's worth challenging your rates."
            features={[
              "Estimated fair rateable value",
              "Potential annual saving",
              "Snapshot of comparable evidence",
            ]}
            subtext="Start here to understand your opportunity."
            ctaLabel="See my estimated saving →"
            variant="accent"
            onClick={() => navigate("/intake?product=simplified", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
          />
          <ProductCard
            badge="READY TO CHALLENGE"
            title="Evidence Pack"
            price="£249"
            priceNote="£99 credited if you start with the Rates Assessment"
            description="Everything you need to prepare and submit a challenge."
            features={[
              "Full comparable evidence",
              "Adjustment analysis",
              "Pre-written challenge submission",
            ]}
            subtext="Designed to support a Check & Challenge (no guarantee of outcome)."
            ctaLabel="Prepare my challenge →"
            variant="accent"
            onClick={() => navigate("/intake?product=evidence", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
          />
        </div>

        {/* Value reinforcement */}
        <div className="mt-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-foreground">
          If successful, a challenge may result in ongoing annual savings and potential backdated refunds.
        </div>

        {/* Trust Footer */}
        <div className="mt-8 flex flex-wrap justify-center gap-8 border-t border-border pt-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">🔒 Secure payment via Stripe</span>
          <span className="flex items-center gap-1.5">📄 PDF delivered within minutes</span>
          <span className="flex items-center gap-1.5">✓ Based on VOA published data</span>
        </div>

        {/* Liability disclaimer */}
        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
          This analysis is based on publicly available data and comparable property estimates. It does not constitute a formal valuation or guarantee a successful outcome.
        </p>
      </div>
    </div>
  );
};

export default Results;

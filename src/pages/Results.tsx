import { useLocation, useNavigate, Navigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import ProductCard from "@/components/ProductCard";

// Four-tier verdict config
type VerdictTier = "undervalued" | "inline" | "slight" | "over" | "insufficient";

interface VerdictConfig {
  badgeLabel: string;
  heading: string;
  body: string;
  sectionHeading: string;
}

const verdictConfigs: Record<VerdictTier, VerdictConfig> = {
  undervalued: {
    badgeLabel: "POSITION: WITHIN TYPICAL RANGE",
    heading: "Your rates sit within the typical range — but some nearby properties may be lower",
    body: "Based on available data, your rateable value appears broadly consistent with similar properties nearby. However, some comparable properties may support a closer review.",
    sectionHeading: "See the full picture — and whether there may be a case to reduce your rates",
  },
  inline: {
    badgeLabel: "POSITION: WITHIN TYPICAL RANGE",
    heading: "Your rates sit within the typical range — but some nearby properties may be lower",
    body: "Based on available data, your rateable value appears broadly consistent with similar properties nearby. However, some comparable properties may support a closer review.",
    sectionHeading: "See the full picture — and whether there may be a case to reduce your rates",
  },
  slight: {
    badgeLabel: "POSITION: REVIEW RECOMMENDED",
    heading: "Your property may warrant closer review",
    body: "Some comparable evidence suggests there may be room to challenge, but the position is not yet definitive.",
    sectionHeading: "See the full picture — and whether there may be a case to reduce your rates",
  },
  over: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: HIGH",
    heading: "Your rates appear higher than similar properties nearby",
    body: "Several comparable properties appear to be assessed at lower levels, which may support a challenge.",
    sectionHeading: "See the full picture — and whether there may be a case to reduce your rates",
  },
  insufficient: {
    badgeLabel: "INSUFFICIENT DATA",
    heading: "We couldn't find enough comparable data",
    body: "There wasn't enough nearby comparable evidence to make a reliable indication from the free check. A fuller evidence review may still identify relevant comparables.",
    sectionHeading: "See the full picture — and whether there may be a case to reduce your rates",
  },
};

function getVerdictTier(
  voaRv: number,
  modelledLow: number,
  modelledHigh: number,
  signal: string
): VerdictTier {
  if (signal === "Insufficient Data") return "insufficient";
  if (voaRv <= 0 || modelledHigh <= 0) return "inline";
  if (voaRv < modelledLow) return "undervalued";
  if (voaRv <= modelledHigh) return "inline";
  const overage = (voaRv - modelledHigh) / modelledHigh;
  return overage < 0.15 ? "slight" : "over";
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { assessRequest?: any; assessmentResult: any; freeFormData: any; ratedComps?: any[] } | null;
  if (!state) return <Navigate to="/" replace />;
  const { assessRequest, assessmentResult, freeFormData, ratedComps = [] } = state;

  const signal = assessmentResult?.signal || "Low";
  const voaRv = assessRequest?.property?.voa_rv ?? 0;
  const bestRv = assessmentResult?.adjusted_estimated_rv ?? assessmentResult?.base_estimated_rv ?? 0;
  const modelledLow = bestRv > 0 ? Math.round((bestRv * 0.95) / 100) * 100 : 0;
  const modelledHigh = bestRv > 0 ? Math.round((bestRv * 1.05) / 100) * 100 : 0;

  const tier = getVerdictTier(voaRv, modelledLow, modelledHigh, signal);
  const config = verdictConfigs[tier];

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10 flex justify-center"><BrandMark /></header>

        {/* Verdict Card */}
        <div className="rounded-lg border-2 border-accent bg-primary p-6">
          <span className="mb-3 inline-block rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            {config.badgeLabel}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-card-foreground">{config.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {config.body}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This is an initial indication based on available data, not a formal valuation.
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
            onClick={() => navigate("/intake?product=evidence", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
            className="mt-3 text-xs text-accent hover:underline"
          >
            Add layout details to refine your estimate →
          </button>
        )}

        {/* Step-based journey */}
        <h2 className="mt-10 text-2xl font-bold text-foreground">
          {config.sectionHeading}
        </h2>

        <div className="mt-6">
          <ProductCard
            badge="MAIN NEXT STEP"
            title="Evidence Pack"
            price="£149"
            description="See how your property compares in detail, which nearby properties appear lower, and whether there is a credible basis to challenge."
            features={[
              "Detailed view of where your property sits vs local evidence",
              "Nearby comparable properties assessed at lower levels",
              "Clear recommendation on whether to challenge or monitor",
            ]}
            ctaLabel="Get my Evidence Pack"
            variant="accent"
            onClick={() => navigate("/intake?product=evidence", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
          />
        </div>

        <div className="mt-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-4 text-sm text-foreground space-y-3">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
              <span>A successful challenge may result in ongoing annual savings and potential backdated refunds.</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span>Agents charge &gt;30% of your saving annually. Our pack gives you the tools to submit a Challenge yourself.</span>
            </div>
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

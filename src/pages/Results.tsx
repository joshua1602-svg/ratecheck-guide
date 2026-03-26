import { useLocation, useNavigate, Navigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import ProductCard from "@/components/ProductCard";

// Four-tier verdict config
// Tier 1 — undervalued:  voaRv < modelledLow
// Tier 2 — inline:       voaRv within modelled band (±5%)
// Tier 3 — slight:       voaRv > modelledHigh, overage < 15%
// Tier 4 — over:         voaRv > modelledHigh, overage >= 15%
type VerdictTier = "undervalued" | "inline" | "slight" | "over" | "insufficient";

interface VerdictConfig {
  badgeLabel: string;
  heading: string;
  body: string;
  sectionHeading: string;
  showEvidencePack: boolean;
  assessmentCta: string;
  assessmentDescription: string;
}

const verdictConfigs: Record<VerdictTier, VerdictConfig> = {
  undervalued: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: LOW",
    heading: "Your property does not appear over-assessed",
    body: "Your current rateable value appears lower than the level indicated by comparable properties. This is unlikely to support a challenge for reduction.",
    sectionHeading: "Want to be certain? Get a full assessment.",
    showEvidencePack: false,
    assessmentCta: "Get my full assessment →",
    assessmentDescription: "Confirm your position with a full comparable analysis.",
  },
  inline: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: LOW",
    heading: "Your rates appear broadly in line",
    body: "Your current rateable value appears broadly consistent with similar properties nearby on the available evidence.",
    sectionHeading: "Want to be certain? Get a full assessment.",
    showEvidencePack: false,
    assessmentCta: "Get my full assessment →",
    assessmentDescription: "Confirm your position with a full comparable analysis.",
  },
  slight: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: LOW–MEDIUM",
    heading: "Your rates may be slightly high",
    body: "Your current rateable value appears marginally above similar properties nearby. There may be a limited case for review depending on the strength of comparable evidence.",
    sectionHeading: "Understand if it's worth challenging.",
    showEvidencePack: true,
    assessmentCta: "See my estimated saving →",
    assessmentDescription: "See if it's worth challenging your rates.",
  },
  over: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: HIGH",
    heading: "Your rates appear overassessed",
    body: "Your current rateable value is notably above comparable properties nearby. The evidence suggests a reasonable case for challenge.",
    sectionHeading: "Next step: prepare your challenge.",
    showEvidencePack: true,
    assessmentCta: "See my estimated saving →",
    assessmentDescription: "See if it's worth challenging your rates.",
  },
  insufficient: {
    badgeLabel: "INSUFFICIENT DATA",
    heading: "We couldn't find enough comparable data",
    body: "There wasn't enough nearby comparable evidence to make a reliable assessment. This may improve as more data becomes available.",
    sectionHeading: "Want to be certain? Get a full assessment.",
    showEvidencePack: false,
    assessmentCta: "Get my full assessment →",
    assessmentDescription: "We'll run a deeper search for comparable evidence.",
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
        <h2 className="mt-10 text-2xl font-bold text-foreground">
          {config.sectionHeading}
        </h2>

        {config.showEvidencePack ? (
          /* Two-product layout — slight and over tiers */
          <div className="mt-6 grid gap-5 sm:grid-cols-2 items-start">
            {/* Rates Assessment — invisible spacer matches Evidence Pack banner height */}
            <div className="flex flex-col">
              <div className="rounded-t-lg px-3 py-2 text-center text-xs font-semibold leading-tight invisible" aria-hidden="true">
                £99 credited if you start with the Rates Assessment
              </div>
              <ProductCard
                badge="START HERE"
                title="Rates Assessment"
                price="£99"
                description={config.assessmentDescription}
                features={[
                  "Estimated fair rateable value",
                  "Potential annual saving",
                  "Snapshot of comparable evidence",
                ]}
                subtext="Start here to understand your opportunity."
                ctaLabel={config.assessmentCta}
                variant="accent"
                onClick={() => navigate("/intake?product=report", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
              />
            </div>
            {/* Evidence Pack — banner flush on top of card */}
            <div className="flex flex-col">
              <div className="rounded-t-lg bg-accent px-3 py-2 text-center text-xs font-semibold text-accent-foreground leading-tight">
                £99 credited if you start with the Rates Assessment
              </div>
              <ProductCard
                badge="READY TO CHALLENGE"
                title="Evidence Pack"
                price="£249"
                description="Everything you need to prepare and submit a challenge."
                features={[
                  "Full comparable evidence",
                  "Adjustment analysis",
                  "Pre-written challenge submission",
                ]}
                subtext="Designed to support a Check & Challenge (no guarantee of outcome)."
                ctaLabel="Start my challenge →"
                variant="accent"
                className="rounded-t-none"
                onClick={() => navigate("/intake?product=evidence", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
              />
            </div>
          </div>
        ) : (
          /* Single-product layout — undervalued, inline and insufficient tiers */
          <div className="mt-6 max-w-sm">
            <ProductCard
              badge="GET CERTAINTY"
              title="Rates Assessment"
              price="£99"
              description={config.assessmentDescription}
              features={[
                "Estimated fair rateable value",
                "Full comparable evidence",
                "Snapshot of comparable properties",
              ]}
              subtext="Understand your position with a full analysis."
              ctaLabel={config.assessmentCta}
              variant="accent"
              onClick={() => navigate("/intake?product=report", { state: { assessRequest, assessmentResult, freeFormData, ratedComps } })}
            />
          </div>
        )}

        {/* Value reinforcement — only shown when there's a potential case */}
        {config.showEvidencePack && (
          <div className="mt-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-4 text-sm text-foreground space-y-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span>If successful, a challenge may result in ongoing annual savings and potential backdated refunds.</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span>Agents charge &gt;30% of your saving annually. Our pack gives you the information you need to submit a Challenge yourself.</span>
            </div>
          </div>
        )}

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

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
    sectionHeading: "Next step: review your evidence",
  },
  inline: {
    badgeLabel: "POSITION: WITHIN TYPICAL RANGE",
    heading: "Your rates sit within the typical range — but some nearby properties may be lower",
    body: "Based on available data, your rateable value appears broadly consistent with similar properties nearby. However, some comparable properties may support a closer review.",
    sectionHeading: "Next step: review your evidence",
  },
  slight: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: LOW–MEDIUM",
    heading: "Your rates may be slightly high",
    body: "Your current rateable value appears marginally above similar properties nearby. There may be a reasonable case for review depending on the strength of comparable evidence.",
    sectionHeading: "Next step: review your evidence",
  },
  over: {
    badgeLabel: "OVERASSESSMENT LIKELIHOOD: HIGH",
    heading: "Your rates appear higher than similar properties nearby",
    body: "Several comparable properties appear to be assessed at lower levels, which may support a challenge.",
    sectionHeading: "Next step: review your evidence",
  },
  insufficient: {
    badgeLabel: "INSUFFICIENT DATA",
    heading: "We couldn't find enough comparable data",
    body: "There wasn't enough nearby comparable evidence to make a reliable indication from the free check. A fuller evidence review may still identify relevant comparables.",
    sectionHeading: "Next step: review your evidence",
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
  const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

  const getNumber = (...values: unknown[]) => {
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
    return null;
  };

  const getRange = (...pairs: Array<{ low?: unknown; high?: unknown } | null | undefined>) => {
    for (const pair of pairs) {
      if (!pair) continue;
      const low = typeof pair.low === "number" && Number.isFinite(pair.low) ? pair.low : null;
      const high = typeof pair.high === "number" && Number.isFinite(pair.high) ? pair.high : null;
      if (low !== null && high !== null) return { low, high };
    }
    return null;
  };

  const currentRateableValue = getNumber(
    assessmentResult?.current_rateable_value,
    assessmentResult?.current_rv,
    assessmentResult?.voa_rv,
    assessRequest?.property?.voa_rv
  );
  const modelledRateableValue = getNumber(
    assessmentResult?.modelled_rateable_value,
    assessmentResult?.modelled_rv,
    assessmentResult?.adjusted_estimated_rv,
    assessmentResult?.base_estimated_rv
  );
  const impliedTotalSavings = getNumber(
    assessmentResult?.implied_total_saving_point,
    assessmentResult?.implied_total_savings_point,
    assessmentResult?.implied_total_saving,
    assessmentResult?.implied_total_savings,
    assessmentResult?.indicative_total_saving_point,
    assessmentResult?.total_savings
  );
  const comparablesAnalysed = getNumber(
    assessmentResult?.comparables_analysed,
    assessmentResult?.comparables_analyzed,
    assessmentResult?.comp_count,
    ratedComps?.length
  );
  const totalSavingsRange = getRange(
    {
      low: assessmentResult?.indicative_total_saving_low,
      high: assessmentResult?.indicative_total_saving_high,
    },
    {
      low: assessmentResult?.indicative_total_saving_low,
      high: assessmentResult?.indicative_total_saving_high,
    },
    {
      low: assessmentResult?.implied_total_savings_low,
      high: assessmentResult?.implied_total_savings_high,
    },
    {
      low: assessmentResult?.total_savings_low,
      high: assessmentResult?.total_savings_high,
    },
    {
      low: assessmentResult?.implied_total_saving_range?.low,
      high: assessmentResult?.implied_total_saving_range?.high,
    },
    {
      low: assessmentResult?.indicative_total_saving_range?.low,
      high: assessmentResult?.indicative_total_saving_range?.high,
    },
    {
      low: assessmentResult?.implied_total_savings_range?.low,
      high: assessmentResult?.implied_total_savings_range?.high,
    },
    assessmentResult?.implied_total_saving_range,
    assessmentResult?.indicative_total_saving_range,
    assessmentResult?.implied_total_savings_range
  );

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

        {totalSavingsRange && (
          <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Estimated potential saving</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {currency.format(totalSavingsRange.low)}–{currency.format(totalSavingsRange.high)} over the current rating period
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on available comparable evidence and current business rates assumptions. A full Evidence Pack provides the detailed breakdown and supporting analysis.
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Rateable Value</p>
            <p className="mt-1 text-sm font-semibold text-card-foreground">{currentRateableValue !== null ? currency.format(currentRateableValue) : "—"}</p>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Modelled Rateable Value</p>
            <p className="mt-1 text-sm font-semibold text-card-foreground">{modelledRateableValue !== null ? currency.format(modelledRateableValue) : "—"}</p>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Implied Total Savings</p>
            <p className="mt-1 text-sm font-semibold text-card-foreground">
              {impliedTotalSavings !== null ? currency.format(impliedTotalSavings) : totalSavingsRange ? `${currency.format(totalSavingsRange.low)}–${currency.format(totalSavingsRange.high)}` : "—"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comparables Analysed</p>
            <p className="mt-1 text-sm font-semibold text-card-foreground">{comparablesAnalysed !== null ? comparablesAnalysed.toLocaleString("en-GB") : "—"}</p>
          </div>
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

        {/* Paid next step */}
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
              <span>A successful challenge may result in implied total savings over the remaining rating period and potential backdated refunds.</span>
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

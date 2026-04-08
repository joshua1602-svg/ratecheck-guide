import { useNavigate } from "react-router-dom";

const mockStates = {
  over: {
    label: "Over-assessed",
    description: "VOA RV significantly above comparable properties. High likelihood of overassessment.",
    assessRequest: { property: { voa_rv: 25000 } },
    assessmentResult: { signal: "High", adjusted_estimated_rv: 18000, layout_adjustment_applied: false },
    freeFormData: {},
    ratedComps: [],
  },
  slight: {
    label: "Slightly high",
    description: "VOA RV marginally above comparables. Low–medium likelihood.",
    assessRequest: { property: { voa_rv: 20000 } },
    assessmentResult: { signal: "Medium", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  inline: {
    label: "In line",
    description: "VOA RV consistent with comparable properties. Low likelihood.",
    assessRequest: { property: { voa_rv: 18000 } },
    assessmentResult: { signal: "Low", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  undervalued: {
    label: "Under-valued",
    description: "VOA RV below comparable properties. No case for challenge.",
    assessRequest: { property: { voa_rv: 15000 } },
    assessmentResult: { signal: "Low", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  insufficient: {
    label: "Insufficient data",
    description: "Not enough comparable evidence to make a reliable assessment.",
    assessRequest: { property: { voa_rv: 20000 } },
    assessmentResult: { signal: "Insufficient Data", adjusted_estimated_rv: 0, layout_adjustment_applied: false },
    freeFormData: {},
    ratedComps: [],
  },
};

const ResultsPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-lg px-5 py-12">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dev only</p>
        <h1 className="text-2xl font-bold text-foreground">Results Preview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a verdict tier to preview the Results page layout.
        </p>

        <div className="mt-8 space-y-3">
          {Object.entries(mockStates).map(([tier, { label, description, ...state }]) => (
            <button
              key={tier}
              onClick={() => navigate("/results", { state })}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-card-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPreview;

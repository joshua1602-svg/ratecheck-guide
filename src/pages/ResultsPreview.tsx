import { useNavigate } from "react-router-dom";

const mockStates = {
  over: {
    assessRequest: { property: { voa_rv: 25000 } },
    assessmentResult: { signal: "High", adjusted_estimated_rv: 18000, layout_adjustment_applied: false },
    freeFormData: {},
    ratedComps: [],
  },
  slight: {
    assessRequest: { property: { voa_rv: 20000 } },
    assessmentResult: { signal: "Medium", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  inline: {
    assessRequest: { property: { voa_rv: 18000 } },
    assessmentResult: { signal: "Low", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  undervalued: {
    assessRequest: { property: { voa_rv: 15000 } },
    assessmentResult: { signal: "Low", adjusted_estimated_rv: 18000, layout_adjustment_applied: true },
    freeFormData: {},
    ratedComps: [],
  },
  insufficient: {
    assessRequest: { property: { voa_rv: 20000 } },
    assessmentResult: { signal: "Insufficient Data", adjusted_estimated_rv: 0, layout_adjustment_applied: false },
    freeFormData: {},
    ratedComps: [],
  },
};

const ResultsPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="space-y-3 w-full max-w-xs">
        <h2 className="text-lg font-bold text-foreground text-center mb-4">Results Preview (Dev)</h2>
        {Object.entries(mockStates).map(([tier, state]) => (
          <button
            key={tier}
            onClick={() => navigate("/results", { state })}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResultsPreview;

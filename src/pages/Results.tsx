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
  const state = location.state as { assessmentResult: any; freeFormData: any } | null;

  if (!state) return <Navigate to="/" replace />;

  const { assessmentResult, freeFormData } = state;
  const signal = assessmentResult?.signal || "Low";
  const config = signalConfig[signal] || signalConfig.Low;

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10"><BrandMark /></header>

        {/* Verdict Card */}
        <div className="rounded-lg border-2 border-accent bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Overassessment likelihood: {signal}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-card-foreground">{config.heading}</h2>
          {assessmentResult?.explanation && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{assessmentResult.explanation}</p>
          )}
          {assessmentResult?.comparable_count && (
            <p className="mt-2 text-xs text-muted-foreground">
              Based on {assessmentResult.comparable_count} comparable properties in your area
            </p>
          )}
        </div>

        {/* Product Options */}
        <h2 className="mt-12 text-2xl font-bold text-foreground">
          To challenge your rates, you'll need evidence
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ProductCard
            badge="MOST POPULAR"
            title="Rates Assessment"
            price="£99"
            description="A full comparable analysis showing how your property compares to similar properties, estimated rateable value, and instructions on how to file a Check with the VOA."
            features={[
              "Estimated RV and annual saving",
              "Select comparable evidence table",
              "Step-by-step filing guide",
              "PDF delivered within minutes",
            ]}
            ctaLabel="Get my report →"
            variant="primary"
            onClick={() => navigate("/intake?product=report", { state: { assessmentResult, freeFormData } })}
          />
          <ProductCard
            badge="BEST FOR CHALLENGES"
            title="Evidence Pack"
            price="£249"
            description="A detailed pack for filing outlining the basis for the estimated RV including comparables, property-specific adjustments, and model methodology."
            features={[
              "Everything in the Assessment Report",
              "Detailed valuation analysis",
              "Valuation methodology supporting a VOA challenge",
              "PDF delivered within minutes",
            ]}
            ctaLabel="Build my evidence pack →"
            variant="primary"
            onClick={() => navigate("/intake?product=evidence", { state: { assessmentResult, freeFormData } })}
          />
        </div>

        {/* Trust Footer */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 border-t border-border pt-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">🔒 Secure payment via Stripe</span>
          <span className="flex items-center gap-1.5">📄 PDF delivered within minutes</span>
          <span className="flex items-center gap-1.5">✓ Based on VOA published data</span>
        </div>
      </div>
    </div>
  );
};

export default Results;

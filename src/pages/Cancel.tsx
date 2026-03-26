import { useNavigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

const Cancel = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 text-center animate-fade-in">
        <header className="mb-10 flex justify-center"><BrandMark /></header>
        <h1 className="text-2xl font-bold text-foreground">Payment cancelled</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your payment was cancelled. You can restart your assessment at any time.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Return to RateCheck
        </button>
      </div>
    </div>
  );
};

export default Cancel;

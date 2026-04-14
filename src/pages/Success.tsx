import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

const API_URL = import.meta.env.VITE_API_URL || "https://ratechecker-production.up.railway.app";

type Status = "polling" | "ready" | "rate-limited" | "error";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const [status, setStatus] = useState<Status>("polling");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [email, setEmail] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef(Date.now());
  const resolvedRef = useRef(false); // gate: true once 200 received

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    const poll = async () => {
      // Hard gate: never poll after success
      if (resolvedRef.current) { stopPolling(); return; }

      if (Date.now() - startRef.current > 180_000) {
        stopPolling();
        if (!resolvedRef.current) setStatus("error");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/report/download/${sessionId}`);

        // Re-check gate after await — another tick may have resolved
        if (resolvedRef.current) return;

        if (res.status === 202 || res.status === 402) return; // still processing

        if (res.status === 429) {
          stopPolling();
          if (!resolvedRef.current) setStatus("rate-limited");
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // SUCCESS — backend returns PDF directly, not JSON
        resolvedRef.current = true;
        stopPolling();

        // Download the PDF blob
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `RateCheck-Report-${sessionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setStatus("ready");
      } catch {
        // transient error — keep polling unless already resolved
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => stopPolling();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10 flex justify-center"><BrandMark /></header>

        <div className="text-center">
          <p className="text-accent text-3xl mb-2">✓</p>
          <p className="text-sm font-semibold text-accent uppercase tracking-wider">Payment confirmed</p>

          <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            {status === "ready" ? "Your report is ready" : "Your report is being prepared"}
          </h1>

          {status === "polling" && (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                We're running your assessment now. This usually takes less than 2 minutes.
              </p>
              <div className="mt-8 flex justify-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block animate-pulse" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block animate-pulse [animation-delay:0.2s]" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block animate-pulse [animation-delay:0.4s]" />
              </div>
            </>
          )}

          {status === "ready" && (
            <p className="mt-4 text-sm text-muted-foreground">
              Your PDF has been downloaded. If it didn't start automatically,{" "}
              <button onClick={() => window.location.reload()} className="underline font-medium">
                refresh this page
              </button>.
            </p>
          )}

          {status === "rate-limited" && (
            <div className="mt-8 rounded-md border border-border bg-secondary px-4 py-4 text-sm text-foreground">
              We're preparing your report — please wait a moment and then{" "}
              <button onClick={() => window.location.reload()} className="underline font-medium">
                refresh this page
              </button>.
            </div>
          )}

          {status === "error" && (
            <div className="mt-8 rounded-md border border-border bg-secondary px-4 py-4 text-sm text-foreground">
              Something went wrong generating your report. Please email{" "}
              <a href="mailto:admin@ratecheck.uk" className="underline">admin@ratecheck.uk</a>{" "}
              with your order reference: <strong>{sessionId}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;

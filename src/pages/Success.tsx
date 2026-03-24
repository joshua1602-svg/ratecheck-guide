import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

const API_URL = import.meta.env.VITE_API_URL || "https://ratechecker-production.up.railway.app";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const [status, setStatus] = useState<"polling" | "ready" | "error">("polling");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [email, setEmail] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    const poll = async () => {
      if (Date.now() - startRef.current > 180_000) {
        clearInterval(intervalRef.current);
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/report/download/${sessionId}`);
        if (res.status === 202) return; // still generating, keep polling
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.email) setEmail(data.email);
        if (data.download_url) {
          setDownloadUrl(data.download_url);
          setStatus("ready");
          clearInterval(intervalRef.current);
        }
      } catch {
        // keep polling on transient errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => clearInterval(intervalRef.current);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
        <header className="mb-10"><BrandMark /></header>

        <div className="text-center">
          <p className="text-accent text-3xl mb-2">✓</p>
          <p className="text-sm font-semibold text-accent uppercase tracking-wider">Payment confirmed</p>

          <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Your report is being prepared
          </h1>

          {status === "polling" && (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                We're running your assessment now. This usually takes less than 2 minutes.
                {email && <> We'll also email it to <strong>{email}</strong>.</>}
              </p>
              <div className="dot-pulse mt-8 flex justify-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block" />
              </div>
            </>
          )}

          {status === "ready" && (
            <div className="mt-8">
              <a
                href={downloadUrl}
                className="inline-block rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Download your PDF →
              </a>
            </div>
          )}

          {status === "error" && (
            <div className="mt-8 rounded-md border border-border bg-secondary px-4 py-4 text-sm text-foreground">
              Something went wrong generating your report. Please email{" "}
              <a href="mailto:hello@ratecheck.co.uk" className="underline">hello@ratecheck.co.uk</a>{" "}
              with your order reference: <strong>{sessionId}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;

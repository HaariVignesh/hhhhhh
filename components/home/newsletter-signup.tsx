"use client";

import { useState, FormEvent } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section className="py-24 px-4 bg-nue-charcoal relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,110,0.06)_0%,transparent_65%)]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-px bg-nue-gold" />
        </div>

        <p className="text-nue-gold text-xs tracking-[0.4em] uppercase font-sans mb-4">
          Exclusive Access
        </p>

        <h2 className="font-serif text-display-md text-nue-cream mb-4 leading-tight">
          Join the NUE Circle
        </h2>

        <p className="text-nue-cream/50 text-sm font-sans font-light leading-relaxed mb-10">
          Be the first to know about new collections, private sales, and members-only
          events. No noise — only what matters.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-scale-in">
            <div className="w-14 h-14 rounded-full border border-nue-gold/40 flex items-center justify-center">
              <CheckCircle className="text-nue-gold" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-nue-cream font-serif text-lg mb-1">
                Welcome to the Circle
              </p>
              <p className="text-nue-cream/50 text-sm font-sans font-light">
                You'll hear from us soon with something special.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-0 border border-nue-cream/20 focus-within:border-nue-gold/60 transition-colors duration-300">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="your@email.com"
                required
                disabled={status === "loading"}
                className="flex-1 bg-transparent text-nue-cream placeholder:text-nue-cream/30 text-sm font-sans px-5 py-4 outline-none disabled:opacity-50"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="flex-shrink-0 flex items-center justify-center gap-2 bg-nue-gold hover:bg-nue-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs tracking-[0.2em] uppercase font-sans px-8 py-4 transition-all duration-200"
              >
                {status === "loading" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs font-sans text-left animate-fade-in">
                {errorMsg}
              </p>
            )}

            <p className="text-nue-cream/25 text-xs font-sans">
              Unsubscribe at any time. We respect your privacy.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

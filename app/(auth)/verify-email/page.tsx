"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Verification failed or link expired."
  );

  useEffect(() => {
    if (!token) {
      setErrorMessage("No verification token found. Please check your email for the correct link.");
      setState("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const body = await res.json().catch(() => ({}));

        if (res.ok) {
          setState("success");
        } else {
          setErrorMessage(body.message || "Verification failed or link expired.");
          setState("error");
        }
      } catch {
        setErrorMessage("Unable to verify your email. Please check your connection and try again.");
        setState("error");
      }
    };

    verify();
  }, [token]);

  if (state === "loading") {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#2C2C2C]/5 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-[#C9A96E] animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Verifying your email</h2>
            <p className="text-sm text-[#2C2C2C]/60">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#2C2C2C] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#C9A96E]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Email verified!</h2>
            <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">
              Your email address has been verified. You can now sign in to your NUE account.
            </p>
          </div>
        </div>

        <Link
          href="/login?verified=true"
          className="block w-full text-center px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200"
        >
          Sign In
        </Link>

        <p className="text-center text-xs text-[#2C2C2C]/40">
          Welcome to the NUE community. Explore our latest collections.
        </p>
      </div>
    );
  }

  // error state
  return (
    <div className="space-y-8">
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-[#2C2C2C]">Verification failed</h2>
          <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">{errorMessage}</p>
        </div>
      </div>

      <div className="bg-white border border-[#2C2C2C]/10 rounded-sm p-5 space-y-2">
        <p className="text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/50">
          What can I do?
        </p>
        <ul className="text-sm text-[#2C2C2C]/60 space-y-1.5">
          <li>· Verification links expire after 24 hours</li>
          <li>· Check that you used the most recent email we sent</li>
          <li>· Try registering again to receive a new link</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/register"
          className="block w-full text-center px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200"
        >
          Register Again
        </Link>

        <div className="text-center">
          <a
            href="mailto:hello@nueclothing.com"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A96E] hover:text-[#2C2C2C] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

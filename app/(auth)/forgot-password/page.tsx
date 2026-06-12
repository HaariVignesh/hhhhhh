"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft, Send } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Always show success even on error to prevent email enumeration
        if (res.status === 429) {
          setServerError("Too many requests. Please wait a few minutes before trying again.");
          return;
        }
      }

      // Always show success to prevent email enumeration
      setIsSuccess(true);
    } catch {
      setServerError("Unable to send reset email. Please check your connection and try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#2C2C2C] flex items-center justify-center">
              <Send className="w-6 h-6 text-[#C9A96E]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Check your inbox</h2>
            <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">
              If <span className="font-medium text-[#2C2C2C]">{getValues("email")}</span> is
              associated with a NUE account, we&apos;ve sent a password reset link. The link
              expires in 1 hour.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#2C2C2C]/10 rounded-sm p-5 space-y-2">
          <p className="text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/50">
            Tips
          </p>
          <ul className="text-sm text-[#2C2C2C]/60 space-y-1.5">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the right email</li>
            <li>• The link expires in 60 minutes</li>
          </ul>
        </div>

        <div className="space-y-3 text-center">
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-sm text-[#C9A96E] hover:text-[#2C2C2C] transition-colors"
          >
            Try a different email
          </button>
          <div className="block">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#2C2C2C]/50 hover:text-[#2C2C2C] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
        <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/60 leading-relaxed">
          No worries. Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className="w-full px-4 py-3 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[#2C2C2C]/40">
        Remembered your password?{" "}
        <Link href="/login" className="text-[#C9A96E] hover:text-[#2C2C2C] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

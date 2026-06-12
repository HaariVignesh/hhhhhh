"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);

    if (!token) {
      setServerError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(
          body.message || "Failed to reset password. Your link may have expired."
        );
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError("Unable to reset password. Please check your connection and try again.");
    }
  };

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Invalid reset link</h2>
            <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">
              This password reset link is invalid or missing a token. Please request a new one.
            </p>
          </div>
        </div>
        <Link
          href="/forgot-password"
          className="block w-full text-center px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#2C2C2C] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#C9A96E]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">Password reset!</h2>
            <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new
              password.
            </p>
          </div>
        </div>

        <Link
          href="/login?reset=true"
          className="block w-full text-center px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200"
        >
          Sign In
        </Link>
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
        <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Set new password</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/60 leading-relaxed">
          Your new password must be at least 8 characters and include an uppercase letter and a
          digit.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              {...register("password")}
              className="w-full px-4 py-3 pr-12 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#2C2C2C] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {watchedPassword && (
            <ul className="text-xs text-[#2C2C2C]/50 space-y-0.5 mt-1">
              <li className={watchedPassword.length >= 8 ? "text-green-600" : ""}>
                {watchedPassword.length >= 8 ? "✓" : "·"} At least 8 characters
              </li>
              <li className={/[A-Z]/.test(watchedPassword) ? "text-green-600" : ""}>
                {/[A-Z]/.test(watchedPassword) ? "✓" : "·"} One uppercase letter
              </li>
              <li className={/\d/.test(watchedPassword) ? "text-green-600" : ""}>
                {/\d/.test(watchedPassword) ? "✓" : "·"} One digit
              </li>
            </ul>
          )}
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 pr-12 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#2C2C2C] transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

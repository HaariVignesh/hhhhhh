"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, CheckCircle2 } from "lucide-react";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

type PasswordStrength = "none" | "weak" | "fair" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "none";
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  const isVeryLong = password.length >= 12;

  const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough, isVeryLong].filter(
    Boolean
  ).length;

  if (score <= 2) return "weak";
  if (score <= 4) return "fair";
  return "strong";
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; width: string }
> = {
  none: { label: "", color: "bg-transparent", width: "w-0" },
  weak: { label: "Weak", color: "bg-red-400", width: "w-1/3" },
  fair: { label: "Fair", color: "bg-[#C9A96E]", width: "w-2/3" },
  strong: { label: "Strong", color: "bg-green-500", width: "w-full" },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");
  const strength = getPasswordStrength(watchedPassword);
  const strengthInfo = strengthConfig[strength];

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.message || "Registration failed. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError("Something went wrong. Please check your connection and try again.");
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setIsGoogleLoading(false);
      setServerError("Google sign-up failed. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#2C2C2C] flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#C9A96E]" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-[#2C2C2C]">Check your email</h2>
          <p className="text-sm text-[#2C2C2C]/60 leading-relaxed max-w-sm mx-auto">
            We&apos;ve sent a verification link to your email address. Click the link to activate
            your account.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#2C2C2C]/50 justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            Didn&apos;t receive it? Check your spam folder.
          </div>
          <Link
            href="/login"
            className="block text-sm text-[#C9A96E] hover:text-[#2C2C2C] transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/60">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#C9A96E] hover:text-[#2C2C2C] font-medium transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
          {serverError}
        </div>
      )}

      {/* Google signup */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#2C2C2C]/20 bg-white text-[#2C2C2C] text-sm font-medium rounded-sm hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2C2C2C]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-[#F5F0E8] px-4 text-[#2C2C2C]/40">or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="w-full px-4 py-3 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
            placeholder="Jane Doe"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full px-4 py-3 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password", {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
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
          {/* Strength indicator */}
          {watchedPassword && (
            <div className="space-y-1">
              <div className="h-1 bg-[#2C2C2C]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`}
                />
              </div>
              {strengthInfo.label && (
                <p className="text-xs text-[#2C2C2C]/50">
                  Password strength:{" "}
                  <span
                    className={
                      strength === "strong"
                        ? "text-green-600"
                        : strength === "fair"
                        ? "text-[#C9A96E]"
                        : "text-red-400"
                    }
                  >
                    {strengthInfo.label}
                  </span>
                </p>
              )}
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70">
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

        <p className="text-xs text-[#2C2C2C]/40 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#C9A96E]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[#C9A96E]">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}

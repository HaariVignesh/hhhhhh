"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  EmailNotVerified: "Please verify your email before logging in. Check your inbox.",
  OAuthAccountNotLinked:
    "This email is linked to another sign-in method. Try Google login or reset your password.",
  Default: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");

  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (verified === "true") {
      setToast("Email verified! You can now log in.");
    }
    if (reset === "true") {
      setToast("Password reset successfully. Please log in with your new password.");
    }
  }, [verified, reset]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const message = ERROR_MESSAGES[result.error] || ERROR_MESSAGES.Default;
        setAuthError(message);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setAuthError(ERROR_MESSAGES.Default);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setIsGoogleLoading(false);
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C2C] text-white text-sm px-6 py-3 rounded-sm shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#C9A96E] hover:text-[#2C2C2C] font-medium transition-colors underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Error alert */}
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
          {authError}
        </div>
      )}

      {/* Google login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
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

      {/* Credentials form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium tracking-widest uppercase text-[#2C2C2C]/70">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#C9A96E] hover:text-[#2C2C2C] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className="w-full px-4 py-3 pr-12 bg-white border border-[#2C2C2C]/15 text-[#2C2C2C] text-sm placeholder:text-[#2C2C2C]/30 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] rounded-sm transition-colors"
              placeholder="••••••••"
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
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2C2C2C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-[#C9A96E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Mobile register link */}
      <p className="text-center text-xs text-[#2C2C2C]/50 lg:hidden">
        New to NUE?{" "}
        <Link href="/register" className="text-[#C9A96E] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

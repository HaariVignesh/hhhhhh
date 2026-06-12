"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, User, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v),
      "Please enter a valid Indian phone number"
    ),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/\d/, "Must contain a digit"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/settings");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        phone: (session.user as { phone?: string }).phone || "",
      });
      // Detect OAuth-only users (no password set)
      const provider = (session.user as { provider?: string }).provider;
      if (provider && provider !== "credentials") {
        setHasPassword(false);
      }
    }
  }, [session, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Error", description: body.message || "Failed to update profile.", variant: "destructive" });
        return;
      }

      await update({ name: data.name });
      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
    } catch {
      toast({ title: "Error", description: "Unable to update profile. Please try again.", variant: "destructive" });
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Error", description: body.message || "Failed to change password.", variant: "destructive" });
        return;
      }

      passwordForm.reset();
      toast({ title: "Password changed", description: "Your password has been updated." });
    } catch {
      toast({ title: "Error", description: "Unable to change password. Please try again.", variant: "destructive" });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Profile
        </Link>

        <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight mb-10">Settings</h1>

        {/* ── Edit Profile ── */}
        <section className="bg-white border border-nue-charcoal/8 p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 flex items-center justify-center bg-nue-cream">
              <User className="w-4 h-4 text-nue-charcoal" />
            </div>
            <h2 className="text-sm font-medium tracking-widest uppercase text-nue-charcoal">
              Edit Profile
            </h2>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                Full Name
              </label>
              <input
                {...profileForm.register("name")}
                className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                placeholder="Your name"
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                Phone{" "}
                <span className="normal-case font-normal text-nue-stone">(optional)</span>
              </label>
              <input
                {...profileForm.register("phone")}
                type="tel"
                className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                placeholder="+91 9876543210"
              />
              {profileForm.formState.errors.phone && (
                <p className="text-xs text-red-500">
                  {profileForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                Email
              </label>
              <input
                value={session?.user?.email || ""}
                readOnly
                className="w-full px-4 py-3 border border-nue-charcoal/8 text-nue-stone text-sm bg-nue-cream/30"
              />
              <p className="text-xs text-nue-stone">Email cannot be changed.</p>
            </div>

            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </section>

        {/* ── Change Password ── */}
        {hasPassword && (
          <section className="bg-white border border-nue-charcoal/8 p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 flex items-center justify-center bg-nue-cream">
                <Lock className="w-4 h-4 text-nue-charcoal" />
              </div>
              <h2 className="text-sm font-medium tracking-widest uppercase text-nue-charcoal">
                Change Password
              </h2>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("currentPassword")}
                    type={showCurrent ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-nue-stone hover:text-nue-charcoal transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("newPassword")}
                    type={showNew ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-nue-stone hover:text-nue-charcoal transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-nue-stone hover:text-nue-charcoal transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </section>
        )}

        {!hasPassword && (
          <div className="bg-nue-cream/50 border border-nue-charcoal/8 p-5 text-sm text-nue-stone">
            You signed in with a social account. Password change is not available for social
            logins.
          </div>
        )}
      </div>
    </div>
  );
}

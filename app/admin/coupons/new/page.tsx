"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CouponForm = {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number | "";
  minOrderAmount: number | "";
  maxDiscount: number | "";
  usageLimit: number | "";
  perUserLimit: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
};

export default function NewCouponPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponForm>({
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      perUserLimit: 1,
      isActive: true,
      startsAt: "",
      expiresAt: "",
    },
  });

  const watchedType = watch("type");

  const onSubmit = async (data: CouponForm) => {
    setSubmitting(true);
    setError(null);
    const payload = {
      ...data,
      minOrderAmount: data.minOrderAmount === "" ? null : Number(data.minOrderAmount),
      maxDiscount: data.maxDiscount === "" ? null : Number(data.maxDiscount),
      usageLimit: data.usageLimit === "" ? null : Number(data.usageLimit),
      startsAt: data.startsAt || null,
      expiresAt: data.expiresAt || null,
      value: Number(data.value),
    };
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to create coupon");
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "block text-sm font-medium text-zinc-700 mb-1.5";
  const inputClass = "h-9";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">New Coupon</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Create a discount coupon for your customers
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/coupons")}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5">
          <h2 className="font-medium text-zinc-900 text-sm border-b border-zinc-100 pb-3">
            Coupon Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Code */}
            <div className="md:col-span-2">
              <label className={fieldClass}>Coupon Code *</label>
              <Input
                {...register("code", { required: "Code is required" })}
                placeholder="e.g. WELCOME20"
                className={`${inputClass} uppercase font-mono tracking-widest`}
                onChange={(e) =>
                  setValue("code", e.target.value.toUpperCase())
                }
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={fieldClass}>Description</label>
              <Textarea
                {...register("description")}
                placeholder="Internal note about this coupon..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className={fieldClass}>Discount Type *</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        Percentage (%)
                      </SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Value */}
            <div>
              <label className={fieldClass}>
                Discount Value *
                {watchedType === "PERCENTAGE" ? " (%)" : " (₹)"}
              </label>
              <Input
                type="number"
                step={watchedType === "PERCENTAGE" ? "1" : "0.01"}
                min={0}
                max={watchedType === "PERCENTAGE" ? 100 : undefined}
                {...register("value", {
                  required: "Value is required",
                  min: { value: 0, message: "Must be positive" },
                })}
                placeholder={watchedType === "PERCENTAGE" ? "20" : "500"}
                className={inputClass}
              />
              {errors.value && (
                <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
              )}
            </div>

            {/* Max Discount (PERCENTAGE only) */}
            {watchedType === "PERCENTAGE" && (
              <div>
                <label className={fieldClass}>Max Discount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("maxDiscount")}
                  placeholder="e.g. 500 (optional)"
                  className={inputClass}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Cap the maximum discount amount
                </p>
              </div>
            )}

            {/* Min Order */}
            <div>
              <label className={fieldClass}>
                Minimum Order Amount (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register("minOrderAmount")}
                placeholder="Optional"
                className={inputClass}
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className={fieldClass}>Total Usage Limit</label>
              <Input
                type="number"
                min={1}
                {...register("usageLimit")}
                placeholder="Unlimited if empty"
                className={inputClass}
              />
            </div>

            {/* Per User Limit */}
            <div>
              <label className={fieldClass}>Per User Limit</label>
              <Input
                type="number"
                min={1}
                {...register("perUserLimit")}
                placeholder="1"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5">
          <h2 className="font-medium text-zinc-900 text-sm border-b border-zinc-100 pb-3">
            Validity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={fieldClass}>Start Date & Time</label>
              <Input
                type="datetime-local"
                {...register("startsAt")}
                className={inputClass}
              />
              <p className="text-xs text-zinc-400 mt-1">
                Leave empty to start immediately
              </p>
            </div>
            <div>
              <label className={fieldClass}>Expiry Date & Time</label>
              <Input
                type="datetime-local"
                {...register("expiresAt")}
                className={inputClass}
              />
              <p className="text-xs text-zinc-400 mt-1">
                Leave empty for no expiry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div>
              <label className="text-sm font-medium text-zinc-700">Active</label>
              <p className="text-xs text-zinc-400">
                Inactive coupons cannot be used
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/coupons")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-zinc-900 hover:bg-zinc-800 gap-2 min-w-36"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating..." : "Create Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}

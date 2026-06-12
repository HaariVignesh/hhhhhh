"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";

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

function toDatetimeLocal(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const couponId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
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

  useEffect(() => {
    fetch(`/api/coupons/${couponId}`)
      .then((r) => r.json())
      .then((data) => {
        reset({
          code: data.code ?? "",
          description: data.description ?? "",
          type: data.type ?? "PERCENTAGE",
          value: data.value ?? "",
          minOrderAmount: data.minOrderAmount ?? "",
          maxDiscount: data.maxDiscount ?? "",
          usageLimit: data.usageLimit ?? "",
          perUserLimit: data.perUserLimit ?? 1,
          isActive: data.isActive ?? true,
          startsAt: toDatetimeLocal(data.startsAt),
          expiresAt: toDatetimeLocal(data.expiresAt),
        });
      })
      .catch(() => setError("Failed to load coupon"))
      .finally(() => setLoading(false));
  }, [couponId, reset]);

  const onSubmit = async (data: CouponForm) => {
    setSubmitting(true);
    setError(null);
    const payload = {
      ...data,
      minOrderAmount:
        data.minOrderAmount === "" ? null : Number(data.minOrderAmount),
      maxDiscount: data.maxDiscount === "" ? null : Number(data.maxDiscount),
      usageLimit: data.usageLimit === "" ? null : Number(data.usageLimit),
      startsAt: data.startsAt || null,
      expiresAt: data.expiresAt || null,
      value: Number(data.value),
    };
    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to update coupon");
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Edit Coupon</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Update coupon settings</p>
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
            <div className="md:col-span-2">
              <label className={fieldClass}>Coupon Code *</label>
              <Input
                {...register("code", { required: "Code is required" })}
                className={`${inputClass} uppercase font-mono tracking-widest`}
                onChange={(e) => setValue("code", e.target.value.toUpperCase())}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={fieldClass}>Description</label>
              <Textarea
                {...register("description")}
                rows={2}
                className="resize-none"
              />
            </div>

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
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

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
                className={inputClass}
              />
              {errors.value && (
                <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
              )}
            </div>

            {watchedType === "PERCENTAGE" && (
              <div>
                <label className={fieldClass}>Max Discount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("maxDiscount")}
                  placeholder="Optional cap"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={fieldClass}>Minimum Order Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register("minOrderAmount")}
                placeholder="Optional"
                className={inputClass}
              />
            </div>

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

            <div>
              <label className={fieldClass}>Per User Limit</label>
              <Input
                type="number"
                min={1}
                {...register("perUserLimit")}
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
            </div>
            <div>
              <label className={fieldClass}>Expiry Date & Time</label>
              <Input
                type="datetime-local"
                {...register("expiresAt")}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
            className="bg-zinc-900 hover:bg-zinc-800 gap-2 min-w-32"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

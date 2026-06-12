import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteCouponButton } from "@/components/admin/delete-coupon-button";

async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { usages: true } },
    },
  });
}

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Coupons</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {coupons.length} coupons total
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Value</th>
                <th className="px-5 py-3 text-left">Min Order</th>
                <th className="px-5 py-3 text-left">Usage</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Expiry</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-zinc-400"
                  >
                    No coupons yet.{" "}
                    <Link
                      href="/admin/coupons/new"
                      className="text-zinc-900 underline"
                    >
                      Create your first coupon
                    </Link>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired =
                    coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isUsedUp =
                    coupon.usageLimit !== null &&
                    coupon._count.usages >= coupon.usageLimit;
                  const effectivelyActive =
                    coupon.isActive && !isExpired && !isUsedUp;

                  return (
                    <tr
                      key={coupon.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 max-w-[180px] truncate">
                            {coupon.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
                          {coupon.type === "PERCENTAGE"
                            ? "Percentage"
                            : "Fixed"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">
                        {coupon.type === "PERCENTAGE"
                          ? `${coupon.value}%`
                          : `₹${Number(coupon.value).toLocaleString("en-IN")}`}
                        {coupon.maxDiscount && coupon.type === "PERCENTAGE" && (
                          <p className="text-xs text-zinc-400">
                            Max ₹
                            {Number(coupon.maxDiscount).toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {coupon.minOrderAmount
                          ? `₹${Number(coupon.minOrderAmount).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        <span
                          className={
                            isUsedUp ? "text-red-500 font-medium" : ""
                          }
                        >
                          {coupon._count.usages}
                          {coupon.usageLimit !== null
                            ? ` / ${coupon.usageLimit}`
                            : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            effectivelyActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-zinc-100 text-zinc-500 border-zinc-200"
                          }`}
                        >
                          {effectivelyActive
                            ? "Active"
                            : isExpired
                            ? "Expired"
                            : isUsedUp
                            ? "Limit Reached"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                        {coupon.expiresAt ? (
                          <span className={isExpired ? "text-red-500" : ""}>
                            {new Date(coupon.expiresAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        ) : (
                          "No expiry"
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <DeleteCouponButton
                            id={coupon.id}
                            code={coupon.code}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

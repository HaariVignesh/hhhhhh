"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
  description?: string;
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description,
}: StatsCardProps) {
  const isPositive = trend === "up";
  const hasChange = change !== undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "ml-4 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            isPositive || !hasChange
              ? "bg-indigo-50 text-indigo-600"
              : "bg-rose-50 text-rose-600"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {description && (
          <span className="text-xs text-gray-400">{description}</span>
        )}
        {!description && hasChange && (
          <span className="text-xs text-gray-400">vs last month</span>
        )}
      </div>
    </div>
  );
}

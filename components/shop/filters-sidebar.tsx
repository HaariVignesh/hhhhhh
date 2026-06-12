"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { SIZES } from "@/types";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "White", value: "white", hex: "#f5f5f5" },
  { name: "Beige", value: "beige", hex: "#F5F0E8" },
  { name: "Navy", value: "navy", hex: "#1B2A4A" },
  { name: "Olive", value: "olive", hex: "#6B7C4D" },
  { name: "Camel", value: "camel", hex: "#C9A96E" },
  { name: "Blush", value: "blush", hex: "#E8D5C4" },
  { name: "Charcoal", value: "charcoal", hex: "#2C2C2C" },
];

interface FiltersSidebarProps {
  categories: { name: string; slug: string }[];
  currentFilters: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    sort?: string;
  };
}

function AccordionSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-5">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-nue-charcoal hover:text-nue-stone transition-colors"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && <div className="pt-2">{children}</div>}
    </div>
  );
}

export default function FiltersSidebar({
  categories,
  currentFilters,
}: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.minPrice ?? 0,
    currentFilters.maxPrice ?? 10000,
  ]);

  const selectedSizes = currentFilters.sizes ?? [];
  const selectedColors = currentFilters.colors ?? [];

  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined ||
    (currentFilters.sizes && currentFilters.sizes.length > 0) ||
    (currentFilters.colors && currentFilters.colors.length > 0);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleCategoryClick = (slug: string) => {
    if (currentFilters.category === slug) {
      updateParam("category", null);
    } else {
      updateParam("category", slug);
    }
  };

  const handleSizeToggle = (size: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("sizes")?.split(",").filter(Boolean) ?? [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    if (next.length > 0) {
      params.set("sizes", next.join(","));
    } else {
      params.delete("sizes");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const handleColorToggle = (color: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("colors")?.split(",").filter(Boolean) ?? [];
    const next = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    if (next.length > 0) {
      params.set("colors", next.join(","));
    } else {
      params.delete("colors");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceCommit = (values: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values[0] > 0) {
      params.set("minPrice", values[0].toString());
    } else {
      params.delete("minPrice");
    }
    if (values[1] < 10000) {
      params.set("maxPrice", values[1].toString());
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("sizes");
    params.delete("colors");
    params.delete("page");
    setPriceRange([0, 10000]);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="sticky top-24 space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-nue-stone underline underline-offset-2 hover:text-nue-charcoal transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <AccordionSection title="Category">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={cn(
                "text-sm transition-colors hover:text-nue-charcoal",
                !currentFilters.category
                  ? "text-nue-charcoal font-medium"
                  : "text-muted-foreground"
              )}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => handleCategoryClick(cat.slug)}
                className={cn(
                  "text-sm transition-colors hover:text-nue-charcoal",
                  currentFilters.category === cat.slug
                    ? "text-nue-charcoal font-medium"
                    : "text-muted-foreground"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </AccordionSection>

      {/* Price Range */}
      <AccordionSection title="Price">
        <div className="px-1 pt-2">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={(vals) => setPriceRange(vals as [number, number])}
            onValueCommit={handlePriceCommit}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </AccordionSection>

      {/* Sizes */}
      <AccordionSection title="Size">
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={cn(
                  "border text-xs py-1.5 px-2 transition-colors font-medium tracking-wide",
                  isSelected
                    ? "border-nue-charcoal bg-nue-charcoal text-white"
                    : "border-border text-muted-foreground hover:border-nue-stone hover:text-nue-charcoal"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </AccordionSection>

      {/* Colors */}
      <AccordionSection title="Color">
        <div className="flex flex-wrap gap-2 pt-1">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.value);
            return (
              <button
                key={color.value}
                onClick={() => handleColorToggle(color.value)}
                title={color.name}
                aria-label={`Filter by ${color.name}`}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all",
                  isSelected
                    ? "border-nue-charcoal scale-110 shadow-md"
                    : "border-border hover:border-nue-stone hover:scale-105"
                )}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
        {selectedColors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {selectedColors
              .map((v) => COLORS.find((c) => c.value === v)?.name)
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </AccordionSection>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="pt-4">
          <Button
            onClick={clearAllFilters}
            variant="outline"
            size="sm"
            className="w-full text-xs tracking-widest uppercase rounded-none border-nue-charcoal text-nue-charcoal hover:bg-nue-charcoal hover:text-white"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

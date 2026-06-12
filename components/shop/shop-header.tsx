"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SortSelect from "@/components/shop/sort-select";

interface ShopHeaderProps {
  totalCount: number;
  currentCount: number;
  currentSort: string;
  page: number;
  limit: number;
}

export default function ShopHeader({
  totalCount,
  currentCount,
  currentSort,
  page,
  limit,
}: ShopHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const start = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
      <div>
        {totalCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {start}–{end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            products
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No products found</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">
          Sort by:
        </span>
        <SortSelect currentSort={currentSort} onSortChange={handleSortChange} />
      </div>
    </div>
  );
}

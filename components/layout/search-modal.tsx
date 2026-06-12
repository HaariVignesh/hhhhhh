"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useDebounce } from "@/hooks/use-debounce";
import type { ProductCard } from "@/types";

// ---------------------------------------------------------------------------
// Trending search pills
// ---------------------------------------------------------------------------
const TRENDING_SEARCHES = [
  "Linen co-ord",
  "Summer dress",
  "Silk blouse",
  "Wide leg trouser",
  "Merino knit",
  "Leather tote",
  "Minimal jewellery",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Search result card (horizontal, compact)
// ---------------------------------------------------------------------------
function ResultCard({ result, onClose }: { result: SearchResult; onClose: () => void }) {
  return (
    <Link
      href={`/products/${result.slug}`}
      onClick={onClose}
      className="flex items-center gap-4 p-3 hover:bg-muted/60 transition-colors duration-150 group"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-muted">
        <Image
          src={result.image}
          alt={result.name}
          fill
          sizes="48px"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
          {result.category}
        </p>
        <p className="text-sm text-foreground truncate leading-snug">{result.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-foreground">
            {formatPrice(result.price)}
          </span>
          {result.comparePrice && result.comparePrice > result.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(result.comparePrice)}
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// SearchModal component
// ---------------------------------------------------------------------------
export function SearchModal() {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    } else {
      // Reset state on close
      setResults([]);
      setHasSearched(false);
      setSearchQuery("");
    }
  }, [isSearchOpen, setSearchQuery]);

  // Trap scroll when open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  // Fetch results when debounced query changes
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(false);

    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(q.trim())}&limit=6`
      );
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();

      // API returns { data: ProductCard[], ... } — map to SearchResult shape
      const mapped: SearchResult[] = (json.data ?? []).map((p: ProductCard) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        image: p.images?.[0]?.url ?? "/placeholder-product.jpg",
        category: p.category?.name ?? "Product",
      }));
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    closeSearch();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  if (!isSearchOpen) return null;

  const showTrending = !searchQuery.trim();
  const showResults = !!searchQuery.trim() && hasSearched;
  const showLoading = isLoading && !!searchQuery.trim();
  const noResults = showResults && results.length === 0;

  return (
    /* Full-screen overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-[#2C2C2C]/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Panel — slides in from top */}
      <div className="w-full bg-background animate-slide-down shadow-2xl">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">

          {/* ---------------------------------------------------------------- */}
          {/* Search input row                                                  */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles, collections, categories…"
              className="
                flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/60
                focus:outline-none border-0 font-sans
              "
              autoComplete="off"
              spellCheck={false}
            />
            {showLoading && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
            )}
            {searchQuery && !showLoading && (
              <button
                onClick={() => { setSearchQuery(""); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Trending searches                                                 */}
          {/* ---------------------------------------------------------------- */}
          {showTrending && (
            <div className="pt-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans">
                  Trending now
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTrendingClick(term)}
                    className="
                      px-4 py-2 border border-border text-sm text-foreground/80
                      hover:border-[#C9A96E] hover:text-foreground
                      transition-colors duration-200 font-sans
                    "
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Search results                                                    */}
          {/* ---------------------------------------------------------------- */}
          {showResults && !noResults && (
            <div className="pt-5 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
                <Link
                  href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                  onClick={handleClose}
                  className="text-xs text-[#C9A96E] hover:text-[#b8944f] transition-colors tracking-wide"
                >
                  View all &rarr;
                </Link>
              </div>
              <div className="divide-y divide-border">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} onClose={handleClose} />
                ))}
              </div>
              {/* All-results CTA */}
              <Link
                href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                onClick={handleClose}
                className="
                  mt-4 flex items-center justify-center gap-2 py-3
                  border border-border text-sm text-foreground/80 hover:text-foreground
                  hover:border-foreground transition-colors duration-200 font-sans
                "
              >
                See all results for &ldquo;{searchQuery}&rdquo;
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* No results state                                                  */}
          {/* ---------------------------------------------------------------- */}
          {noResults && (
            <div className="pt-10 pb-4 text-center animate-fade-in">
              <p className="text-base text-foreground mb-1">
                No results for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Try a different spelling or browse our collections below.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Women", "Men", "Accessories", "New Arrivals"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop/${cat.toLowerCase().replace(" ", "-")}`}
                    onClick={handleClose}
                    className="badge-luxury hover:border-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ESC hint */}
          <p className="mt-6 text-[10px] text-muted-foreground/50 tracking-wide text-right select-none">
            Press <kbd className="px-1 py-0.5 border border-border/60 rounded text-[9px] font-sans">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import type { ProductCard } from "@/types";
import { formatPrice, calculateDiscount, getImageUrl } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";

interface ProductCardProps {
  product: ProductCard;
  /** Render optimised for a dark section background */
  dark?: boolean;
}

export default function ProductCard({ product, dark = false }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const secondaryImage = product.images.find(
    (img) => !img.isPrimary && img !== primaryImage
  );

  const [hovered, setHovered] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : undefined;
  const discount = comparePrice ? calculateDiscount(price, comparePrice) : 0;
  const isOnSale = discount > 0;

  const { toggleItem, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.id);

  // Badge priority: NEW > SALE > TRENDING
  const badge =
    product.isNewArrival
      ? ("NEW" as const)
      : isOnSale
      ? ("SALE" as const)
      : product.isTrending
      ? ("TRENDING" as const)
      : null;

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price,
        comparePrice,
        image: getImageUrl(primaryImage?.url),
        category: product.category.name,
      });
    },
    [product, price, comparePrice, primaryImage, toggleItem]
  );

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setQuickAdded(true);
      setTimeout(() => setQuickAdded(false), 1800);
    },
    []
  );

  // Color tokens that flip for dark vs light context
  const textPrimary = dark ? "text-nue-cream" : "text-nue-charcoal";
  const textMuted = dark ? "text-nue-cream/50" : "text-nue-stone";

  return (
    <article
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image block ── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-nue-cream/40"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* Primary image */}
        {primaryImage ? (
          <Image
            src={getImageUrl(primaryImage.url)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
            className={`object-cover object-center transition-all duration-700 group-hover:scale-[1.04] ${
              hovered && secondaryImage ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-nue-cream to-nue-stone/30 flex items-center justify-center">
            <ShoppingBag size={32} className="text-nue-stone/30" strokeWidth={1} />
          </div>
        )}

        {/* Secondary image — cross-fades in on hover */}
        {secondaryImage && (
          <Image
            src={getImageUrl(secondaryImage.url)}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
            className={`absolute inset-0 object-cover object-center transition-all duration-700 group-hover:scale-[1.04] ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
        )}

        {/* Subtle dark vignette on hover */}
        <div className="absolute inset-0 bg-nue-charcoal/0 group-hover:bg-nue-charcoal/10 transition-colors duration-500 pointer-events-none" />

        {/* ── Badge ── */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase font-sans font-medium ${
                badge === "SALE"
                  ? "bg-red-600 text-white"
                  : badge === "NEW"
                  ? "bg-nue-charcoal text-nue-cream"
                  : "bg-nue-gold text-white"
              }`}
            >
              {badge === "SALE" ? `-${discount}%` : badge}
            </span>
          </div>
        )}

        {/* ── Wishlist button ── */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center border transition-all duration-200 ${
            isWishlisted
              ? "bg-nue-charcoal border-nue-charcoal text-nue-cream opacity-100"
              : `bg-white/90 border-white/50 text-nue-charcoal hover:bg-nue-charcoal hover:border-nue-charcoal hover:text-nue-cream ${
                  hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                }`
          }`}
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={isWishlisted ? "fill-nue-cream" : ""}
          />
        </button>

        {/* ── Quick view button ── */}
        <Link
          href={`/products/${product.slug}`}
          className={`absolute top-[52px] right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 border border-white/50 text-nue-charcoal hover:bg-nue-charcoal hover:border-nue-charcoal hover:text-nue-cream transition-all duration-200 ${
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
          aria-label={`Quick view ${product.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={14} strokeWidth={1.5} />
        </Link>

        {/* ── Quick Add to Cart — slides up from bottom ── */}
        <button
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 py-3.5 text-xs tracking-[0.18em] uppercase font-sans font-medium transform transition-all duration-300 ease-out ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          } ${
            quickAdded
              ? "bg-nue-gold text-white"
              : "bg-nue-charcoal text-nue-cream hover:bg-nue-gold"
          }`}
        >
          {quickAdded ? (
            <>
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/25 text-[10px]">
                ✓
              </span>
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={13} strokeWidth={1.8} />
              Quick Add
            </>
          )}
        </button>
      </Link>

      {/* ── Product info ── */}
      <Link
        href={`/products/${product.slug}`}
        className="pt-4 pb-1 flex flex-col gap-1"
      >
        {/* Category */}
        <p className={`text-[10px] tracking-[0.25em] uppercase font-sans ${textMuted}`}>
          {product.category.name}
        </p>

        {/* Name */}
        <h3
          className={`text-sm font-sans font-medium leading-snug line-clamp-2 ${textPrimary} group-hover:${textMuted} transition-colors duration-200`}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="mt-1.5 flex items-center gap-2.5 flex-wrap">
          <span className={`text-sm font-sans font-medium ${textPrimary}`}>
            {formatPrice(price)}
          </span>
          {comparePrice && isOnSale && (
            <>
              <span className={`text-xs font-sans line-through ${textMuted}`}>
                {formatPrice(comparePrice)}
              </span>
              <span className="text-[10px] font-sans text-red-500 font-medium">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}

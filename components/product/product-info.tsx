"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { ProductWithRelations } from "@/types";
import { formatPrice, calculateDiscount, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductWithRelations;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={star <= Math.round(rating) ? 0 : 1.5}
          className={cn(
            "text-nue-gold",
            size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"
          )}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3.5 text-sm font-medium tracking-wide text-nue-charcoal hover:text-nue-stone transition-colors"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem, openCart, hasItem } = useCart();
  const { toggleItem, hasItem: isWishlisted } = useWishlist();

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : undefined;
  const discount = comparePrice ? calculateDiscount(price, comparePrice) : 0;

  // Group variants by color
  const colorGroups = useMemo(() => {
    const groups: Record<string, { color: string; colorHex?: string | null }> = {};
    product.variants.forEach((v) => {
      if (v.color && !groups[v.color]) {
        groups[v.color] = { color: v.color, colorHex: v.colorHex };
      }
    });
    return Object.values(groups);
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colorGroups[0]?.color
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Available sizes for selected color
  const availableSizes = useMemo(() => {
    return product.variants
      .filter(
        (v) =>
          v.isActive &&
          (!selectedColor || v.color === selectedColor || !v.color) &&
          v.size
      )
      .reduce<{ size: string; stock: number }[]>((acc, v) => {
        if (v.size && !acc.find((s) => s.size === v.size)) {
          acc.push({ size: v.size, stock: v.stock });
        }
        return acc;
      }, []);
  }, [product.variants, selectedColor]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) =>
        v.isActive &&
        (!selectedColor || v.color === selectedColor) &&
        (!selectedSize || v.size === selectedSize)
    );
  }, [product.variants, selectedColor, selectedSize]);

  const effectivePrice = selectedVariant?.price
    ? Number(selectedVariant.price)
    : price;

  const stockCount = selectedVariant?.stock ?? product.totalStock;
  const isOutOfStock = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id: selectedVariant?.id ?? product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: getImageUrl(primaryImage?.url),
      size: selectedVariant?.size ?? selectedSize,
      color: selectedVariant?.color ?? selectedColor,
      colorHex: selectedVariant?.colorHex ?? undefined,
      quantity,
      stock: stockCount,
    });

    setAddedToCart(true);
    openCart();
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
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
  };

  const handleShare = (platform: "twitter" | "facebook" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (platform === "copy") {
      navigator.clipboard.writeText(url).catch(() => {});
      return;
    }
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground tracking-wide">
        <Link href="/shop" className="hover:text-nue-charcoal transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-nue-charcoal transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-nue-charcoal">{product.name}</span>
      </nav>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isNewArrival && (
          <Badge className="bg-nue-charcoal text-white text-[10px] px-2 py-0.5 rounded-none tracking-widest uppercase">
            New Arrival
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge className="bg-nue-gold text-white text-[10px] px-2 py-0.5 rounded-none tracking-widest uppercase">
            Best Seller
          </Badge>
        )}
        {product.isTrending && (
          <Badge className="bg-nue-stone text-white text-[10px] px-2 py-0.5 rounded-none tracking-widest uppercase">
            Trending
          </Badge>
        )}
      </div>

      {/* Name */}
      <h1 className="font-serif text-display-sm lg:text-display-md text-nue-charcoal leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={product.avgRating} />
          <a
            href="#reviews"
            className="text-sm text-muted-foreground hover:text-nue-charcoal transition-colors"
          >
            {product.avgRating.toFixed(1)} ({product.reviewCount}{" "}
            {product.reviewCount === 1 ? "review" : "reviews"})
          </a>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-medium text-nue-charcoal">
          {formatPrice(effectivePrice)}
        </span>
        {comparePrice && comparePrice > effectivePrice && (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(comparePrice)}
            </span>
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs px-2 py-0.5 rounded-sm font-medium">
              {discount}% OFF
            </Badge>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Color Selector */}
      {colorGroups.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-2.5">
            Color:{" "}
            <span className="font-normal normal-case tracking-normal text-muted-foreground">
              {selectedColor || "Select"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorGroups.map(({ color, colorHex }) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize(undefined);
                }}
                title={color}
                aria-label={`Color: ${color}`}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  selectedColor === color
                    ? "border-nue-charcoal scale-110 shadow-md"
                    : "border-border hover:border-nue-stone hover:scale-105"
                )}
                style={{ backgroundColor: colorHex || color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
              Size:{" "}
              <span className="font-normal normal-case tracking-normal text-muted-foreground">
                {selectedSize || "Select"}
              </span>
            </p>
            <button className="text-xs text-muted-foreground underline underline-offset-2 hover:text-nue-charcoal transition-colors">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(({ size, stock }) => {
              const outOfStock = stock === 0;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && setSelectedSize(size)}
                  disabled={outOfStock}
                  className={cn(
                    "min-w-[44px] h-10 px-3 border text-sm font-medium transition-colors",
                    outOfStock
                      ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                      : selectedSize === size
                      ? "border-nue-charcoal bg-nue-charcoal text-white"
                      : "border-border text-nue-charcoal hover:border-nue-stone"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Indicator */}
      {selectedVariant && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isOutOfStock
                ? "bg-red-500"
                : isLowStock
                ? "bg-amber-500"
                : "bg-green-500"
            )}
          />
          <span
            className={cn(
              "text-xs",
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                ? "text-amber-600"
                : "text-green-600"
            )}
          >
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
              ? `Only ${stockCount} left in stock`
              : "In stock"}
          </span>
        </div>
      )}

      {/* Quantity Stepper */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
            Qty:
          </p>
          <div className="flex items-center border border-border rounded-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-nue-charcoal hover:bg-muted transition-colors disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="w-10 text-center text-sm font-medium text-nue-charcoal">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
              disabled={quantity >= stockCount}
              className="w-9 h-9 flex items-center justify-center text-nue-charcoal hover:bg-muted transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "flex-1 h-12 rounded-none text-sm tracking-widest uppercase transition-all",
            addedToCart
              ? "bg-green-600 hover:bg-green-600 text-white"
              : "bg-nue-charcoal hover:bg-nue-stone text-white"
          )}
        >
          {isOutOfStock
            ? "Out of Stock"
            : addedToCart
            ? "Added to Cart"
            : "Add to Cart"}
        </Button>

        <button
          onClick={handleWishlistToggle}
          aria-label={
            isWishlisted(product.id)
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="w-12 h-12 border border-border hover:border-nue-charcoal flex items-center justify-center transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            fill={isWishlisted(product.id) ? "currentColor" : "none"}
            className={cn(
              "w-5 h-5 transition-colors",
              isWishlisted(product.id)
                ? "text-red-500"
                : "text-nue-charcoal group-hover:text-red-400"
            )}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.tags.map((tag) => (
            <Link
              key={tag}
              href={`/shop?search=${encodeURIComponent(tag)}`}
              className="text-xs text-muted-foreground border border-border px-2 py-1 hover:border-nue-stone hover:text-nue-charcoal transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Product Details Accordion */}
      <div className="border-t border-border pt-4">
        {product.material && (
          <AccordionItem title="Material">
            <p>{product.material}</p>
          </AccordionItem>
        )}

        {product.careInstructions && (
          <AccordionItem title="Care Instructions">
            <p>{product.careInstructions}</p>
          </AccordionItem>
        )}

        <AccordionItem title="Delivery & Returns">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mt-0.5 text-nue-stone shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              Free shipping on orders above ₹999
            </li>
            <li className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mt-0.5 text-nue-stone shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Easy 30-day returns
            </li>
            <li className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mt-0.5 text-nue-stone shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Estimated delivery: 5–7 business days
            </li>
          </ul>
        </AccordionItem>
      </div>

      {/* Social Share */}
      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Share:
        </span>
        <button
          onClick={() => handleShare("twitter")}
          className="text-muted-foreground hover:text-nue-charcoal transition-colors"
          aria-label="Share on Twitter / X"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
        <button
          onClick={() => handleShare("facebook")}
          className="text-muted-foreground hover:text-nue-charcoal transition-colors"
          aria-label="Share on Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
        <button
          onClick={() => handleShare("copy")}
          className="text-muted-foreground hover:text-nue-charcoal transition-colors"
          aria-label="Copy link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

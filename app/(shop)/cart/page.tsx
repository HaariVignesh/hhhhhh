"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, Tag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import type { CouponValidation } from "@/types";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const GST_RATE = 0.18;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotalAmount = subtotal();
  const discount = coupon?.discount ?? 0;
  const afterDiscount = subtotalAmount - discount;
  const shippingCost = afterDiscount > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = afterDiscount * GST_RATE;
  const total = afterDiscount + shippingCost + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCoupon(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal: subtotalAmount }),
      });
      const body: CouponValidation = await res.json();

      if (!res.ok || !body.valid) {
        setCouponError(body.message || "Invalid or expired coupon code.");
        return;
      }

      setCoupon(body);
    } catch {
      setCouponError("Unable to apply coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-nue-cream flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-nue-stone" strokeWidth={1.2} />
        </div>
        <h1 className="text-3xl font-serif text-nue-charcoal mb-3">Your cart is empty</h1>
        <p className="text-sm text-nue-stone mb-8 max-w-xs leading-relaxed">
          Looks like you haven&apos;t added anything yet. Explore our collections and find
          something you love.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">Shopping Bag</h1>
          <p className="text-sm text-nue-stone mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* ── Left: Cart Items ── */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b border-nue-charcoal/8 last:border-0"
              >
                {/* Image */}
                <div className="relative w-20 h-28 shrink-0 bg-nue-cream overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-nue-charcoal hover:text-nue-gold transition-colors leading-snug line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center text-nue-stone hover:text-nue-charcoal hover:bg-nue-cream transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    {item.size && (
                      <span className="text-xs text-nue-stone">Size: {item.size}</span>
                    )}
                    {item.color && (
                      <span className="text-xs text-nue-stone">Color: {item.color}</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-nue-charcoal/15">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-nue-charcoal hover:bg-nue-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm text-nue-charcoal font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-nue-charcoal hover:bg-nue-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-nue-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-nue-stone">{formatPrice(item.price)} each</p>
                      )}
                    </div>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Only {item.stock} in stock
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Subtotal under items */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-nue-stone">
                Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
              <span className="text-base font-medium text-nue-charcoal">
                {formatPrice(subtotalAmount)}
              </span>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-nue-stone hover:text-nue-charcoal transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="mt-10 lg:mt-0">
            <div className="bg-white border border-nue-charcoal/8 p-6 space-y-6 sticky top-24">
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="space-y-2">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{coupon.code}</span>
                      <span className="text-xs text-green-600">
                        -{formatPrice(coupon.discount)} off
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/50 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2.5 bg-nue-charcoal text-white text-xs tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-nue-charcoal/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotalAmount)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-nue-charcoal/70">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {afterDiscount <= SHIPPING_THRESHOLD && (
                  <p className="text-xs text-nue-stone">
                    Add {formatPrice(SHIPPING_THRESHOLD - afterDiscount)} more for free shipping
                  </p>
                )}

                <div className="flex justify-between text-nue-charcoal/70">
                  <span>Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="pt-3 border-t border-nue-charcoal/8 flex justify-between font-medium text-nue-charcoal text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full text-center px-6 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="block w-full text-center text-sm text-nue-stone hover:text-nue-charcoal transition-colors py-1"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-2 border-t border-nue-charcoal/8">
                <p className="text-xs text-nue-stone text-center">
                  Secure checkout · Free returns · COD available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

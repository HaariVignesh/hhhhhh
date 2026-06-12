"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, getImageUrl } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const count = itemCount();
  const total = subtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background border-l border-nue-charcoal/10"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-nue-charcoal/8 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-nue-charcoal" strokeWidth={1.5} />
            <SheetTitle className="font-serif text-lg text-nue-charcoal tracking-tight">
              Shopping Bag
            </SheetTitle>
            {count > 0 && (
              <span className="bg-nue-charcoal text-nue-cream text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-nue-stone hover:text-nue-charcoal hover:bg-nue-cream transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-nue-cream flex items-center justify-center mb-5">
                {/* Empty bag SVG icon */}
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  className="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 20h32l-4 28H20L16 20z"
                    stroke="#8C7B6B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 20c0-4.4 3.6-8 8-8s8 3.6 8 8"
                    stroke="#8C7B6B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-serif text-lg text-nue-charcoal mb-2">Your bag is empty</p>
              <p className="text-sm text-nue-stone mb-6 max-w-xs leading-relaxed">
                Add pieces you love and they&apos;ll appear here.
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center px-6 py-2.5 bg-nue-charcoal text-white text-xs tracking-widest uppercase hover:bg-nue-gold transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            /* Items list */
            <div className="divide-y divide-nue-charcoal/6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3.5 p-5">
                  {/* Image */}
                  <div className="relative w-16 h-20 shrink-0 bg-nue-cream overflow-hidden">
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-nue-charcoal hover:text-nue-gold transition-colors line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 w-5 h-5 flex items-center justify-center text-nue-stone/50 hover:text-nue-charcoal transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Size / color */}
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {item.size && (
                        <span className="text-[10px] text-nue-stone">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-[10px] text-nue-stone">Color: {item.color}</span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center border border-nue-charcoal/15">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-nue-charcoal hover:bg-nue-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Decrease"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-8 text-center text-xs text-nue-charcoal font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center text-nue-charcoal hover:bg-nue-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <p className="text-sm font-medium text-nue-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-nue-charcoal/8 p-5 space-y-4 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-nue-stone">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </span>
              <span className="font-semibold text-nue-charcoal">{formatPrice(total)}</span>
            </div>
            <p className="text-[10px] text-nue-stone">Shipping & taxes calculated at checkout.</p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full text-center px-4 py-3.5 bg-nue-charcoal text-white text-xs font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full text-center px-4 py-3 border border-nue-charcoal/20 text-nue-charcoal text-xs font-medium tracking-widest uppercase hover:bg-nue-cream transition-colors duration-200"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

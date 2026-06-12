"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; images: { url: string; isPrimary: boolean }[] };
  variant?: { size?: string; color?: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

function AnimatedCheckmark() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" fill="none" className="w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#2C2C2C"
            strokeWidth="3"
            fill="none"
            strokeDasharray="276"
            strokeDashoffset="276"
            style={{
              animation: "stroke-fill 0.6s ease-out 0.1s forwards",
            }}
          />
          <polyline
            points="28,50 42,64 68,36"
            stroke="#C9A96E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{
              animation: "stroke-fill 0.4s ease-out 0.7s forwards",
            }}
          />
        </svg>
      </div>
      <style>{`
        @keyframes stroke-fill {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  const cartCleared = useRef(false);

  useEffect(() => {
    if (!cartCleared.current) {
      clearCart();
      cartCleared.current = true;
    }
  }, [clearCart]);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Unable to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Estimated delivery: 5–7 days from now
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16 max-w-2xl">
        {/* Animated checkmark */}
        <AnimatedCheckmark />

        {/* Hero text */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-nue-charcoal tracking-tight mb-2">
            Order Confirmed!
          </h1>
          {order ? (
            <>
              <p className="text-nue-stone text-sm mb-1">
                Order <span className="font-medium text-nue-charcoal">{order.orderNumber}</span>
              </p>
              <p className="text-nue-stone text-sm">
                Placed on {formatDate(order.createdAt)}
              </p>
            </>
          ) : (
            <p className="text-nue-stone text-sm">
              Thank you for your purchase. You'll receive a confirmation email shortly.
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 bg-nue-cream border border-nue-charcoal/8 px-4 py-2 text-sm text-nue-stone">
            <Package className="w-4 h-4 text-nue-gold" />
            Estimated delivery by{" "}
            <span className="font-medium text-nue-charcoal">
              {estimatedDelivery.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>

        {/* Order details */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm text-center">
            {error}
          </div>
        ) : order ? (
          <div className="bg-white border border-nue-charcoal/8 p-6 space-y-6">
            {/* Items */}
            <div>
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-4">
                Items Ordered
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const img = item.product.images.find((i) => i.isPrimary) || item.product.images[0];
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      {img ? (
                        <div className="relative w-14 h-18 shrink-0 bg-nue-cream overflow-hidden">
                          <Image
                            src={img.url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-18 bg-nue-cream shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-nue-charcoal font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-nue-stone">
                          {[item.variant?.size, item.variant?.color].filter(Boolean).join(" · ")}{" "}
                          · Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-nue-charcoal shrink-0">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="pt-4 border-t border-nue-charcoal/8">
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-3">
                  Shipping To
                </h2>
                <p className="text-sm text-nue-charcoal">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-sm text-nue-stone">
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-nue-charcoal/8 flex justify-between font-semibold text-nue-charcoal">
              <span>Order Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/profile/orders"
            className="flex-1 text-center px-6 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="flex-1 text-center px-6 py-3.5 border border-nue-charcoal/20 text-nue-charcoal text-sm font-medium tracking-widest uppercase hover:bg-nue-cream transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="text-center text-xs text-nue-stone mt-6">
          Questions? Email us at{" "}
          <a
            href="mailto:hello@nueclothing.com"
            className="text-nue-gold hover:text-nue-charcoal transition-colors"
          >
            hello@nueclothing.com
          </a>
        </p>
      </div>
    </div>
  );
}

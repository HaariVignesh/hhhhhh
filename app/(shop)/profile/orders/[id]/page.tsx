"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; slug: string; images: { url: string; isPrimary: boolean }[] };
  variant?: { size?: string; color?: string } | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode?: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment?: {
    method: string;
    last4?: string;
    amount: number;
    status: string;
  } | null;
  items: OrderItem[];
}

const ORDER_STATUSES = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Processing", className: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "Shipped", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  RETURNED: { label: "Returned", className: "bg-gray-100 text-gray-600" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
};

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const isCancelled = currentStatus === "CANCELLED";
  const currentIdx = ORDER_STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative flex items-start gap-0">
      {ORDER_STATUSES.map((step, idx) => {
        const isCompleted = !isCancelled && idx <= currentIdx;
        const isCurrent = !isCancelled && idx === currentIdx;
        const isLast = idx === ORDER_STATUSES.length - 1;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                  isCompleted && !isCancelled && idx < currentIdx
                    ? "bg-nue-charcoal"
                    : "bg-nue-charcoal/12"
                }`}
              />
            )}

            {/* Dot */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCancelled
                  ? "border-nue-charcoal/15 bg-white"
                  : isCompleted
                  ? isCurrent
                    ? "border-nue-gold bg-nue-gold"
                    : "border-nue-charcoal bg-nue-charcoal"
                  : "border-nue-charcoal/15 bg-white"
              }`}
            >
              {!isCancelled && isCompleted && !isCurrent && (
                <Check className="w-3.5 h-3.5 text-white" />
              )}
              {!isCancelled && isCurrent && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            <p
              className={`mt-2 text-[10px] tracking-widest uppercase text-center transition-colors ${
                isCancelled
                  ? "text-nue-stone/40"
                  : isCurrent
                  ? "text-nue-gold font-medium"
                  : isCompleted
                  ? "text-nue-charcoal font-medium"
                  : "text-nue-stone"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user || !orderId) return;

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
  }, [session, orderId]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelError(null);
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCancelError(body.message || "Unable to cancel order.");
        return;
      }
      setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
    } catch {
      setCancelError("Unable to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12 max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error || "Order not found."}
          </div>
          <Link href="/profile/orders" className="inline-flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal mt-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-600" };
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? { label: order.paymentStatus, className: "bg-gray-100 text-gray-600" };
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal transition-colors mb-8"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>

        {/* Order header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif text-nue-charcoal tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-nue-stone mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs tracking-widest uppercase px-3 py-1 ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
            <span className={`text-xs tracking-widest uppercase px-3 py-1 ${paymentCfg.className}`}>
              {paymentCfg.label}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          {order.status !== "CANCELLED" && (
            <div className="bg-white border border-nue-charcoal/8 p-6">
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-6">
                Order Status
              </h2>
              <StatusTimeline currentStatus={order.status} />
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700">
              <X className="w-4 h-4 shrink-0" />
              <p className="text-sm">This order has been cancelled.</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-nue-charcoal/8 p-6">
            <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-5">
              Items Ordered
            </h2>
            <div className="space-y-5">
              {order.items.map((item) => {
                const img = item.product.images.find((i) => i.isPrimary) || item.product.images[0];
                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative w-16 h-20 shrink-0 bg-nue-cream overflow-hidden">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-nue-cream" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium text-nue-charcoal hover:text-nue-gold transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-nue-stone mt-1">
                        {[item.variant?.size, item.variant?.color].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-xs text-nue-stone">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-nue-charcoal shrink-0">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="mt-6 pt-5 border-t border-nue-charcoal/8 space-y-2.5 text-sm">
              <div className="flex justify-between text-nue-charcoal/70">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-nue-charcoal/70">
                <span>Shipping</span>
                <span>
                  {Number(order.shippingCost) === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(Number(order.shippingCost))
                  )}
                </span>
              </div>
              <div className="flex justify-between text-nue-charcoal/70">
                <span>Tax (GST)</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
              <div className="pt-3 border-t border-nue-charcoal/8 flex justify-between font-semibold text-nue-charcoal text-base">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border border-nue-charcoal/8 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-nue-stone" />
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
                Shipping Address
              </h2>
            </div>
            <div className="text-sm text-nue-charcoal space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-nue-stone">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-nue-stone">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-nue-stone">
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-nue-stone">{order.shippingAddress.country}</p>
              <p className="text-nue-stone mt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment info */}
          {order.payment && (
            <div className="bg-white border border-nue-charcoal/8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-nue-stone" />
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
                  Payment
                </h2>
              </div>
              <div className="text-sm text-nue-stone space-y-1">
                <p>
                  Method:{" "}
                  <span className="text-nue-charcoal capitalize">
                    {order.payment.method.replace(/_/g, " ").toLowerCase()}
                  </span>
                </p>
                {order.payment.last4 && (
                  <p>
                    Card ending in{" "}
                    <span className="text-nue-charcoal font-medium">{order.payment.last4}</span>
                  </p>
                )}
                <p>
                  Amount paid:{" "}
                  <span className="text-nue-charcoal font-medium">
                    {formatPrice(Number(order.payment.amount))}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Cancel order */}
          {canCancel && (
            <div className="bg-white border border-nue-charcoal/8 p-6">
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-3">
                Cancel Order
              </h2>
              <p className="text-sm text-nue-stone mb-4">
                You can cancel this order while it&apos;s still pending or confirmed. Once
                processing begins, cancellation may not be possible.
              </p>

              {cancelError && (
                <div className="mb-3 flex items-start gap-1.5 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {cancelError}
                </div>
              )}

              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

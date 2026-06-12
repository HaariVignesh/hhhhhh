"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ChevronRight, ChevronLeft } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  items: { id: string }[];
}

const ORDERS_PER_PAGE = 10;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Processing", className: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "Shipped", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  RETURNED: { label: "Returned", className: "bg-gray-100 text-gray-600" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / ORDERS_PER_PAGE);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders?page=${page}&limit=${ORDERS_PER_PAGE}`
        );
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
          setTotal(data.length);
        } else {
          setOrders(data.data ?? []);
          setTotal(data.total ?? 0);
        }
      } catch {
        setError("Unable to load your orders. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, page]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/profile"
            className="text-nue-stone hover:text-nue-charcoal transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">My Orders</h1>
            {!isLoading && (
              <p className="text-sm text-nue-stone mt-0.5">
                {total} {total === 1 ? "order" : "orders"}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-nue-cream flex items-center justify-center mb-6">
              <Package className="w-9 h-9 text-nue-stone" strokeWidth={1.2} />
            </div>
            <h2 className="text-2xl font-serif text-nue-charcoal mb-3">No orders yet</h2>
            <p className="text-sm text-nue-stone mb-6 max-w-xs">
              You haven&apos;t placed any orders yet. Start shopping and they&apos;ll appear here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-3 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] ?? {
                  label: order.status,
                  className: "bg-gray-100 text-gray-600",
                };
                return (
                  <Link
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="group flex items-center gap-4 p-5 bg-white border border-nue-charcoal/8 hover:border-nue-charcoal/30 transition-colors"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-nue-cream shrink-0">
                      <Package className="w-5 h-5 text-nue-stone" strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-nue-charcoal">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-nue-stone mt-0.5">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-nue-charcoal">
                        {formatPrice(Number(order.total))}
                      </span>
                      <ChevronRight className="w-4 h-4 text-nue-stone group-hover:text-nue-charcoal transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-nue-charcoal/8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm transition-colors ${
                        p === page
                          ? "bg-nue-charcoal text-white"
                          : "text-nue-stone hover:text-nue-charcoal hover:bg-nue-cream"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

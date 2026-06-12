"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  ChevronRight,
  Loader2,
  Package,
  Calendar,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  items: { id: string; product: { name: string; images: { url: string; isPrimary: boolean }[] } }[];
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Processing", className: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "Shipped", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const NAV_CARDS = [
  {
    href: "/profile/orders",
    icon: ShoppingBag,
    label: "My Orders",
    description: "Track and manage orders",
  },
  {
    href: "/profile/addresses",
    icon: MapPin,
    label: "Addresses",
    description: "Saved shipping addresses",
  },
  {
    href: "/wishlist",
    icon: Heart,
    label: "Wishlist",
    description: "Items you're saving for later",
  },
  {
    href: "/profile/settings",
    icon: Settings,
    label: "Settings",
    description: "Profile and password",
  },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes, addressesRes] = await Promise.allSettled([
          fetch("/api/orders?limit=3"),
          fetch("/api/wishlist"),
          fetch("/api/user/addresses"),
        ]);

        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          const list: Order[] = Array.isArray(data) ? data : data.data ?? [];
          setOrders(list.slice(0, 3));
          setStats((s) => ({ ...s, orders: Array.isArray(data) ? data.length : data.total ?? 0 }));
        }

        if (wishlistRes.status === "fulfilled" && wishlistRes.value.ok) {
          const data = await wishlistRes.value.json();
          setStats((s) => ({ ...s, wishlist: Array.isArray(data) ? data.length : 0 }));
        }

        if (addressesRes.status === "fulfilled" && addressesRes.value.ok) {
          const data = await addressesRes.value.json();
          setStats((s) => ({ ...s, addresses: Array.isArray(data) ? data.length : 0 }));
        }
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const memberSince = user.createdAt
    ? formatDate(user.createdAt as string)
    : "Member";

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        {/* Profile header */}
        <div className="flex items-center gap-6 mb-10 p-6 bg-white border border-nue-charcoal/8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-nue-cream shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "Profile"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-nue-charcoal text-nue-cream text-2xl font-serif">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-serif text-nue-charcoal truncate">{user.name || "NUE Member"}</h1>
            <p className="text-sm text-nue-stone truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-nue-stone">
              <Calendar className="w-3.5 h-3.5" />
              <span>{memberSince}</span>
            </div>
          </div>
          <Link
            href="/profile/settings"
            className="shrink-0 p-2.5 border border-nue-charcoal/12 text-nue-stone hover:text-nue-charcoal hover:border-nue-charcoal/30 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Orders", value: stats.orders },
            { label: "Wishlist", value: stats.wishlist },
            { label: "Addresses", value: stats.addresses },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-nue-charcoal/8 p-5 text-center"
            >
              <p className="text-2xl font-serif text-nue-charcoal">{stat.value}</p>
              <p className="text-xs tracking-widest uppercase text-nue-stone mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick nav cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-center gap-4 p-5 bg-white border border-nue-charcoal/8 hover:border-nue-charcoal/30 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-nue-cream group-hover:bg-nue-charcoal group-hover:text-nue-cream transition-colors">
                <card.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nue-charcoal">{card.label}</p>
                <p className="text-xs text-nue-stone">{card.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-nue-stone group-hover:text-nue-charcoal transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
              Recent Orders
            </h2>
            <Link
              href="/profile/orders"
              className="text-xs text-nue-gold hover:text-nue-charcoal transition-colors"
            >
              View all →
            </Link>
          </div>

          {isLoadingOrders ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-nue-stone" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-nue-charcoal/8 p-8 text-center">
              <Package className="w-10 h-10 text-nue-stone mx-auto mb-3" strokeWidth={1.2} />
              <p className="text-sm text-nue-stone">No orders yet.</p>
              <Link
                href="/shop"
                className="inline-block mt-3 text-xs text-nue-gold hover:text-nue-charcoal transition-colors"
              >
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] ?? {
                  label: order.status,
                  className: "bg-gray-100 text-gray-600",
                };
                return (
                  <Link
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-nue-charcoal/8 hover:border-nue-charcoal/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-nue-charcoal">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-nue-stone mt-0.5">
                        {formatDate(order.createdAt)} · {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-nue-charcoal">
                        {formatPrice(Number(order.total))}
                      </p>
                      <ChevronRight className="w-4 h-4 text-nue-stone group-hover:text-nue-charcoal transition-colors ml-auto mt-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

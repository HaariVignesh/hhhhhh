import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  Tag,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: "₹4,82,500",
    change: 12.5,
    icon: TrendingUp,
    trend: "up" as const,
    description: "vs last month",
  },
  {
    title: "Total Orders",
    value: "1,284",
    change: 8.2,
    icon: ShoppingBag,
    trend: "up" as const,
    description: "vs last month",
  },
  {
    title: "Total Customers",
    value: "892",
    change: 5.1,
    icon: Users,
    trend: "up" as const,
    description: "vs last month",
  },
  {
    title: "Active Products",
    value: "156",
    change: -2.4,
    icon: Package,
    trend: "down" as const,
    description: "vs last month",
  },
];

const recentOrders = [
  {
    id: "NUE-1284",
    customer: "Priya Sharma",
    email: "priya@example.com",
    date: "2026-06-12",
    items: 3,
    total: "₹8,450",
    paymentStatus: "PAID",
    orderStatus: "PROCESSING",
  },
  {
    id: "NUE-1283",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    date: "2026-06-11",
    items: 1,
    total: "₹2,200",
    paymentStatus: "PAID",
    orderStatus: "SHIPPED",
  },
  {
    id: "NUE-1282",
    customer: "Ananya Singh",
    email: "ananya@example.com",
    date: "2026-06-11",
    items: 2,
    total: "₹5,600",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
  },
  {
    id: "NUE-1281",
    customer: "Karan Mehta",
    email: "karan@example.com",
    date: "2026-06-10",
    items: 4,
    total: "₹12,800",
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
  },
  {
    id: "NUE-1280",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    date: "2026-06-10",
    items: 1,
    total: "₹1,950",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
};

const quickLinks = [
  {
    label: "Add Product",
    href: "/admin/products/new",
    icon: Package,
    color: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  {
    label: "View Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    color: "bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    label: "Create Coupon",
    href: "/admin/coupons/new",
    icon: Tag,
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening with NUE today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Recent Orders</h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Total</th>
                  <th className="text-left px-5 py-3 font-medium">Payment</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-zinc-900">
                      #{order.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-zinc-900 font-medium text-xs">
                        {order.customer}
                      </div>
                      <div className="text-zinc-400 text-xs">{order.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-zinc-900">
                      {order.total}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          statusColors[order.paymentStatus]
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          statusColors[order.orderStatus]
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${link.color}`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">
                      {link.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-900">Top Products</h2>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: "Linen Co-ord Set", sales: 48, revenue: "₹96,000" },
                { name: "Silk Kurta – Ivory", sales: 35, revenue: "₹70,000" },
                { name: "Cotton Palazzo", sales: 31, revenue: "₹46,500" },
                { name: "Embroidered Dupatta", sales: 29, revenue: "₹43,500" },
                { name: "Block Print Anarkali", sales: 24, revenue: "₹72,000" },
              ].map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-300 w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {product.sales} sold
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {product.revenue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue summary */}
          <div className="bg-zinc-900 rounded-xl p-5 text-white">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">
              This Month
            </p>
            <p className="text-3xl font-bold mt-1">₹84,200</p>
            <div className="flex items-center gap-1 mt-1 text-green-400 text-xs">
              <ArrowUpRight className="h-3 w-3" />
              <span>12.5% vs last month</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-zinc-400">Orders</p>
                <p className="text-lg font-semibold">284</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Avg Order</p>
                <p className="text-lg font-semibold">₹2,965</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

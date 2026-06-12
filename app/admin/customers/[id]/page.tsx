import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";

async function getCustomer(id: string) {
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: { select: { id: true } },
        },
      },
      addresses: true,
    },
  });
  return customer;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  const paidOrders = customer.orders.filter((o) => o.paymentStatus === "PAID");
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue =
    paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {customer.name ?? "Customer"}
          </h1>
          <p className="text-sm text-zinc-500">{customer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profile + Stats */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-semibold">
                {getInitials(customer.name)}
              </div>
              <h2 className="mt-3 font-semibold text-zinc-900 text-lg">
                {customer.name ?? "—"}
              </h2>
              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                {customer.role}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <a
                  href={`mailto:${customer.email}`}
                  className="hover:text-zinc-900 transition-colors truncate"
                >
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2.5 text-zinc-600">
                  <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                  {customer.phone}
                </div>
              )}
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Calendar className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                Member since{" "}
                {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Total Orders</span>
                <span className="font-bold text-zinc-900 text-lg">
                  {customer.orders.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Total Spent</span>
                <span className="font-bold text-zinc-900">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Avg. Order Value</span>
                <span className="font-semibold text-zinc-700">
                  ₹{avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
              <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-500" />
                Saved Addresses
              </h3>
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 space-y-0.5"
                  >
                    {addr.isDefault && (
                      <span className="inline-block bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded-full mb-1">
                        Default
                      </span>
                    )}
                    <p className="font-medium text-zinc-900">
                      {addr.fullName}
                    </p>
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-zinc-500" />
              <h2 className="font-semibold text-zinc-900">
                Recent Orders ({customer.orders.length})
              </h2>
            </div>
            {customer.orders.length === 0 ? (
              <div className="px-5 py-16 text-center text-zinc-400 text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">Order</th>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Items</th>
                      <th className="px-5 py-3 text-left">Total</th>
                      <th className="px-5 py-3 text-left">Payment</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-medium text-zinc-900">
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-600">
                          {order.items.length}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          ₹{Number(order.total).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-5 py-3.5">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

type SearchParams = {
  search?: string;
  page?: string;
  status?: string;
  paymentStatus?: string;
};

const PAGE_SIZE = 20;

async function getOrders(params: SearchParams) {
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status as OrderStatus | undefined;
  const paymentStatus = params.paymentStatus as PaymentStatus | undefined;

  const where = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
                ],
              },
            },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, totalCount, page };
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { orders, totalCount, page } = await getOrders(searchParams);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const search = searchParams.search ?? "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{totalCount} orders total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              name="search"
              placeholder="Search by order # or customer..."
              defaultValue={search}
              className="pl-9 h-9"
            />
          </div>
          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="h-9 px-3 rounded-md border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
          >
            <option value="">All Order Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            name="paymentStatus"
            defaultValue={searchParams.paymentStatus ?? ""}
            className="h-9 px-3 rounded-md border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
          >
            <option value="">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <Button type="submit" size="sm" variant="outline">
            Filter
          </Button>
          {(search || searchParams.status || searchParams.paymentStatus) && (
            <Link href="/admin/orders">
              <Button size="sm" variant="ghost" className="text-zinc-500">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Order #</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Payment</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-zinc-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-medium text-zinc-900 text-xs">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-zinc-900 text-xs">
                          {order.user?.name ?? "Guest"}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/orders?search=${search}&status=${searchParams.status ?? ""}&page=${page - 1}`}
                >
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/orders?search=${search}&status=${searchParams.status ?? ""}&page=${page + 1}`}
                >
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

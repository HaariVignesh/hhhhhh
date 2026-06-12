import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchParams = {
  search?: string;
  page?: string;
};

const PAGE_SIZE = 20;

async function getCustomers(params: SearchParams) {
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";

  const where = {
    role: "CUSTOMER" as const,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { paymentStatus: "PAID" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return { customers, totalCount, page };
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { customers, totalCount, page } = await getCustomers(searchParams);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const search = searchParams.search ?? "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{totalCount} customers total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              name="search"
              placeholder="Search by name, email, or phone..."
              defaultValue={search}
              className="pl-9 h-9"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
          {search && (
            <Link href="/admin/customers">
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
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Orders</th>
                <th className="px-5 py-3 text-left">Total Spent</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-zinc-400"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const totalSpent = customer.orders.reduce(
                    (sum, o) => sum + Number(o.total),
                    0
                  );
                  return (
                    <tr
                      key={customer.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <span className="font-medium text-zinc-900">
                            {customer.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {customer.email}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {customer.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-700 font-medium">
                        {customer._count.orders}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">
                        ₹{totalSpent.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/customers/${customer.id}`}>
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
                  );
                })
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
                  href={`/admin/customers?search=${search}&page=${page - 1}`}
                >
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/customers?search=${search}&page=${page + 1}`}
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

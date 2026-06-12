import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

type SearchParams = {
  search?: string;
  page?: string;
  category?: string;
  status?: string;
};

const PAGE_SIZE = 20;

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const categoryFilter = params.category ?? "";
  const status = params.status ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
      ? { isActive: false }
      : {}),
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, totalCount, page };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, totalCount, page } = await getProducts(searchParams);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const search = searchParams.search ?? "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Products</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalCount} products total
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              name="search"
              placeholder="Search products..."
              defaultValue={search}
              className="pl-9 h-9"
            />
          </div>
          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="h-9 px-3 rounded-md border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button type="submit" size="sm" variant="outline">
            Filter
          </Button>
          {(search || searchParams.status || searchParams.category) && (
            <Link href="/admin/products">
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
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-zinc-400"
                  >
                    No products found.{" "}
                    <Link
                      href="/admin/products/new"
                      className="text-zinc-900 underline"
                    >
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const image = product.images[0];
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + (v.stock ?? 0),
                    0
                  );
                  return (
                    <tr
                      key={product.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                            {image ? (
                              <Image
                                src={image.url}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-300 text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              SKU: {product.sku ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                        {product.comparePrice && (
                          <p className="text-xs text-zinc-400 line-through">
                            ₹{Number(product.comparePrice).toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium ${
                            totalStock === 0
                              ? "text-red-600"
                              : totalStock < 10
                              ? "text-yellow-600"
                              : "text-green-700"
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            product.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-zinc-100 text-zinc-500 border-zinc-200"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {product.isFeatured && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
                              Featured
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <DeleteProductButton id={product.id} name={product.name} />
                        </div>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/products?search=${search}&page=${page - 1}`}
                >
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/products?search=${search}&page=${page + 1}`}
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

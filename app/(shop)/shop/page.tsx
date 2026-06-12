import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ProductCard } from "@/types";
import ShopHeader from "@/components/shop/shop-header";
import FiltersSidebar from "@/components/shop/filters-sidebar";
import ProductGrid from "@/components/shop/product-grid";
import Pagination from "@/components/shop/pagination";

const LIMIT = 16;

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string | string[];
    colors?: string | string[];
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Shop | NUE",
  description: "Browse our curated collection of premium minimalist fashion.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() || undefined;
  const category = params.category || undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sizes = params.sizes
    ? Array.isArray(params.sizes)
      ? params.sizes
      : params.sizes.split(",").filter(Boolean)
    : undefined;
  const colors = params.colors
    ? Array.isArray(params.colors)
      ? params.colors
      : params.colors.split(",").filter(Boolean)
    : undefined;
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const skip = (page - 1) * LIMIT;

  // Build where clause
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = { slug: category };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: new Prisma.Decimal(minPrice) } : {}),
      ...(maxPrice !== undefined ? { lte: new Prisma.Decimal(maxPrice) } : {}),
    };
  }
  if (sizes && sizes.length > 0) {
    where.variants = { some: { size: { in: sizes }, stock: { gt: 0 } } };
  }
  if (colors && colors.length > 0) {
    const colorFilter = { some: { color: { in: colors }, stock: { gt: 0 } } };
    if (where.variants && "some" in where.variants) {
      // Merge with existing variant filter — use AND at product level
      where.AND = [
        { variants: where.variants },
        { variants: colorFilter },
      ];
      delete where.variants;
    } else {
      where.variants = colorFilter;
    }
  }

  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "popular":
      orderBy = { soldCount: "desc" };
      break;
    case "rating":
      orderBy = { avgRating: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [total, rawProducts, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: LIMIT,
      include: {
        images: { select: { url: true, isPrimary: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  // Cast to ProductCard compatible type
  const products = rawProducts as unknown as ProductCard[];

  const currentFilters = {
    search,
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    sort,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-nue-cream/30">
        <div className="container py-8">
          <h1 className="font-serif text-display-md text-nue-charcoal">
            Shop
          </h1>
          <p className="mt-1 text-sm text-muted-foreground tracking-widest uppercase">
            Premium Minimalist Fashion
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <FiltersSidebar
              categories={categories}
              currentFilters={currentFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ShopHeader
              totalCount={total}
              currentCount={rawProducts.length}
              currentSort={sort}
              page={page}
              limit={LIMIT}
            />

            <div className="mt-6">
              <ProductGrid products={products} />
            </div>

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl="/shop"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

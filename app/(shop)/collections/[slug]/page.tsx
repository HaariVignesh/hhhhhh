import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import type { ProductCard } from "@/types";
import ProductGrid from "@/components/shop/product-grid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
}

async function getProducts(categoryId: string): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId },
    include: {
      images: { where: { isPrimary: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products as unknown as ProductCard[];
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection Not Found | NUE" };
  return {
    title: `${category.name} | NUE Collections`,
    description: category.description || `Shop the ${category.name} collection at NUE.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProducts(category.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-nue-charcoal overflow-hidden">
        {category.image && (
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover object-center opacity-30"
              priority
            />
          </div>
        )}
        <div className="relative container py-24 text-center">
          <div className="mb-4">
            <Link
              href="/collections"
              className="text-xs tracking-widest uppercase text-nue-cream/50 hover:text-nue-cream transition-colors"
            >
              Collections
            </Link>
            <span className="text-nue-cream/30 mx-2">/</span>
            <span className="text-xs tracking-widest uppercase text-nue-cream/70">
              {category.name}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-nue-cream tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-nue-cream/60 max-w-md mx-auto text-sm leading-relaxed">
              {category.description}
            </p>
          )}
          <p className="mt-6 text-xs tracking-widest uppercase text-nue-gold">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </div>

      {/* Sub-collections */}
      {category.children.length > 0 && (
        <div className="border-b border-nue-charcoal/8 bg-white">
          <div className="container py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/collections/${slug}`}
                className="text-xs tracking-widest uppercase text-nue-charcoal hover:text-nue-gold transition-colors"
              >
                All
              </Link>
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/collections/${child.slug}`}
                  className="text-xs tracking-widest uppercase text-nue-stone hover:text-nue-charcoal transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="container py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-nue-stone text-sm mb-4">
              No products in this collection yet. Check back soon!
            </p>
            <Link
              href="/shop"
              className="text-xs text-nue-gold hover:text-nue-charcoal transition-colors tracking-widest uppercase"
            >
              Browse all products →
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}

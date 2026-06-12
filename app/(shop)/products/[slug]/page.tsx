import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import type { ProductWithRelations, ProductCard } from "@/types";
import ProductImageGallery from "@/components/product/image-gallery";
import ProductInfo from "@/components/product/product-info";
import ReviewsSection from "@/components/product/reviews-section";
import RelatedProducts from "@/components/product/related-products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  }) as Promise<ProductWithRelations | null>;
}

async function getRelatedProducts(
  categoryId: string,
  excludeId: string
): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      isActive: true,
    },
    take: 8,
    orderBy: { soldCount: "desc" },
    include: {
      images: { select: { url: true, isPrimary: true } },
      category: { select: { name: true, slug: true } },
    },
  });
  return products as unknown as ProductCard[];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | NUE" };
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  return {
    title: `${product.name} | NUE`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              alt: primaryImage.alt || product.name,
            },
          ]
        : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Increment view count (fire-and-forget, don't block render)
  prisma.product
    .update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const relatedProducts = await getRelatedProducts(
    product.category.id,
    product.id
  );

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Product Hero Section */}
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">
          {/* Gallery */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-border">
        <div className="container py-12">
          <ReviewsSection
            reviews={product.reviews}
            avgRating={product.avgRating}
            reviewCount={product.reviewCount}
            productId={product.id}
          />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border bg-nue-cream/20">
          <div className="container py-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}

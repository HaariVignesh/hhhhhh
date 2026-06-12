import { prisma } from "@/lib/db";
import AnnouncementBar from "@/components/home/announcement-bar";
import HeroBanner from "@/components/home/hero-banner";
import FeaturedProducts from "@/components/home/featured-products";
import CollectionsGrid from "@/components/home/collections-grid";
import NewArrivals from "@/components/home/new-arrivals";
import BestSellers from "@/components/home/best-sellers";
import Testimonials from "@/components/home/testimonials";
import NewsletterSignup from "@/components/home/newsletter-signup";
import InstagramSection from "@/components/home/instagram-section";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [featuredProducts, newArrivals, bestSellers, collections, banners] =
    await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: { images: true, category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isNewArrival: true },
        include: { images: true, category: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        include: { images: true, category: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: { _count: { select: { products: true } } },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.banner.findMany({
        where: { isActive: true, position: "hero" },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

  return (
    <>
      <AnnouncementBar />
      <HeroBanner banners={banners} />
      <FeaturedProducts products={featuredProducts} />
      <CollectionsGrid collections={collections} />
      <NewArrivals products={newArrivals} />
      <BestSellers products={bestSellers} />
      <Testimonials />
      <NewsletterSignup />
      <InstagramSection />
    </>
  );
}

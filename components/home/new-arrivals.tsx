import Link from "next/link";
import ProductCard from "@/components/shop/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface NewArrivalsProps {
  products: ProductCardType[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (!products.length) return null;

  return (
    <section className="py-20 bg-nue-charcoal overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-nue-gold font-sans mb-3">
              Just Landed
            </p>
            <h2 className="font-serif text-display-md text-nue-cream leading-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="group inline-flex items-center gap-2 text-nue-cream/60 hover:text-nue-cream text-xs tracking-[0.2em] uppercase font-sans border-b border-nue-cream/20 hover:border-nue-cream/50 pb-0.5 transition-all duration-300 self-start sm:self-auto"
          >
            View All
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[72vw] max-w-[260px] snap-start"
              >
                <ProductCard product={product} dark />
              </div>
            ))}
          </div>
          {/* Scroll hint */}
          <p className="text-center text-nue-cream/30 text-xs tracking-widest uppercase mt-4 font-sans">
            Swipe to explore
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
            >
              <ProductCard product={product} dark />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import ProductCard from "@/components/shop/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface BestSellersProps {
  products: ProductCardType[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products.length) return null;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-nue-stone font-sans mb-3">
              Most Loved
            </p>
            <h2 className="font-serif text-display-md text-nue-charcoal leading-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?filter=bestseller"
            className="group inline-flex items-center gap-2 text-nue-charcoal/50 hover:text-nue-charcoal text-xs tracking-[0.2em] uppercase font-sans border-b border-nue-charcoal/20 hover:border-nue-charcoal/50 pb-0.5 transition-all duration-300 self-start sm:self-auto"
          >
            View All
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Rank indicators + cards */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[72vw] max-w-[260px] snap-start"
              >
                <div className="relative">
                  {/* Rank badge */}
                  <div className="absolute -top-3 -left-2 z-10 w-8 h-8 bg-nue-charcoal flex items-center justify-center">
                    <span className="font-serif text-nue-gold text-sm leading-none">
                      {idx + 1}
                    </span>
                  </div>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-nue-charcoal/30 text-xs tracking-widest uppercase mt-4 font-sans">
            Swipe to explore
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
            >
              {/* Rank badge */}
              <div className="absolute -top-3 -left-2 z-10 w-8 h-8 bg-nue-charcoal flex items-center justify-center">
                <span className="font-serif text-nue-gold text-sm leading-none">
                  {idx + 1}
                </span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

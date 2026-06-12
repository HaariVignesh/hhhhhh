import ProductCard from "@/components/shop/product-card";
import type { ProductCard as ProductCardType } from "@/types";

interface FeaturedProductsProps {
  products: ProductCardType[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-nue-stone font-sans mb-3">
            Curated for You
          </p>
          <h2 className="font-serif text-display-md text-nue-charcoal">Featured</h2>
          <div className="mt-4 mx-auto w-12 h-px bg-nue-gold" />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-14">
          <a
            href="/shop?filter=featured"
            className="group inline-flex items-center gap-3 border border-nue-charcoal text-nue-charcoal px-10 py-3.5 text-xs tracking-[0.2em] uppercase font-sans hover:bg-nue-charcoal hover:text-nue-cream transition-all duration-300"
          >
            View All Featured
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

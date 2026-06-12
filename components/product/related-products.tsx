import type { ProductCard } from "@/types";
import ProductCardComponent from "@/components/shop/product-card";

interface RelatedProductsProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number | string;
    comparePrice?: number | string | null;
    images: { url: string; isPrimary?: boolean }[];
    category: { name: string };
  }>;
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section>
      {/* Heading */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-8 h-px bg-nue-charcoal/20" />
        <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-nue-charcoal">
          You May Also Like
        </h2>
        <div className="flex-1 h-px bg-nue-charcoal/8" />
      </div>

      {/* Mobile: horizontal scroll; Desktop: 4-col grid */}
      <div className="relative">
        {/* Mobile horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:hidden scrollbar-hide">
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[calc(50vw-2rem)] max-w-[220px]"
            >
              <ProductCardComponent product={product as unknown as ProductCard} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-4 gap-x-4 gap-y-8">
          {products.slice(0, 4).map((product) => (
            <ProductCardComponent
              key={product.id}
              product={product as unknown as ProductCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

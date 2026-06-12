import Image from "next/image";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count: { products: number };
}

interface CollectionsGridProps {
  collections: Collection[];
}

// Varied sizing pattern for a masonry-like feel
const sizeClasses = [
  "md:col-span-2 md:row-span-2", // large
  "md:col-span-1 md:row-span-1", // small
  "md:col-span-1 md:row-span-1", // small
  "md:col-span-1 md:row-span-1", // small
  "md:col-span-1 md:row-span-1", // small
  "md:col-span-2 md:row-span-1", // wide
];

const heightClasses = [
  "h-80 md:h-full",
  "h-52 md:h-full",
  "h-52 md:h-full",
  "h-52 md:h-full",
  "h-52 md:h-full",
  "h-52 md:h-56",
];

// Gradient placeholders when no image
const placeholderGradients = [
  "from-nue-stone/40 to-nue-charcoal/60",
  "from-nue-gold/20 to-nue-stone/50",
  "from-nue-charcoal/40 to-nue-stone/60",
  "from-nue-cream to-nue-stone/40",
  "from-nue-gold/30 to-nue-charcoal/50",
  "from-nue-stone/30 to-nue-charcoal/40",
];

export default function CollectionsGrid({ collections }: CollectionsGridProps) {
  if (!collections.length) return null;

  return (
    <section className="py-20 px-4 bg-nue-cream">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-nue-stone font-sans mb-3">
            Discover
          </p>
          <h2 className="font-serif text-display-md text-nue-charcoal">
            Shop by Category
          </h2>
          <div className="mt-4 mx-auto w-12 h-px bg-nue-gold" />
        </div>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[560px]">
          {collections.map((collection, idx) => {
            const gradient = placeholderGradients[idx % placeholderGradients.length];
            const sizeClass = sizeClasses[idx] ?? "md:col-span-1 md:row-span-1";
            const heightClass = heightClasses[idx] ?? "h-52 md:h-full";

            return (
              <Link
                key={collection.id}
                href={`/shop?category=${collection.slug}`}
                className={`group relative overflow-hidden ${sizeClass} ${heightClass} block`}
              >
                {/* Image / placeholder */}
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-105`}
                  />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-nue-charcoal/30 group-hover:bg-nue-charcoal/20 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
                    <p className="text-nue-cream/70 text-xs tracking-[0.25em] uppercase font-sans mb-1">
                      {collection._count.products} pieces
                    </p>
                    <h3 className="font-serif text-nue-cream text-xl sm:text-2xl leading-tight">
                      {collection.name}
                    </h3>

                    {/* Reveal on hover */}
                    <div className="mt-3 flex items-center gap-2 text-nue-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs tracking-[0.2em] uppercase font-sans">
                        Shop Now
                      </span>
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                </div>

                {/* Gold border accent on hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-nue-gold/30 transition-colors duration-500 pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

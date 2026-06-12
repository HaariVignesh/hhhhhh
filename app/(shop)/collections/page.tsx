import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

async function getCollections() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-nue-charcoal py-20 px-4">
        <div className="container text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-nue-gold mb-4">NUE</p>
          <h1 className="text-5xl md:text-6xl font-serif text-nue-cream tracking-tight">
            Our Collections
          </h1>
          <p className="mt-4 text-nue-cream/60 max-w-md mx-auto text-sm leading-relaxed">
            Curated with intention. Each collection tells a story of craft, culture, and conscious
            fashion.
          </p>
        </div>
      </div>

      {/* Collections grid */}
      <div className="container py-16">
        {collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-nue-stone">No collections available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-nue-cream">
                  {collection.image ? (
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover object-center group-hover:scale-[1.06] transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 group-hover:scale-[1.06] transition-transform duration-700"
                      style={{
                        background: `linear-gradient(135deg, #F5F0E8 0%, #E8D5C4 50%, #C9A96E30 100%)`,
                      }}
                    />
                  )}

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-nue-charcoal/0 group-hover:bg-nue-charcoal/20 transition-colors duration-500" />

                  {/* Text overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="bg-white/90 backdrop-blur-sm p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h2 className="font-serif text-xl text-nue-charcoal tracking-tight">
                        {collection.name}
                      </h2>
                      <p className="text-xs text-nue-stone mt-1">
                        {collection._count.products}{" "}
                        {collection._count.products === 1 ? "piece" : "pieces"}
                      </p>
                      {collection.description && (
                        <p className="text-xs text-nue-stone mt-2 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {collection.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1.5 text-xs tracking-widest uppercase text-nue-gold font-medium">
                        Explore
                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-nue-charcoal/8 bg-nue-cream/30">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-serif text-nue-charcoal mb-3">
            Looking for something specific?
          </h2>
          <p className="text-sm text-nue-stone mb-6">
            Browse our full catalogue to discover every piece.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3.5 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
          >
            Shop All
          </Link>
        </div>
      </div>
    </div>
  );
}

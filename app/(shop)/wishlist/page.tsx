"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart,
  X,
  ShoppingBag,
  Loader2,
  Plus,
} from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import type { WishlistItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SIZES } from "@/types";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items, removeItem, addItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  const [isMerging, setIsMerging] = useState(false);
  const [sizeDialogItem, setSizeDialogItem] = useState<WishlistItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // On mount: if logged in, fetch server wishlist and merge with local
  useEffect(() => {
    if (!session?.user) return;

    const merge = async () => {
      setIsMerging(true);
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const serverItems: WishlistItem[] = await res.json();
        serverItems.forEach((si) => {
          addItem(si);
        });
      } catch {
        // silent
      } finally {
        setIsMerging(false);
      }
    };

    merge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleRemove = async (productId: string) => {
    removeItem(productId);
    if (session?.user) {
      fetch(`/api/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    setSizeDialogItem(item);
    setSelectedSize(null);
  };

  const handleConfirmAddToCart = () => {
    if (!sizeDialogItem) return;
    addToCart({
      id: `${sizeDialogItem.productId}-${selectedSize || "one-size"}-${Date.now()}`,
      productId: sizeDialogItem.productId,
      name: sizeDialogItem.name,
      slug: sizeDialogItem.slug,
      price: sizeDialogItem.price,
      image: sizeDialogItem.image,
      size: selectedSize || undefined,
      quantity: 1,
      stock: 10,
    });
    setAddedIds((prev) => new Set([...prev, sizeDialogItem.productId]));
    setSizeDialogItem(null);
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(sizeDialogItem.productId);
        return next;
      });
    }, 2000);
  };

  if (isMerging) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-nue-cream flex items-center justify-center mb-6">
          <Heart className="w-9 h-9 text-nue-stone" strokeWidth={1.2} />
        </div>
        <h1 className="text-3xl font-serif text-nue-charcoal mb-3">Your wishlist is empty</h1>
        <p className="text-sm text-nue-stone mb-8 max-w-xs leading-relaxed">
          Save pieces you love by tapping the heart icon on any product.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-8 py-3 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">Wishlist</h1>
          <p className="text-sm text-nue-stone mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {items.map((item) => (
            <div key={item.productId} className="group relative flex flex-col">
              {/* Image */}
              <div className="relative aspect-[3/4] bg-nue-cream overflow-hidden">
                <Link href={`/products/${item.slug}`} tabIndex={-1}>
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 text-nue-charcoal hover:bg-nue-charcoal hover:text-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Sale badge */}
                {item.comparePrice && item.comparePrice > item.price && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">
                      Sale
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="pt-3 flex-1 flex flex-col">
                <p className="text-[10px] tracking-widest uppercase text-nue-stone">
                  {item.category}
                </p>
                <Link
                  href={`/products/${item.slug}`}
                  className="mt-0.5 text-sm font-sans font-medium text-nue-charcoal hover:text-nue-stone transition-colors line-clamp-2 leading-snug"
                >
                  {item.name}
                </Link>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm font-medium text-nue-charcoal">
                    {formatPrice(item.price)}
                  </span>
                  {item.comparePrice && item.comparePrice > item.price && (
                    <span className="text-xs text-nue-stone line-through">
                      {formatPrice(item.comparePrice)}
                    </span>
                  )}
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase font-medium transition-colors duration-200 ${
                    addedIds.has(item.productId)
                      ? "bg-nue-gold text-white"
                      : "bg-nue-charcoal text-nue-cream hover:bg-nue-gold"
                  }`}
                >
                  {addedIds.has(item.productId) ? (
                    "Added!"
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Bag
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Size selection dialog */}
        <Dialog open={!!sizeDialogItem} onOpenChange={() => setSizeDialogItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-nue-charcoal">
                Select Size
              </DialogTitle>
            </DialogHeader>
            {sizeDialogItem && (
              <div className="space-y-5">
                <div className="flex gap-3 items-start">
                  <div className="relative w-16 h-20 shrink-0 bg-nue-cream overflow-hidden">
                    <Image
                      src={getImageUrl(sizeDialogItem.image)}
                      alt={sizeDialogItem.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-nue-charcoal">
                      {sizeDialogItem.name}
                    </p>
                    <p className="text-sm text-nue-stone">{formatPrice(sizeDialogItem.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-sm border transition-colors ${
                        selectedSize === size
                          ? "border-nue-charcoal bg-nue-charcoal text-white"
                          : "border-nue-charcoal/20 text-nue-charcoal hover:border-nue-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Bag
                  </button>
                  <button
                    onClick={() => setSizeDialogItem(null)}
                    className="px-4 py-3 border border-nue-charcoal/20 text-nue-charcoal text-sm hover:bg-nue-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

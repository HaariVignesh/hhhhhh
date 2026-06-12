"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(
    () => Math.max(0, sortedImages.findIndex((img) => img.isPrimary))
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const activeImage = sortedImages[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-nue-cream/40 flex items-center justify-center rounded-sm">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails — vertical on desktop, horizontal on mobile */}
      {sortedImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:h-auto pb-1 md:pb-0 md:max-h-[580px] scrollbar-thin">
          {sortedImages.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden rounded-sm border-2 transition-all duration-200",
                activeIndex === idx
                  ? "border-nue-charcoal"
                  : "border-transparent hover:border-nue-stone/50 opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={getImageUrl(image.url)}
                alt={image.alt || `${productName} ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1">
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-sm bg-nue-cream/30 cursor-zoom-in",
            isZoomed && "cursor-zoom-out"
          )}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={getImageUrl(activeImage.url)}
            alt={activeImage.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-200 ease-out",
              isZoomed ? "scale-150" : "scale-100"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />

          {/* Image counter on mobile */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-3 right-3 md:hidden bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {activeIndex + 1} / {sortedImages.length}
            </div>
          )}

          {/* Navigation arrows on mobile */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? sortedImages.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === sortedImages.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

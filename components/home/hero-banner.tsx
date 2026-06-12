"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
};

interface HeroBannerProps {
  banners: Banner[];
}

function StaticHero() {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-nue-charcoal">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-nue-charcoal via-[#1a1a1a] to-[#3a3228]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(201,169,110,0.08)_0%,transparent_60%)]" />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
        <p className="text-nue-gold text-xs tracking-[0.45em] uppercase font-sans mb-6 animate-slide-down">
          New Collection
        </p>

        <h1 className="font-serif text-nue-cream leading-[1.05] mb-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          Wear Your
          <span className="block italic text-nue-gold">Story</span>
        </h1>

        <p className="text-nue-cream/60 text-sm sm:text-base font-sans font-light tracking-wide max-w-md mx-auto mb-12 leading-relaxed">
          Timeless silhouettes crafted for the modern individual. Discover pieces
          that speak without words.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 bg-nue-cream text-nue-charcoal px-10 py-4 text-xs tracking-[0.2em] uppercase font-sans font-medium hover:bg-nue-gold hover:text-white transition-all duration-300"
          >
            Explore Collection
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/shop?filter=new"
            className="inline-flex items-center gap-2 text-nue-cream/70 hover:text-nue-cream text-xs tracking-[0.2em] uppercase font-sans border-b border-nue-cream/20 hover:border-nue-cream/60 pb-0.5 transition-all duration-300"
          >
            New Arrivals
          </Link>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-nue-cream/30 text-xs tracking-[0.3em] uppercase font-sans">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-nue-cream/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 300);
    },
    [current, isTransitioning]
  );

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners || banners.length === 0) {
    return <StaticHero />;
  }

  const slide = banners[current];

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-nue-charcoal">
      {/* Slides */}
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title ?? "NUE Collection"}
            fill
            priority={idx === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-nue-charcoal/70 via-nue-charcoal/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-nue-charcoal/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div
        className={`relative z-10 h-full flex items-center px-8 sm:px-12 lg:px-20 transition-all duration-500 ${
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-lg">
          <p className="text-nue-gold text-xs tracking-[0.4em] uppercase font-sans mb-5">
            New Collection
          </p>

          {slide.title && (
            <h2 className="font-serif text-nue-cream text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
              {slide.title}
            </h2>
          )}

          {slide.subtitle && (
            <p className="text-nue-cream/70 text-sm sm:text-base font-sans font-light leading-relaxed mb-10 max-w-sm">
              {slide.subtitle}
            </p>
          )}

          {slide.ctaText && slide.ctaLink && (
            <Link
              href={slide.ctaLink}
              className="group inline-flex items-center gap-3 bg-nue-cream text-nue-charcoal px-10 py-4 text-xs tracking-[0.2em] uppercase font-sans font-medium hover:bg-nue-gold hover:text-white transition-all duration-300"
            >
              {slide.ctaText}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-nue-cream/30 text-nue-cream/70 hover:text-nue-cream hover:border-nue-cream/70 hover:bg-nue-cream/10 transition-all duration-200"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-nue-cream/30 text-nue-cream/70 hover:text-nue-cream hover:border-nue-cream/70 hover:bg-nue-cream/10 transition-all duration-200"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 ${
                  idx === current
                    ? "w-8 h-0.5 bg-nue-cream"
                    : "w-2 h-0.5 bg-nue-cream/40 hover:bg-nue-cream/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

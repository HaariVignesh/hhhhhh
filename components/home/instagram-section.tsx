"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";

const placeholderPosts = [
  {
    id: 1,
    gradient: "from-nue-stone/50 to-nue-charcoal/80",
    alt: "NUE outfit of the day",
  },
  {
    id: 2,
    gradient: "from-nue-gold/30 to-nue-stone/60",
    alt: "NUE minimalist look",
  },
  {
    id: 3,
    gradient: "from-nue-charcoal/60 to-nue-stone/40",
    alt: "NUE editorial shot",
  },
  {
    id: 4,
    gradient: "from-[#d4b896]/40 to-nue-charcoal/70",
    alt: "NUE street style",
  },
  {
    id: 5,
    gradient: "from-nue-stone/30 to-[#1a1a1a]/80",
    alt: "NUE new collection",
  },
  {
    id: 6,
    gradient: "from-nue-gold/20 to-nue-charcoal/60",
    alt: "NUE wardrobe essentials",
  },
];

export default function InstagramSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-nue-cream">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.35em] uppercase text-nue-stone font-sans mb-3">
            Community
          </p>
          <a
            href="https://instagram.com/nueclothing"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 font-serif text-display-md text-nue-charcoal hover:text-nue-stone transition-colors duration-300"
          >
            <Instagram
              size={28}
              strokeWidth={1}
              className="text-nue-stone group-hover:text-nue-gold transition-colors duration-300"
            />
            @nueclothing
          </a>
          <div className="mt-4 mx-auto w-12 h-px bg-nue-gold" />
          <p className="mt-4 text-nue-stone text-sm font-sans font-light">
            Tag us with{" "}
            <span className="text-nue-charcoal font-medium">#WearNUE</span> to be
            featured
          </p>
        </div>

        {/* 6-cell grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {placeholderPosts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/nueclothing"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
              onMouseEnter={() => setHovered(post.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={post.alt}
            >
              {/* Gradient placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.gradient} transition-transform duration-700 group-hover:scale-105`}
              />

              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
                }}
              />

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 bg-nue-charcoal/60 flex items-center justify-center transition-all duration-400 ${
                  hovered === post.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col items-center gap-2 transform transition-transform duration-300 scale-90 group-hover:scale-100">
                  <Instagram
                    size={28}
                    strokeWidth={1.5}
                    className="text-white"
                  />
                  <span className="text-white text-xs tracking-[0.2em] uppercase font-sans">
                    View Post
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/nueclothing"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 border border-nue-charcoal/30 text-nue-charcoal px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-sans hover:bg-nue-charcoal hover:text-nue-cream transition-all duration-300"
          >
            <Instagram size={13} strokeWidth={2} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

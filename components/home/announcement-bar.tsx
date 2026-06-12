"use client";

import { useState } from "react";
import { X } from "lucide-react";

const messages = [
  "Complimentary shipping on orders above ₹999",
  "Use code WELCOME10 for 10% off your first order",
  "New arrivals every Monday — Shop the latest drops",
  "Free returns within 15 days — No questions asked",
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-nue-charcoal text-nue-cream overflow-hidden">
      <div className="flex items-center justify-between">
        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden py-2.5">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...messages, ...messages].map((msg, i) => (
              <span
                key={i}
                className="inline-flex items-center text-xs tracking-widest uppercase font-sans font-light"
              >
                <span className="mx-8 text-nue-gold">✦</span>
                {msg}
              </span>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Close announcement"
          className="flex-shrink-0 px-3 py-2.5 text-nue-cream/60 hover:text-nue-cream transition-colors duration-200"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

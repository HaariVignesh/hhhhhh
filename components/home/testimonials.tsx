import { CheckCircle } from "lucide-react";

const testimonials = [
  {
    id: 1,
    rating: 5,
    quote:
      "NUE has completely redefined my wardrobe. The quality is unmatched — every piece feels luxurious and the fit is perfect. I get compliments every time I wear anything from them.",
    name: "Priya Mehta",
    location: "Mumbai",
    tag: "Verified Purchase",
  },
  {
    id: 2,
    rating: 5,
    quote:
      "I was hesitant to order online but NUE exceeded every expectation. The fabrics are exceptional, the packaging is beautiful, and the pieces are exactly as pictured. A brand I'll keep coming back to.",
    name: "Arjun Kapoor",
    location: "Delhi",
    tag: "Verified Purchase",
  },
  {
    id: 3,
    rating: 5,
    quote:
      "Minimalist, sophisticated, timeless. NUE understands fashion as a form of self-expression. Their pieces are investment dressing at its finest — worth every rupee.",
    name: "Kavya Nair",
    location: "Bengaluru",
    tag: "Verified Purchase",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-nue-gold" : "text-nue-stone/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 px-4 bg-nue-cream">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-nue-stone font-sans mb-3">
            What Our Clients Say
          </p>
          <h2 className="font-serif text-display-md text-nue-charcoal leading-tight">
            Stories of Style
          </h2>
          <div className="mt-4 mx-auto w-12 h-px bg-nue-gold" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <article
              key={t.id}
              className="group relative bg-white p-8 border border-nue-stone/10 hover:border-nue-gold/30 transition-all duration-500 hover:shadow-lg"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-6 right-8 font-serif text-6xl text-nue-gold/10 leading-none select-none pointer-events-none"
                aria-hidden="true"
              >
                "
              </span>

              <div className="space-y-5">
                <StarRating count={t.rating} />

                <blockquote className="text-nue-charcoal/80 text-sm leading-relaxed font-sans font-light italic">
                  "{t.quote}"
                </blockquote>

                <div className="pt-4 border-t border-nue-stone/10 flex items-center justify-between">
                  <div>
                    <p className="text-nue-charcoal text-sm font-medium tracking-wide">
                      {t.name}
                    </p>
                    <p className="text-nue-stone text-xs mt-0.5">{t.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-nue-gold">
                    <CheckCircle size={13} strokeWidth={2} />
                    <span className="text-xs font-sans tracking-wide">{t.tag}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Leaf, Diamond, Heart } from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "Every piece is crafted with the planet in mind — from organic fabrics and low-waste production to carbon-neutral shipping. We believe beautiful fashion should never cost the earth.",
  },
  {
    icon: Diamond,
    title: "Quality",
    description:
      "We work with master artisans and invest in only the finest materials. Each garment passes through 47 quality checks before reaching you, because you deserve nothing less.",
  },
  {
    icon: Heart,
    title: "Community",
    description:
      "NUE was born from a community of conscious wearers. We give 2% of every sale to artisan welfare funds and partner with women-led cooperatives across India.",
  },
];

const TEAM = [
  {
    name: "Aanya Mehta",
    role: "Founder & Creative Director",
    initial: "A",
    bio: "Former textile scientist turned designer. Aanya brings 12 years of material science to every silhouette.",
  },
  {
    name: "Rohan Kapoor",
    role: "Head of Sustainability",
    initial: "R",
    bio: "Environmental economist passionate about closing the loop in fashion supply chains.",
  },
  {
    name: "Priya Nair",
    role: "Lead Artisan Liaison",
    initial: "P",
    bio: "Bridges our Mumbai studio with craft clusters across Rajasthan, Gujarat, and Tamil Nadu.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative bg-nue-charcoal py-32 px-4 overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C9A96E 0px, #C9A96E 1px, transparent 1px, transparent 12px)",
          }}
        />
        <div className="relative container text-center max-w-3xl">
          <p className="text-xs tracking-[0.4em] uppercase text-nue-gold mb-6">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-serif text-nue-cream tracking-tight leading-tight">
            Dressed in
            <br />
            Purpose.
          </h1>
          <p className="mt-8 text-nue-cream/60 text-base leading-relaxed max-w-xl mx-auto">
            NUE was founded on a single belief: that the clothes we wear should reflect the values
            we hold. Every thread, every stitch, every silence between seams — intentional.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="container py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-nue-gold mb-6">How We Began</p>
            <h2 className="text-3xl font-serif text-nue-charcoal tracking-tight mb-6 leading-tight">
              A wardrobe built on honesty, not trends.
            </h2>
            <div className="space-y-4 text-sm text-nue-stone leading-relaxed">
              <p>
                In 2019, designer Aanya Mehta was tired of watching beautiful clothes become
                landfill within a season. She left a corporate fashion house, flew to Rajasthan, and
                spent six months learning ancient block-printing alongside karigars whose craft dated
                back four centuries.
              </p>
              <p>
                What emerged was NUE — a word that means &ldquo;new&rdquo; in French, but for us
                represents a return to something old: the idea that clothing can be an act of care.
                Care for the maker, the wearer, and the world between.
              </p>
              <p>
                Today we partner with 140+ artisans across India, use exclusively natural dyes and
                GOTS-certified organic cotton, and ship in 100% compostable packaging.
              </p>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative aspect-[4/5] bg-gradient-to-br from-nue-cream via-nue-blush to-nue-gold/20 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-0.5 bg-nue-gold mb-6" />
              <p className="font-serif text-2xl text-nue-charcoal leading-relaxed">
                &ldquo;Clothes that outlive trends.&rdquo;
              </p>
              <div className="w-16 h-0.5 bg-nue-gold mt-6" />
              <p className="mt-4 text-xs tracking-widest uppercase text-nue-stone">
                — Aanya Mehta, Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-nue-charcoal py-24 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-nue-gold mb-4">What Drives Us</p>
            <h2 className="text-4xl font-serif text-nue-cream tracking-tight">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value) => (
              <div key={value.title} className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto flex items-center justify-center bg-nue-gold/10 border border-nue-gold/20">
                  <value.icon className="w-6 h-6 text-nue-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-nue-cream">{value.title}</h3>
                <p className="text-sm text-nue-cream/50 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="container py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-nue-gold mb-4">The People</p>
            <h2 className="text-4xl font-serif text-nue-charcoal tracking-tight">
              Behind the Brand
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="group flex flex-col items-center text-center space-y-4"
              >
                {/* Avatar placeholder */}
                <div className="w-24 h-24 rounded-full bg-nue-cream border-2 border-nue-charcoal/8 group-hover:border-nue-gold transition-colors flex items-center justify-center">
                  <span className="text-3xl font-serif text-nue-charcoal">{member.initial}</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-nue-charcoal">{member.name}</h3>
                  <p className="text-xs tracking-widest uppercase text-nue-gold mt-0.5">
                    {member.role}
                  </p>
                </div>
                <p className="text-sm text-nue-stone leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-nue-cream/40 border-t border-nue-charcoal/8 py-20 px-4">
        <div className="container text-center max-w-xl">
          <h2 className="text-3xl font-serif text-nue-charcoal tracking-tight mb-4">
            Ready to wear your values?
          </h2>
          <p className="text-sm text-nue-stone leading-relaxed mb-8">
            Every purchase is a vote for a more thoughtful fashion industry. Browse the collection
            and find your next considered piece.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-10 py-4 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
          >
            Explore Our Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

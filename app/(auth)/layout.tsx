export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#2C2C2C] text-white p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(201,169,110,0.3) 40px,
                rgba(201,169,110,0.3) 41px
              )`,
            }}
          />
        </div>

        {/* Top: Brand name */}
        <div className="relative z-10">
          <span className="font-serif tracking-[0.3em] text-2xl text-[#C9A96E]">NUE</span>
        </div>

        {/* Middle: Quote */}
        <div className="relative z-10">
          <div className="w-12 h-px bg-[#C9A96E] mb-8" />
          <blockquote className="text-3xl font-serif italic text-white/80 leading-relaxed">
            &ldquo;Fashion is the armor to survive the reality of everyday life.&rdquo;
          </blockquote>
          <p className="mt-6 text-white/50 text-sm tracking-wider uppercase">— Bill Cunningham</p>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs tracking-widest uppercase">
            &copy; 2025 NUE. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8 bg-[#F5F0E8] min-h-screen">
        {/* Mobile brand header */}
        <div className="absolute top-6 left-0 right-0 flex justify-center lg:hidden">
          <span className="font-serif tracking-[0.3em] text-xl text-[#2C2C2C]">NUE</span>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

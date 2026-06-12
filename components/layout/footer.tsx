import Link from "next/link";

// ---------------------------------------------------------------------------
// Footer link data
// ---------------------------------------------------------------------------
const footerLinks = [
  {
    heading: "Shop",
    links: [
      { label: "Women", href: "/shop/women" },
      { label: "Men", href: "/shop/men" },
      { label: "Accessories", href: "/shop/accessories" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Sale", href: "/sale" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Social icon SVGs (inline, no external dependency)
// ---------------------------------------------------------------------------
function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/nue_store", icon: InstagramIcon },
  { label: "Twitter / X", href: "https://twitter.com/nue_store", icon: TwitterXIcon },
  { label: "Pinterest", href: "https://pinterest.com/nue_store", icon: PinterestIcon },
  { label: "Facebook", href: "https://facebook.com/nue_store", icon: FacebookIcon },
];

// ---------------------------------------------------------------------------
// Newsletter form (server component — submit handled via form action / API)
// ---------------------------------------------------------------------------
function NewsletterForm() {
  return (
    <form
      action="/api/newsletter"
      method="POST"
      className="flex flex-col sm:flex-row gap-3 max-w-sm"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="
          flex-1 bg-transparent border border-[#F5F0E8]/20 text-[#F5F0E8]
          placeholder:text-[#F5F0E8]/40 px-4 py-2.5 text-sm
          focus:outline-none focus:border-[#C9A96E] transition-colors duration-200
        "
      />
      <button
        type="submit"
        className="
          px-6 py-2.5 bg-[#C9A96E] text-white text-xs tracking-[0.15em] uppercase
          font-sans font-medium hover:bg-[#b8944f] transition-colors duration-200
          active:scale-[0.98] shrink-0
        "
      >
        Subscribe
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Footer component
// ---------------------------------------------------------------------------
export function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-[#F5F0E8]">
      {/* ------------------------------------------------------------------ */}
      {/* Main footer grid                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1.5fr] gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Link
                href="/"
                className="font-serif tracking-[0.35em] text-2xl uppercase text-[#F5F0E8] hover:text-[#C9A96E] transition-colors duration-300"
                aria-label="NUE – Homepage"
              >
                NUE
              </Link>
              <p className="mt-3 text-sm text-[#F5F0E8]/55 leading-relaxed tracking-wide italic font-cormorant">
                Dressed in intention.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#F5F0E8]/50 hover:text-[#C9A96E] transition-colors duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.heading}>
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] font-sans font-medium mb-5">
                {section.heading}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter column */}
          <div>
            <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] font-sans font-medium mb-5">
              Stay in the loop
            </h3>
            <p className="text-sm text-[#F5F0E8]/60 mb-5 leading-relaxed">
              New arrivals, exclusive edits, and early access — straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom bar                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-t border-[#F5F0E8]/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F5F0E8]/35 tracking-wide">
            &copy; {new Date().getFullYear()} NUE. All rights reserved.
          </p>
          <nav className="flex items-center gap-5" aria-label="Legal">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Returns", href: "/returns" },
            ].map((item, i, arr) => (
              <span key={item.href} className="flex items-center gap-5">
                <Link
                  href={item.href}
                  className="text-xs text-[#F5F0E8]/35 hover:text-[#F5F0E8]/70 transition-colors duration-200"
                >
                  {item.label}
                </Link>
                {i < arr.length - 1 && (
                  <span className="text-[#F5F0E8]/15 select-none">|</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

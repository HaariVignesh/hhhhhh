"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useUIStore } from "@/store/ui-store";

// ---------------------------------------------------------------------------
// Navigation data
// ---------------------------------------------------------------------------
const navLinks = [
  {
    label: "Shop",
    href: "/shop",
    dropdown: [
      {
        heading: "Women",
        links: [
          { label: "Tops", href: "/shop/women/tops" },
          { label: "Dresses", href: "/shop/women/dresses" },
          { label: "Bottoms", href: "/shop/women/bottoms" },
          { label: "Outerwear", href: "/shop/women/outerwear" },
        ],
      },
      {
        heading: "Men",
        links: [
          { label: "Tops", href: "/shop/men/tops" },
          { label: "Bottoms", href: "/shop/men/bottoms" },
          { label: "Outerwear", href: "/shop/men/outerwear" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Bags", href: "/shop/accessories/bags" },
          { label: "Jewellery", href: "/shop/accessories/jewellery" },
          { label: "Scarves", href: "/shop/accessories/scarves" },
        ],
      },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    dropdown: [
      {
        heading: "Current Season",
        links: [
          { label: "Summer 2025", href: "/collections/summer-2025" },
          { label: "Resort", href: "/collections/resort" },
        ],
      },
      {
        heading: "Archive",
        links: [
          { label: "Winter 2024", href: "/collections/winter-2024" },
          { label: "All Collections", href: "/collections" },
        ],
      },
    ],
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
    dropdown: null,
    highlight: false,
  },
  {
    label: "Sale",
    href: "/sale",
    dropdown: null,
    highlight: true,
  },
];

// ---------------------------------------------------------------------------
// Navbar component
// ---------------------------------------------------------------------------
export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { openSearch } = useUIStore();
  const { openCart } = useCart();
  const { items: cartItems, itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  const cartCount = itemCount();
  const wishlistCount = wishlistItems.length;

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Dropdown hover helpers — delay prevents flicker on fast mouse moves
  const handleMouseEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Announcement bar                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#2C2C2C] text-[#F5F0E8] text-center py-2 text-[11px] tracking-[0.15em] uppercase font-sans">
        Complimentary shipping on orders over $150&nbsp;&nbsp;·&nbsp;&nbsp;
        <Link
          href="/new-arrivals"
          className="underline underline-offset-2 hover:text-[#C9A96E] transition-colors duration-200"
        >
          Shop New Arrivals
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-[0_1px_12px_rgba(44,44,44,0.06)]"
            : "bg-background"
        }`}
      >
        <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ------------------------------------------------------------ */}
            {/* Mobile: hamburger (left)                                       */}
            {/* ------------------------------------------------------------ */}
            <div className="flex items-center lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:bg-transparent hover:text-[#C9A96E] -ml-2 transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] p-0 bg-background border-border rounded-none"
                >
                  <MobileMenu
                    session={session}
                    onClose={() => setMobileOpen(false)}
                    onSignOut={() => signOut({ callbackUrl: "/" })}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Logo — centred on mobile, left-aligned on desktop             */}
            {/* ------------------------------------------------------------ */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
              <Link
                href="/"
                className="font-serif tracking-[0.35em] text-xl uppercase text-foreground hover:text-[#C9A96E] transition-colors duration-300 select-none"
                aria-label="NUE – Homepage"
              >
                NUE
              </Link>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Desktop nav links (centre)                                     */}
            {/* ------------------------------------------------------------ */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`nav-link flex items-center gap-1 py-7 ${
                        link.highlight ? "text-[#C9A96E] hover:text-[#b8944f]" : ""
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mega dropdown panel */}
                    {activeDropdown === link.label && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 bg-background border border-border shadow-xl p-8 animate-slide-down"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${link.dropdown.length}, minmax(120px, 1fr))`,
                          gap: "2rem",
                          minWidth: "480px",
                        }}
                        onMouseEnter={() => handleMouseEnter(link.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {link.dropdown.map((col) => (
                          <div key={col.heading}>
                            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8C7B6B] mb-4 font-sans font-medium">
                              {col.heading}
                            </p>
                            <ul className="space-y-3">
                              {col.links.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="text-sm text-foreground/75 hover:text-foreground transition-colors duration-150 block"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`nav-link py-7 ${
                      link.highlight
                        ? "text-[#C9A96E] hover:text-[#b8944f]"
                        : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Right icons                                                    */}
            {/* ------------------------------------------------------------ */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-transparent hover:text-[#C9A96E] transition-colors h-9 w-9"
                aria-label="Open search"
                onClick={openSearch}
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-transparent hover:text-[#C9A96E] transition-colors relative h-9 w-9"
                aria-label={`Wishlist (${wishlistCount} items)`}
                asChild
              >
                <Link href="/wishlist">
                  <Heart className="h-[18px] w-[18px]" />
                  {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-transparent hover:text-[#C9A96E] transition-colors relative h-9 w-9"
                aria-label={`Cart (${cartCount} items)`}
                onClick={openCart}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && <CountBadge count={cartCount} />}
              </Button>

              {/* User account dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:bg-transparent hover:text-[#C9A96E] transition-colors h-9 w-9"
                    aria-label="Account"
                  >
                    <User className="h-[18px] w-[18px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-background border-border rounded-none shadow-lg mt-2 p-1"
                >
                  {session ? (
                    <>
                      <div className="px-3 py-2.5 mb-1">
                        <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-0.5">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium truncate text-foreground">
                          {session.user?.name ?? session.user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem
                        asChild
                        className="rounded-none cursor-pointer gap-2.5 text-sm py-2.5 focus:bg-muted"
                      >
                        <Link href="/account">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="rounded-none cursor-pointer gap-2.5 text-sm py-2.5 focus:bg-muted"
                      >
                        <Link href="/account/orders">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="rounded-none cursor-pointer gap-2.5 text-sm py-2.5 focus:bg-muted"
                      >
                        <Link href="/account/settings">
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem
                        className="rounded-none cursor-pointer gap-2.5 text-sm py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        asChild
                        className="rounded-none cursor-pointer text-sm py-2.5 focus:bg-muted"
                      >
                        <Link href="/login">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="rounded-none cursor-pointer text-sm py-2.5 focus:bg-muted"
                      >
                        <Link href="/register">Create Account</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

// ---------------------------------------------------------------------------
// Count badge
// ---------------------------------------------------------------------------
function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 h-[16px] w-[16px] rounded-full bg-[#C9A96E] text-white text-[9px] font-sans font-semibold flex items-center justify-center leading-none pointer-events-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Mobile menu (rendered inside Sheet)
// ---------------------------------------------------------------------------
interface MobileMenuProps {
  session: ReturnType<typeof useSession>["data"];
  onClose: () => void;
  onSignOut: () => void;
}

function MobileMenu({ session, onClose, onSignOut }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
        <Link
          href="/"
          className="font-serif tracking-[0.3em] text-xl uppercase text-foreground"
          onClick={onClose}
        >
          NUE
        </Link>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable nav links */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        {navLinks.map((link) => (
          <div key={link.label} className="border-b border-border/50 last:border-0">
            {link.dropdown ? (
              <>
                <button
                  onClick={() =>
                    setExpanded(expanded === link.label ? null : link.label)
                  }
                  className={`w-full flex items-center justify-between py-4 text-[11px] tracking-[0.12em] uppercase font-sans ${
                    link.highlight ? "text-[#C9A96E]" : "text-foreground"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                      expanded === link.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expanded === link.label && (
                  <div className="ml-2 pb-4 space-y-5">
                    {link.dropdown.map((col) => (
                      <div key={col.heading}>
                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C7B6B] mb-2.5 font-sans">
                          {col.heading}
                        </p>
                        <ul className="space-y-2.5">
                          {col.links.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="text-sm text-foreground/75 hover:text-foreground transition-colors block"
                                onClick={onClose}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={link.href}
                className={`block py-4 text-[11px] tracking-[0.12em] uppercase font-sans ${
                  link.highlight ? "text-[#C9A96E]" : "text-foreground"
                }`}
                onClick={onClose}
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Auth footer */}
      <div className="border-t border-border px-6 py-6 shrink-0 space-y-3">
        {session ? (
          <>
            <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {session.user?.email}
            </p>
            <Link
              href="/account"
              className="block text-sm text-foreground py-1.5 hover:text-[#C9A96E] transition-colors"
              onClick={onClose}
            >
              My Account
            </Link>
            <Link
              href="/account/orders"
              className="block text-sm text-foreground py-1.5 hover:text-[#C9A96E] transition-colors"
              onClick={onClose}
            >
              Orders
            </Link>
            <button
              onClick={onSignOut}
              className="block text-sm text-destructive py-1.5 w-full text-left"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="btn-luxury-primary text-center"
              onClick={onClose}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-luxury-outline text-center"
              onClick={onClose}
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

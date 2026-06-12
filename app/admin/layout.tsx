"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Ticket,
  Image,
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/content", icon: Image, label: "Content" },
];

const breadcrumbMap: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/coupons/new": "New Coupon",
  "/admin/content": "Content",
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Admin", href: "/admin/dashboard" },
  ];
  let accumulated = "";
  for (const part of parts) {
    accumulated += `/${part}`;
    const label = breadcrumbMap[accumulated];
    if (label && accumulated !== "/admin") {
      crumbs.push({ label, href: accumulated });
    } else if (!label && part !== "admin") {
      crumbs.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        href: accumulated,
      });
    }
  }
  return crumbs;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          className="block"
        >
          <span className="text-2xl font-serif tracking-[0.15em] text-white">
            NUE
          </span>
          <p className="text-[10px] text-zinc-400 tracking-widest uppercase mt-0.5">
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group",
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-white pl-[10px]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 group"
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0 text-zinc-400 group-hover:text-white" />
            Back to Store
          </Link>
        </div>
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 w-full group"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-zinc-400 group-hover:text-white" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 z-30 hidden lg:flex flex-col shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="p-0 w-64 border-0">
          <SidebarContent onClose={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            {/* Left: mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                onClick={() => setSheetOpen(true)}
              >
                <Menu className="h-5 w-5 text-zinc-600" />
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={crumb.href}>
                    {i > 0 && (
                      <span className="text-zinc-300 select-none">/</span>
                    )}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="text-zinc-900 font-medium">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Right: notifications + user */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-md hover:bg-zinc-100 transition-colors">
                <Bell className="h-4 w-4 text-zinc-600" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
              </button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors">
                    <div className="h-7 w-7 rounded-full bg-zinc-900 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 hidden sm:block">
                      Admin
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-zinc-500 font-normal">
                    Signed in as Admin
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Store
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={async () => {
                      await fetch("/api/auth/signout", { method: "POST" });
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

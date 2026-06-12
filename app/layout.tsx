import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "NUE – Premium Fashion",
    template: "%s | NUE",
  },
  description:
    "Discover NUE — a curated collection of premium fashion essentials crafted for the intentional wardrobe. Shop women's, men's, and accessories.",
  keywords: [
    "premium fashion",
    "luxury clothing",
    "sustainable fashion",
    "NUE",
    "designer clothing",
    "minimalist fashion",
  ],
  authors: [{ name: "NUE" }],
  creator: "NUE",
  metadataBase: new URL("https://nue.store"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nue.store",
    title: "NUE – Premium Fashion",
    description:
      "Discover NUE — a curated collection of premium fashion essentials crafted for the intentional wardrobe.",
    siteName: "NUE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NUE – Premium Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUE – Premium Fashion",
    description:
      "Discover NUE — a curated collection of premium fashion essentials crafted for the intentional wardrobe.",
    images: ["/og-image.jpg"],
    creator: "@nue_store",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#2C2C2C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} font-sans bg-background text-foreground antialiased`}
      >
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}

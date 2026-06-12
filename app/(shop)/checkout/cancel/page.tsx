import Link from "next/link";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 px-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
        <XCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
      </div>

      <div className="text-center max-w-md space-y-4 mb-10">
        <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">
          Payment Cancelled
        </h1>
        <p className="text-sm text-nue-stone leading-relaxed">
          Your payment was cancelled and no charge has been made. Your cart items are still saved
          and you can try again whenever you're ready.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/cart"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200"
        >
          <ShoppingBag className="w-4 h-4" />
          Return to Cart
        </Link>
        <Link
          href="/shop"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-nue-charcoal/20 text-nue-charcoal text-sm font-medium tracking-widest uppercase hover:bg-nue-cream transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Keep Shopping
        </Link>
      </div>

      <p className="mt-8 text-xs text-nue-stone text-center">
        Need help?{" "}
        <a
          href="mailto:hello@nueclothing.com"
          className="text-nue-gold hover:text-nue-charcoal transition-colors"
        >
          Contact support
        </a>
      </p>
    </div>
  );
}

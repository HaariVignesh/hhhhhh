import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

/**
 * Converts a human-readable amount to the smallest currency unit for Stripe.
 * For INR (and most currencies) multiplies by 100 to get paise/cents.
 * Zero-decimal currencies (e.g. JPY) are returned as-is.
 */
export function formatAmountForStripe(
  amount: number,
  currency: string
): number {
  const zeroCurrencies = [
    "bif",
    "clp",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ];

  if (zeroCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Check,
  MapPin,
  ShoppingBag,
  CreditCard,
  Tag,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { addressSchema, type AddressInput } from "@/lib/validations/order";
import { formatPrice } from "@/lib/utils";
import { INDIAN_STATES } from "@/types";
import type { CouponValidation } from "@/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const GST_RATE = 0.18;

type Step = 1 | 2 | 3;

// Step indicator component
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: "Address", icon: MapPin },
    { num: 2, label: "Review", icon: ShoppingBag },
    { num: 3, label: "Payment", icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((s, idx) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                step > s.num
                  ? "bg-nue-charcoal text-nue-cream"
                  : step === s.num
                  ? "bg-nue-gold text-white"
                  : "bg-nue-charcoal/8 text-nue-stone"
              }`}
            >
              {step > s.num ? (
                <Check className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
            </div>
            <span
              className={`text-xs tracking-widest uppercase hidden sm:block ${
                step === s.num ? "text-nue-charcoal font-medium" : "text-nue-stone"
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-colors ${
                step > s.num ? "bg-nue-charcoal" : "bg-nue-charcoal/15"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Payment form (Step 3) - must be inside <Elements>
function PaymentForm({
  clientSecret,
  orderId,
  total,
  onError,
}: {
  clientSecret: string;
  orderId: string;
  total: number;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsPaying(true);
    setCardError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setIsPaying(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      setCardError(error.message || "Payment failed. Please try again.");
      onError(error.message || "Payment failed.");
      setIsPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(`/checkout/success?order_id=${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal/70 mb-3">
          Card Details
        </p>
        <div className="p-4 border border-nue-charcoal/15 bg-white rounded-sm">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#2C2C2C",
                  fontFamily: "system-ui, sans-serif",
                  "::placeholder": { color: "#8C7B6B" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
        {cardError && (
          <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {cardError}
          </p>
        )}
      </div>

      <div className="bg-nue-cream/50 border border-nue-charcoal/8 p-4 text-xs text-nue-stone space-y-1">
        <p className="font-medium text-nue-charcoal">Secure Payment</p>
        <p>Your card details are encrypted and processed securely via Stripe.</p>
      </div>

      <button
        onClick={handlePay}
        disabled={isPaying || !stripe || !elements}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay {formatPrice(total)}
          </>
        )}
      </button>
    </div>
  );
}

// Main page
export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, clearCart, subtotal } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [shippingAddress, setShippingAddress] = useState<AddressInput | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<
    Array<AddressInput & { id: string; isDefault: boolean; label?: string }>
  >([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const subtotalAmount = subtotal();
  const discount = coupon?.discount ?? 0;
  const afterDiscount = subtotalAmount - discount;
  const shippingCost = afterDiscount > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = afterDiscount * GST_RATE;
  const total = afterDiscount + shippingCost + tax;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/addresses")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
            const def = data.find((a: { isDefault: boolean }) => a.isDefault);
            if (def) setSelectedSavedId(def.id);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // Prefill form when a saved address is selected
  const handleSelectSavedAddress = (addr: (typeof savedAddresses)[0]) => {
    setSelectedSavedId(addr.id);
    setValue("fullName", addr.fullName);
    setValue("phone", addr.phone);
    setValue("addressLine1", addr.addressLine1);
    setValue("addressLine2", addr.addressLine2 || "");
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("postalCode", addr.postalCode);
    setValue("country", addr.country);
  };

  const onAddressSubmit = (data: AddressInput) => {
    setShippingAddress(data);
    setStep(2);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal: subtotalAmount }),
      });
      const body: CouponValidation = await res.json();
      if (!res.ok || !body.valid) {
        setCouponError(body.message || "Invalid or expired coupon.");
        return;
      }
      setCoupon(body);
    } catch {
      setCouponError("Unable to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) return;
    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingAddress,
          couponCode: coupon?.code,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setOrderError(body.message || "Failed to place order. Please try again.");
        return;
      }

      setOrderId(body.orderId);
      setClientSecret(body.clientSecret);
      clearCart();
      setStep(3);
    } catch {
      setOrderError("Unable to place order. Please check your connection.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 text-center px-4">
        <ShoppingBag className="w-12 h-12 text-nue-stone mb-4" strokeWidth={1.2} />
        <h1 className="text-2xl font-serif text-nue-charcoal mb-3">Your bag is empty</h1>
        <Link
          href="/shop"
          className="inline-flex items-center px-8 py-3 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">Checkout</h1>
        </div>

        <StepIndicator step={step} />

        {/* ── STEP 1: Shipping Address ── */}
        {step === 1 && (
          <div className="max-w-xl">
            <h2 className="text-sm font-medium tracking-widest uppercase text-nue-charcoal mb-6">
              Shipping Address
            </h2>

            {/* Saved address selection */}
            {savedAddresses.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs text-nue-stone tracking-widest uppercase mb-3">
                  Saved Addresses
                </p>
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`w-full text-left p-4 border transition-colors ${
                      selectedSavedId === addr.id
                        ? "border-nue-gold bg-nue-cream/30"
                        : "border-nue-charcoal/12 hover:border-nue-charcoal/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-nue-charcoal">{addr.fullName}</p>
                        <p className="text-xs text-nue-stone mt-0.5">
                          {addr.addressLine1}, {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] tracking-widest uppercase bg-nue-charcoal text-white px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-nue-charcoal/8" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-xs text-nue-stone uppercase tracking-widest">
                      or enter a new address
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Full Name
                </label>
                <input
                  {...register("fullName")}
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                  placeholder="Jane Doe"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Phone
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Address Line 1
                </label>
                <input
                  {...register("addressLine1")}
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                  placeholder="House / Flat no., Street"
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-red-500">{errors.addressLine1.message}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Address Line 2{" "}
                  <span className="normal-case font-normal text-nue-stone">(optional)</span>
                </label>
                <input
                  {...register("addressLine2")}
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                  placeholder="Landmark, Area"
                />
              </div>

              {/* City + Postal Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                    City
                  </label>
                  <input
                    {...register("city")}
                    className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    placeholder="Mumbai"
                  />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                    Postal Code
                  </label>
                  <input
                    {...register("postalCode")}
                    className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                    placeholder="400001"
                    maxLength={6}
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-red-500">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  State
                </label>
                <select
                  {...register("state")}
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors bg-white appearance-none"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                  Country
                </label>
                <input
                  {...register("country")}
                  readOnly
                  className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm bg-nue-cream/30"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Continue to Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Order Review ── */}
        {step === 2 && shippingAddress && (
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-3 space-y-8">
              {/* Items */}
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-4">
                  Your Items ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-14 h-18 shrink-0 bg-nue-cream overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-nue-charcoal font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-nue-stone">
                          {[item.size, item.color].filter(Boolean).join(" · ")} · Qty:{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-nue-charcoal shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
                    Shipping To
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-nue-gold hover:text-nue-charcoal transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-nue-cream/30 border border-nue-charcoal/8 p-4 text-sm">
                  <p className="font-medium text-nue-charcoal">{shippingAddress.fullName}</p>
                  <p className="text-nue-stone mt-0.5">
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-nue-stone">
                    {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.postalCode}
                  </p>
                  <p className="text-nue-stone">{shippingAddress.phone}</p>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-3">
                  Coupon Code
                </h2>
                {coupon ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-medium">{coupon.code}</span>
                    <span>— {formatPrice(coupon.discount)} off</span>
                    <button
                      onClick={() => {
                        setCoupon(null);
                        setCouponCode("");
                      }}
                      className="ml-auto text-xs text-nue-stone hover:text-nue-charcoal"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon"
                      className="flex-1 px-3 py-2.5 border border-nue-charcoal/15 text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="px-4 py-2.5 bg-nue-charcoal text-white text-xs tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-2">
              <div className="bg-white border border-nue-charcoal/8 p-6 sticky top-24 space-y-4">
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal">
                  Order Total
                </h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-nue-charcoal/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotalAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-nue-charcoal/70">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-nue-charcoal/70">
                    <span>GST (18%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="pt-3 border-t border-nue-charcoal/8 flex justify-between font-semibold text-nue-charcoal text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {orderError}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-nue-stone hover:text-nue-charcoal transition-colors py-1"
                >
                  ← Back to Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && clientSecret && orderId && (
          <div className="max-w-md">
            <h2 className="text-sm font-medium tracking-widest uppercase text-nue-charcoal mb-6">
              Payment
            </h2>

            {paymentError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {paymentError}
              </div>
            )}

            <div className="bg-nue-cream/30 border border-nue-charcoal/8 p-4 mb-6 flex justify-between text-sm">
              <span className="text-nue-stone">Total to pay</span>
              <span className="font-semibold text-nue-charcoal">{formatPrice(total)}</span>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                orderId={orderId}
                total={total}
                onError={setPaymentError}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}

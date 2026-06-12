import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import { UpdateOrderStatus } from "@/components/admin/update-order-status";

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          variant: {
            select: { size: true, color: true },
          },
        },
      },
      shippingAddress: true,
      payment: true,
    },
  });
  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-zinc-900">
                Order #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <>
                  {" "}· Last updated{" "}
                  {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items Table */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-zinc-500" />
              <h2 className="font-semibold text-zinc-900">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">Variant</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const image = item.product.images[0];
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-zinc-100 hover:bg-zinc-50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                              {image ? (
                                <Image
                                  src={image.url}
                                  alt={item.product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover h-full w-full"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-zinc-300 text-xs">
                                  N/A
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-zinc-900 text-xs max-w-[160px] truncate">
                              {item.product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500 text-xs">
                          {item.variant ? (
                            <>
                              {item.variant.size && (
                                <span className="mr-1">{item.variant.size}</span>
                              )}
                              {item.variant.color && (
                                <span>{item.variant.color}</span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-zinc-700">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3.5 text-right text-zinc-700">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-zinc-900">
                          ₹
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-zinc-100 px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {order.discountAmount && Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      −₹{Number(order.discountAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Shipping</span>
                  <span>
                    {Number(order.shippingAmount) === 0
                      ? "Free"
                      : `₹${Number(order.shippingAmount).toLocaleString("en-IN")}`}
                  </span>
                </div>
                {order.taxAmount && Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Tax (GST)</span>
                    <span>
                      ₹{Number(order.taxAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <UpdateOrderStatus
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingNumber={order.trackingNumber ?? ""}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              Customer
            </h2>
            <div className="space-y-2.5">
              <div>
                <p className="font-medium text-zinc-900">
                  {order.user?.name ?? "Guest"}
                </p>
              </div>
              {order.user?.email && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <a
                    href={`mailto:${order.user.email}`}
                    className="hover:text-zinc-900 transition-colors"
                  >
                    {order.user.email}
                  </a>
                </div>
              )}
              {order.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  {order.user.phone}
                </div>
              )}
              {order.user && (
                <div className="pt-2 border-t border-zinc-100 mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-400">Total Orders</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">
                      {order.user._count.orders}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Member Since</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">
                      {new Date(order.user.createdAt).toLocaleDateString(
                        "en-IN",
                        { month: "short", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
              )}
              {order.user && (
                <Link href={`/admin/customers/${order.user.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Customer
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
              <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-500" />
                Shipping Address
              </h2>
              <div className="text-sm text-zinc-600 space-y-0.5">
                <p className="font-medium text-zinc-900">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="pt-1 text-zinc-500">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
              <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-zinc-500" />
                Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method</span>
                  <span className="font-medium text-zinc-900">
                    {order.payment.method ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-medium text-zinc-900">
                    ₹{Number(order.payment.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Status</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                {order.payment.razorpayOrderId && (
                  <div className="pt-2 border-t border-zinc-100">
                    <p className="text-zinc-400 text-xs">Razorpay Order ID</p>
                    <p className="font-mono text-xs text-zinc-700 mt-0.5 break-all">
                      {order.payment.razorpayOrderId}
                    </p>
                  </div>
                )}
                {order.payment.razorpayPaymentId && (
                  <div>
                    <p className="text-zinc-400 text-xs">Payment ID</p>
                    <p className="font-mono text-xs text-zinc-700 mt-0.5 break-all">
                      {order.payment.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
              <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-zinc-500" />
                Tracking
              </h2>
              <p className="font-mono text-sm text-zinc-700">
                {order.trackingNumber}
              </p>
            </div>
          )}

          {/* Coupon */}
          {order.couponCode && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-600 font-medium">Coupon Applied</p>
              <p className="font-mono font-bold text-amber-800 mt-0.5">
                {order.couponCode}
              </p>
              {order.discountAmount && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Saved ₹{Number(order.discountAmount).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Users icon since it needs to be server-renderable
function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

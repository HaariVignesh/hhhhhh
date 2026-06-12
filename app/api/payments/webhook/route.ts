export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;
        const { orderId, userId } = pi.metadata;

        if (!orderId) break;

        // Update order paymentStatus=PAID, status=CONFIRMED
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paidAt: new Date(),
          },
          include: {
            items: {
              include: { variant: true },
            },
            user: { select: { name: true, email: true } },
          },
        });

        // Upsert Payment record with status PAID
        await prisma.payment.upsert({
          where: { orderId },
          update: {
            status: "PAID",
            stripePaymentIntentId: pi.id,
            amount: order.total,
            currency: "INR",
            paidAt: new Date(),
          },
          create: {
            orderId,
            stripePaymentIntentId: pi.id,
            amount: order.total,
            currency: "INR",
            status: "PAID",
            paidAt: new Date(),
          },
        });

        // Decrement variant stock and increment product soldCount for each order item
        for (const item of order.items) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          await prisma.product.update({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } },
          });
        }

        // Send order confirmation email
        if (order.user?.email) {
          await sendOrderConfirmationEmail(
            order.user.email,
            order.user.name ?? "Customer",
            order.orderNumber,
            Number(order.total)
          ).catch((err) =>
            console.error("[WEBHOOK] Email send failed:", err)
          );
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const { orderId } = pi.metadata ?? {};

        if (!orderId) break;

        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });

        await prisma.payment.upsert({
          where: { orderId },
          update: {
            status: "FAILED",
            stripePaymentIntentId: pi.id,
          },
          create: {
            orderId,
            stripePaymentIntentId: pi.id,
            amount: 0,
            currency: "INR",
            status: "FAILED",
          },
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent as string;

        if (!paymentIntentId) break;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "REFUNDED", refundId: charge.id },
          });

          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: "REFUNDED",
              status: "CANCELLED",
            },
          });
        }

        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[WEBHOOK] Error handling event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

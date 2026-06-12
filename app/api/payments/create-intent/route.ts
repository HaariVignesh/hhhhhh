import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { stripe, formatAmountForStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(Number(order.total), "inr"),
      currency: "inr",
      metadata: {
        orderId,
        userId: session.user.id!,
        orderNumber: order.orderNumber,
      },
    });

    // Update order with stripePaymentIntentId
    await prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    // Create or update Payment record
    await prisma.payment.upsert({
      where: { orderId },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        amount: order.total,
        currency: "INR",
        status: "PENDING",
      },
      create: {
        orderId,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.total,
        currency: "INR",
        status: "PENDING",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("[PAYMENTS_CREATE_INTENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

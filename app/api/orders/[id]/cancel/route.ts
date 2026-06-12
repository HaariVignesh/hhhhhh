import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { cancelReason } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled in status: ${order.status}` },
        { status: 400 }
      );
    }

    // If paid, attempt Stripe refund
    let refundId: string | undefined;
    if (order.paymentStatus === "PAID" && order.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error("[ORDER_CANCEL] Stripe refund failed:", stripeError);
        return NextResponse.json(
          { error: "Refund initiation failed. Please contact support." },
          { status: 502 }
        );
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: cancelReason ?? null,
          ...(order.paymentStatus === "PAID" && { paymentStatus: "REFUNDED" }),
        },
      });

      if (refundId && order.payment) {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: "REFUNDED", refundId },
        });
      }

      return cancelled;
    });

    return NextResponse.json({ data: updatedOrder });
  } catch (error) {
    console.error("[ORDER_CANCEL]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const TAX_RATE = 0.18; // 18% GST
const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const FREE_SHIPPING = 0;

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(6, "Valid postal code required"),
  country: z.string().default("IN"),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, shippingAddress, billingAddress, couponCode } = parsed.data;

    // Validate stock and fetch variant/product data
    const variantIds = items.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: { id: true, name: true, price: true, isActive: true },
        },
      },
    });

    if (variants.length !== items.length) {
      return NextResponse.json(
        { error: "One or more product variants not found" },
        { status: 404 }
      );
    }

    const stockErrors: string[] = [];
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        stockErrors.push(`Variant ${item.variantId} not found`);
        continue;
      }
      if (!variant.product.isActive) {
        stockErrors.push(`${variant.product.name} is no longer available`);
        continue;
      }
      if (variant.stock < item.quantity) {
        stockErrors.push(
          `Insufficient stock for ${variant.product.name}${variant.size ? ` (Size: ${variant.size})` : ""}. Available: ${variant.stock}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({ error: "Stock validation failed", details: stockErrors }, { status: 409 });
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unitPrice = variant.price ?? variant.product.price;
      subtotal += unitPrice * item.quantity;
      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    // Apply coupon if provided
    let discount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      if (!coupon.isActive) {
        return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return NextResponse.json(
          { error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` },
          { status: 400 }
        );
      }

      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else if (coupon.type === "FIXED") {
        discount = Math.min(coupon.value, subtotal);
      }

      couponId = coupon.id;
    }

    const discountedSubtotal = subtotal - discount;
    const shippingCost = discountedSubtotal >= SHIPPING_THRESHOLD ? FREE_SHIPPING : SHIPPING_COST;
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + shippingCost + tax;

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user.id!,
          subtotal,
          discount,
          tax,
          shippingCost,
          total,
          couponId,
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress ?? shippingAddress) as any,
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Increment coupon usage count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Stripe expects paise for INR
        currency: "inr",
        metadata: {
          orderId: order.id,
          userId: session.user.id!,
        },
      });

      // Update order with Stripe payment intent ID
      await tx.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      return { orderId: order.id, clientSecret: paymentIntent.client_secret };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

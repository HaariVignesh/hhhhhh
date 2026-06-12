import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const skip = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    const where = {
      productId,
      ...(isAdmin ? {} : { isApproved: true }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      data: reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId, rating, title, body: reviewBody } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "productId and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check no existing review by this user for this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: session.user.id! },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    // Check if user has ordered this product to set isVerified
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id!,
          paymentStatus: "PAID",
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id!,
        rating,
        title: title ?? null,
        body: reviewBody ?? null,
        isVerified: !!verifiedPurchase,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    // Recalculate product avgRating and reviewCount
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("[REVIEWS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

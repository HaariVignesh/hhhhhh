import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id! },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: session.user.id!, productId } },
      update: {},
      create: { userId: session.user.id!, productId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true } },
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("[WISHLIST_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Support productId from query string or request body
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");

    if (!productId) {
      try {
        const body = await req.json();
        productId = body.productId ?? null;
      } catch {
        // no body
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await prisma.wishlist.deleteMany({
      where: { userId: session.user.id!, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

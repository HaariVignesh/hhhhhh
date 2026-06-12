import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            items: { select: { quantity: true } },
            payment: { select: { status: true, amount: true } },
          },
        },
        addresses: true,
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });

    if (!user)
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[ADMIN_CUSTOMER_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

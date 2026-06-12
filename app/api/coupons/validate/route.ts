import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "code and subtotal are required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive)
      return NextResponse.json({ valid: false, message: "Invalid coupon code" });

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt)
      return NextResponse.json({ valid: false, message: "Coupon not yet active" });
    if (coupon.expiresAt && now > coupon.expiresAt)
      return NextResponse.json({ valid: false, message: "Coupon has expired" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json({ valid: false, message: "Coupon usage limit reached" });
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount))
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount ₹${coupon.minOrderAmount}`,
      });

    let discount =
      coupon.type === "PERCENTAGE"
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);

    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discount: Math.round(discount),
    });
  } catch (error) {
    console.error("[COUPONS_VALIDATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

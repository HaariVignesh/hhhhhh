import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id! },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    console.error("[ADDRESSES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = "IN",
      isDefault = false,
    } = body;

    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: "name, phone, addressLine1, city, state, and postalCode are required" },
        { status: 400 }
      );
    }

    const userId = session.user.id!;

    // If this is the default address, unset others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        phone,
        addressLine1,
        addressLine2: addressLine2 ?? null,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
    });

    return NextResponse.json({ data: address }, { status: 201 });
  } catch (error) {
    console.error("[ADDRESSES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

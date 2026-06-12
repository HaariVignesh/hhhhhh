import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id!;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    if (existing.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { isDefault, ...rest } = body;

    // If setting as default, unset all others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...rest,
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ data: address });
  } catch (error) {
    console.error("[ADDRESS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id!;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    if (existing.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADDRESS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

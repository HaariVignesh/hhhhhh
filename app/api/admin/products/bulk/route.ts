import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type BulkAction = "activate" | "deactivate" | "delete" | "feature";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { ids, action }: { ids: string[]; action: BulkAction } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }

    const validActions: BulkAction[] = ["activate", "deactivate", "delete", "feature"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `action must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    let affected = 0;

    switch (action) {
      case "activate": {
        const result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        affected = result.count;
        break;
      }
      case "deactivate": {
        const result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        affected = result.count;
        break;
      }
      case "feature": {
        const result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: true },
        });
        affected = result.count;
        break;
      }
      case "delete": {
        const result = await prisma.product.deleteMany({
          where: { id: { in: ids } },
        });
        affected = result.count;
        break;
      }
    }

    return NextResponse.json({ affected });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_BULK]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

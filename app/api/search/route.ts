import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const results = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        images: { where: { isPrimary: true } },
        category: { select: { name: true } },
      },
      take: 6,
      orderBy: { soldCount: "desc" },
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Last 6 months date range
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      revenueAgg,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      topProducts,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      prevMonthRevenue,
      currentMonthRevenue,
    ] = await Promise.all([
      // Total revenue (all time)
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      // Total orders
      prisma.order.count(),
      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // Total active products
      prisma.product.count({ where: { isActive: true } }),
      // Recent 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      // Top 5 products by soldCount
      prisma.product.findMany({
        take: 5,
        orderBy: { soldCount: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      // Orders by status counts
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      // Previous month revenue
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
      // Current month revenue
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    // Revenue by month for last 6 months
    const revenueByMonth = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        status: "PAID",
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
    });

    // Aggregate revenue per month
    const monthlyRevenue: Record<string, number> = {};
    for (const row of revenueByMonth) {
      const d = new Date(row.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + Number(row._sum.amount ?? 0);
    }

    // Build ordered array for last 6 months
    const revenueChart = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: d.toLocaleString("default", { month: "short", year: "numeric" }),
        revenue: monthlyRevenue[key] ?? 0,
      };
    });

    const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
    const prevRevenue = Number(prevMonthRevenue._sum.amount ?? 0);
    const currRevenue = Number(currentMonthRevenue._sum.amount ?? 0);
    const revenueGrowth =
      prevRevenue > 0
        ? (((currRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
        : null;

    return NextResponse.json({
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          currentMonthRevenue: currRevenue,
          prevMonthRevenue: prevRevenue,
          revenueGrowth,
        },
        recentOrders,
        topProducts,
        ordersByStatus: {
          PENDING: pendingCount,
          CONFIRMED: confirmedCount,
          PROCESSING: processingCount,
          SHIPPED: shippedCount,
          DELIVERED: deliveredCount,
          CANCELLED: cancelledCount,
        },
        revenueChart,
      },
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

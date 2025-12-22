'use server';

import { prisma } from '@/db/prisma';
import { requireAdmin } from '@/lib/admin-check';

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
};

export type MonthlySalesData = {
  month: string;
  sales: number;
};

export type RecentOrder = {
  id: string;
  createdAt: Date;
  totalPrice: number | string;
  isPaid: boolean;
  isDelivered: boolean;
  user: {
    name: string;
    email: string;
  } | null;
};

/**
 * Get dashboard statistics
 */
export async function getDashboardStatsAction(): Promise<DashboardStats> {
  try {
    await requireAdmin();

    // Get current date and first day of current/previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all stats in parallel
    const [
      totalRevenueResult,
      currentMonthRevenue,
      previousMonthRevenue,
      totalOrders,
      currentMonthOrders,
      previousMonthOrders,
      totalProducts,
      totalCustomers,
    ] = await Promise.all([
      // Total revenue from paid orders
      prisma.order.aggregate({
        where: { isPaid: true },
        _sum: { totalPrice: true },
      }),
      // Current month revenue
      prisma.order.aggregate({
        where: {
          isPaid: true,
          createdAt: { gte: currentMonthStart },
        },
        _sum: { totalPrice: true },
      }),
      // Previous month revenue
      prisma.order.aggregate({
        where: {
          isPaid: true,
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: { totalPrice: true },
      }),
      // Total orders
      prisma.order.count(),
      // Current month orders
      prisma.order.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      // Previous month orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
      // Total products
      prisma.product.count(),
      // Total customers (users)
      prisma.user.count(),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.totalPrice || 0);
    const currentRevenue = Number(currentMonthRevenue._sum.totalPrice || 0);
    const prevRevenue = Number(previousMonthRevenue._sum.totalPrice || 0);

    // Calculate growth percentages
    const revenueGrowth =
      prevRevenue > 0
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
        : currentRevenue > 0
        ? 100
        : 0;

    const ordersGrowth =
      previousMonthOrders > 0
        ? Math.round(
            ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
              100
          )
        : currentMonthOrders > 0
        ? 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueGrowth,
      ordersGrowth,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
    };
  }
}

/**
 * Get monthly sales data for chart
 */
export async function getMonthlySalesAction(): Promise<MonthlySalesData[]> {
  try {
    await requireAdmin();

    const now = new Date();
    const monthsData: MonthlySalesData[] = [];

    // Get data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const result = await prisma.order.aggregate({
        where: {
          isPaid: true,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { totalPrice: true },
      });

      const monthName = monthStart.toLocaleDateString('en-US', {
        month: 'short',
      });

      monthsData.push({
        month: monthName,
        sales: Number(result._sum.totalPrice || 0),
      });
    }

    return monthsData;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    return [];
  }
}

/**
 * Get recent orders for dashboard
 */
export async function getRecentOrdersAction(
  limit: number = 5
): Promise<RecentOrder[]> {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      totalPrice: Number(order.totalPrice),
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      user: order.user,
    }));
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
}

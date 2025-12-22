'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-check';

type ActionResult = { success: true } | { error: string };

type PaginatedOrdersResult = {
  orders: Awaited<ReturnType<typeof getOrdersFromDb>>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

async function getOrdersFromDb(
  skip: number,
  take: number,
  filter?: { isPaid?: boolean; isDelivered?: boolean },
  search?: string
) {
  const where: Prisma.OrderWhereInput = {};

  if (filter?.isPaid !== undefined) {
    where.isPaid = filter.isPaid;
  }
  if (filter?.isDelivered !== undefined) {
    where.isDelivered = filter.isDelivered;
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });
}

/**
 * Get paginated orders for admin
 */
export async function getAdminOrdersAction(
  page: number = 1,
  limit: number = 20,
  filter?: { status?: string },
  search?: string
): Promise<PaginatedOrdersResult> {
  try {
    await requireAdmin();

    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.max(1, Math.min(100, limit));
    const skip = (currentPage - 1) * itemsPerPage;

    // Parse filter
    let filterQuery: { isPaid?: boolean; isDelivered?: boolean } | undefined;
    if (filter?.status) {
      switch (filter.status) {
        case 'paid':
          filterQuery = { isPaid: true };
          break;
        case 'unpaid':
          filterQuery = { isPaid: false };
          break;
        case 'delivered':
          filterQuery = { isDelivered: true };
          break;
        case 'pending':
          filterQuery = { isDelivered: false };
          break;
      }
    }

    // Build where clause for count
    const countWhere: Prisma.OrderWhereInput = {};

    if (filterQuery?.isPaid !== undefined) countWhere.isPaid = filterQuery.isPaid;
    if (filterQuery?.isDelivered !== undefined) countWhere.isDelivered = filterQuery.isDelivered;

    if (search) {
      countWhere.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      getOrdersFromDb(skip, itemsPerPage, filterQuery, search),
      prisma.order.count({ where: countWhere }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      orders,
      currentPage,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return {
      orders: [],
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
    };
  }
}

/**
 * Delete an order (admin only)
 */
export async function deleteOrderAction(orderId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    // Delete the order (cascade will delete order items)
    await prisma.order.delete({
      where: { id: orderId },
    });

    console.log(`Order ${orderId} deleted by admin`);

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { error: 'Failed to delete order' };
  }
}

/**
 * Mark Cash on Delivery order as paid and delivered (admin only)
 */
export async function markOrderAsPaidAndDeliveredAction(
  orderId: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    // Get the order first
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    // Check if it's a Cash on Delivery order
    if (order.paymentMethod !== 'Cash on Delivery') {
      return { error: 'This action is only for Cash on Delivery orders' };
    }

    // Update the order
    const now = new Date();
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: now,
        isDelivered: true,
        deliveredAt: now,
      },
    });

    console.log(`Order ${orderId} marked as paid and delivered by admin`);

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { error: 'Failed to update order status' };
  }
}

/**
 * Mark order as delivered only (admin only)
 */
export async function markOrderAsDeliveredAction(
  orderId: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    console.log(`Order ${orderId} marked as delivered by admin`);

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    return { error: 'Failed to mark order as delivered' };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { updateProfileSchema, UpdateProfileInput } from '@/lib/schemas/profile';

type ActionResult = { success: true } | { error: string };

// Pagination types
type PaginatedOrdersResult = {
  orders: Awaited<ReturnType<typeof getOrdersFromDb>>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

async function getOrdersFromDb(userId: string, skip: number, take: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      items: true,
    },
  });
}

/**
 * Get paginated orders for the current user
 */
export async function getUserOrdersPaginatedAction(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedOrdersResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        orders: [],
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
      };
    }

    // Ensure valid pagination values
    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.max(1, Math.min(50, limit));
    const skip = (currentPage - 1) * itemsPerPage;

    // Get orders and total count in parallel
    const [orders, totalCount] = await Promise.all([
      getOrdersFromDb(session.user.id, skip, itemsPerPage),
      prisma.order.count({ where: { userId: session.user.id } }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      orders,
      currentPage,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return {
      orders: [],
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
    };
  }
}

/**
 * Update user profile (name)
 */
export async function updateProfileAction(
  data: UpdateProfileInput
): Promise<ActionResult & { name?: string }> {
  try {
    // Validate input
    const validatedData = updateProfileSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to update your profile' };
    }

    // Update user's name in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.data.name,
      },
      select: {
        name: true,
      },
    });

    revalidatePath('/user/profile');
    revalidatePath('/');
    return { success: true, name: updatedUser.name };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}

/**
 * Get current user profile data
 */
export async function getUserProfileAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

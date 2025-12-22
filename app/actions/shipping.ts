'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { shippingAddressSchema, ShippingAddress } from '@/lib/schemas/shipping';

type ActionResult = { success: true } | { error: string };

/**
 * Save or update the user's shipping address
 */
export async function saveShippingAddressAction(
  data: ShippingAddress
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = shippingAddressSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to save a shipping address' };
    }

    // Update user's address
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        address: validatedData.data,
      },
    });

    revalidatePath('/checkout/shipping');
    return { success: true };
  } catch (error) {
    console.error('Error saving shipping address:', error);
    return { error: 'Failed to save shipping address' };
  }
}

/**
 * Get the user's shipping address
 */
export async function getShippingAddressAction(): Promise<ShippingAddress | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { address: true },
    });

    if (!user?.address) {
      return null;
    }

    // Validate the stored address matches our schema
    const result = shippingAddressSchema.safeParse(user.address);
    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error('Error getting shipping address:', error);
    return null;
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { paymentMethodSchema, PaymentMethod } from '@/lib/schemas/payment';

type ActionResult = { success: true } | { error: string };

/**
 * Save the user's selected payment method
 */
export async function savePaymentMethodAction(
  paymentMethod: PaymentMethod
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = paymentMethodSchema.safeParse({ paymentMethod });
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to save a payment method' };
    }

    // Update user's payment method
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        paymentMethod: validatedData.data.paymentMethod,
      },
    });

    revalidatePath('/checkout/payment');
    return { success: true };
  } catch (error) {
    console.error('Error saving payment method:', error);
    return { error: 'Failed to save payment method' };
  }
}

/**
 * Get the user's saved payment method
 */
export async function getPaymentMethodAction(): Promise<PaymentMethod | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paymentMethod: true },
    });

    if (!user?.paymentMethod) {
      return null;
    }

    // Validate the stored payment method
    const result = paymentMethodSchema.safeParse({
      paymentMethod: user.paymentMethod,
    });
    if (result.success) {
      return result.data.paymentMethod;
    }

    return null;
  } catch (error) {
    console.error('Error getting payment method:', error);
    return null;
  }
}

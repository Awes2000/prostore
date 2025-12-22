'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { getCart } from '@/lib/cart';
import { shippingAddressSchema, ShippingAddress } from '@/lib/schemas/shipping';
import { paymentMethodSchema, PaymentMethod } from '@/lib/schemas/payment';
import { calculateOrderPrices } from '@/lib/schemas/order';

type CreateOrderResult = { success: true; orderId: string } | { error: string };

/**
 * Create a new order from the user's cart
 */
export async function createOrderAction(): Promise<CreateOrderResult> {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to place an order' };
    }

    // Get user with address and payment method
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        address: true,
        paymentMethod: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Validate shipping address
    if (!user.address) {
      return { error: 'Please add a shipping address' };
    }

    const addressResult = shippingAddressSchema.safeParse(user.address);
    if (!addressResult.success) {
      return { error: 'Invalid shipping address' };
    }

    // Validate payment method
    if (!user.paymentMethod) {
      return { error: 'Please select a payment method' };
    }

    const paymentResult = paymentMethodSchema.safeParse({
      paymentMethod: user.paymentMethod,
    });
    if (!paymentResult.success) {
      return { error: 'Invalid payment method' };
    }

    // Get cart with items
    const cart = await getCart();
    if (!cart || cart.items.length === 0) {
      return { error: 'Your cart is empty' };
    }

    // Prepare order items with current product data (snapshots)
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      image: item.product.images[0] || '',
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    // Calculate prices
    const prices = calculateOrderPrices(orderItems);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          shippingAddress: addressResult.data,
          paymentMethod: paymentResult.data.paymentMethod,
          itemsPrice: prices.itemsPrice,
          shippingPrice: prices.shippingPrice,
          taxPrice: prices.taxPrice,
          totalPrice: prices.totalPrice,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    revalidatePath('/');
    revalidatePath('/cart');
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { error: 'Failed to create order' };
  }
}

/**
 * Get an order by ID
 */
export async function getOrderByIdAction(orderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Verify the order belongs to the current user
    if (!order || order.userId !== session.user.id) {
      return null;
    }

    return order;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

/**
 * Get all orders for the current user
 */
export async function getUserOrdersAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

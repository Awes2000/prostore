'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';
import { getOrCreateCart, getCart } from '@/lib/cart';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from '@/lib/schemas/cart';

type ActionResult = { success: true } | { error: string };

/**
 * Add a product to the cart
 */
export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = addToCartSchema.safeParse({ productId, quantity });
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    // Check stock
    if (product.stock < quantity) {
      return { error: 'Not enough stock available' };
    }

    // Get or create cart
    const cart = await getOrCreateCart();

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check max quantity
      if (newQuantity > 99) {
        return { error: 'Maximum quantity (99) exceeded' };
      }

      // Check stock
      if (newQuantity > product.stock) {
        return { error: 'Not enough stock available' };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { error: 'Failed to add item to cart' };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = updateCartItemSchema.safeParse({ cartItemId, quantity });
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem) {
      return { error: 'Cart item not found' };
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Check stock
      if (quantity > cartItem.product.stock) {
        return { error: 'Not enough stock available' };
      }

      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { error: 'Failed to update cart item' };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCartAction(
  cartItemId: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = removeCartItemSchema.safeParse({ cartItemId });
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { error: 'Failed to remove item from cart' };
  }
}

/**
 * Clear all items from cart
 */
export async function clearCartAction(): Promise<ActionResult> {
  try {
    const cart = await getCart();

    if (!cart) {
      return { error: 'Cart not found' };
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { error: 'Failed to clear cart' };
  }
}

import { prisma } from '@/db/prisma';
import { getCartSessionId, getOrCreateCartSessionId } from '@/lib/cart-cookies';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// Re-export utility functions for convenience
export { calculateItemTotal, formatPrice } from '@/lib/cart-utils';

// Type for cart with items and products
export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

// Type for cart item with product
export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: true;
  };
}>;

/**
 * Get cart for the current session/user (read-only, safe for server components)
 */
export async function getCart(): Promise<CartWithItems | null> {
  const sessionId = await getCartSessionId();

  // No session cookie exists yet, so no cart
  if (!sessionId) {
    return null;
  }

  const session = await auth();
  const userId = session?.user?.id;

  // Find cart by session ID
  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Note: We don't update the cart with userId here to avoid cookie modifications
  // That should be done in getOrCreateCart which is called from server actions

  return cart;
}

/**
 * Get or create a cart (for server actions only - may set cookies)
 */
export async function getOrCreateCart(): Promise<CartWithItems> {
  // Use getOrCreateCartSessionId which will create a cookie if needed
  const sessionId = await getOrCreateCartSessionId();
  const session = await auth();
  const userId = session?.user?.id;

  // First try to find existing cart
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // If user is logged in and cart exists but doesn't have userId, update it
  if (cart && userId && !cart.userId) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  // Create new cart if none exists
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        sessionId,
        userId: userId || null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  return cart;
}

/**
 * Get the total count of items in the cart
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();

  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get the total price of items in the cart
 */
export async function getCartTotal(): Promise<number> {
  const cart = await getCart();

  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity;
  }, 0);
}

/**
 * Check if a product is already in the cart
 */
export async function isProductInCart(productId: string): Promise<boolean> {
  const cart = await getCart();

  if (!cart) {
    return false;
  }

  return cart.items.some((item) => item.productId === productId);
}

/**
 * Get quantity of a specific product in cart
 */
export async function getProductQuantityInCart(productId: string): Promise<number> {
  const cart = await getCart();

  if (!cart) {
    return 0;
  }

  const item = cart.items.find((item) => item.productId === productId);
  return item?.quantity || 0;
}

import { z } from 'zod';

// Schema for adding item to cart
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be 0 or greater')
    .max(99, 'Quantity cannot exceed 99'),
});

// Schema for removing item from cart
export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID'),
});

// Types inferred from schemas
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;

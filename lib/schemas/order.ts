import { z } from 'zod';
import { shippingAddressSchema } from './shipping';
import { PAYMENT_METHODS } from './payment';

// Order item schema for validation
export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  name: z.string().min(1, 'Product name is required'),
  image: z.string().min(1, 'Product image is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Order schema for validation
export const orderSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(PAYMENT_METHODS),
  itemsPrice: z.number().nonnegative('Items price must be non-negative'),
  shippingPrice: z.number().nonnegative('Shipping price must be non-negative'),
  taxPrice: z.number().nonnegative('Tax price must be non-negative'),
  totalPrice: z.number().nonnegative('Total price must be non-negative'),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
});

// Type for creating an order
export type CreateOrderInput = z.infer<typeof orderSchema>;

// Type for order item
export type OrderItemInput = z.infer<typeof orderItemSchema>;

// Shipping price constants
export const SHIPPING_PRICE_THRESHOLD = 100;
export const SHIPPING_PRICE_BELOW_THRESHOLD = 10;
export const SHIPPING_PRICE_FREE = 0;

// Tax rate (15%)
export const TAX_RATE = 0.15;

/**
 * Calculate order prices based on cart items
 */
export function calculateOrderPrices(items: { price: number; quantity: number }[]) {
  // Calculate items price
  const itemsPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Round to 2 decimal places
  const roundedItemsPrice = Math.round(itemsPrice * 100) / 100;

  // Calculate shipping price
  const shippingPrice =
    roundedItemsPrice >= SHIPPING_PRICE_THRESHOLD
      ? SHIPPING_PRICE_FREE
      : SHIPPING_PRICE_BELOW_THRESHOLD;

  // Calculate tax price (15% of items price)
  const taxPrice = Math.round(roundedItemsPrice * TAX_RATE * 100) / 100;

  // Calculate total price
  const totalPrice =
    Math.round((roundedItemsPrice + shippingPrice + taxPrice) * 100) / 100;

  return {
    itemsPrice: roundedItemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
}

import { z } from 'zod';

// Payment method options
export const PAYMENT_METHODS = ['PayPal', 'Stripe', 'Cash on Delivery'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Payment method schema
export const paymentMethodSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: 'Please select a valid payment method',
  }),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

// Default payment method
export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'PayPal';

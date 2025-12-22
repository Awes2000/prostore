import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .length(2, 'State must be exactly 2 characters (e.g., CA, NY)'),
  postalCode: z
    .string()
    .min(5, 'Postal code must be at least 5 characters')
    .max(10, 'Postal code must be less than 10 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Postal code must be alphanumeric'),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .default('US'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

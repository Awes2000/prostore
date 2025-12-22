import { z } from 'zod';

// Profile update schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

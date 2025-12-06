import { z } from 'zod';
import { insertProductSchema } from '@/lib/validators';

// Product type inferred from Zod schema with additional fields
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};

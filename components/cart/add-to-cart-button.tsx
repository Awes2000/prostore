'use client';

import { useState, useTransition } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  addToCartAction,
  updateCartItemQuantity,
} from '@/app/actions/cart';

type AddToCartButtonProps = {
  productId: string;
  stock: number;
  cartItemId?: string;
  initialQuantity?: number;
};

export default function AddToCartButton({
  productId,
  stock,
  cartItemId,
  initialQuantity = 0,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(productId, 1);
      if ('error' in result) {
        setError(result.error);
      } else {
        setQuantity(1);
      }
    });
  };

  const handleIncrement = () => {
    if (!cartItemId) return;
    if (quantity >= 99) {
      setError('Maximum quantity (99) reached');
      return;
    }
    if (quantity >= stock) {
      setError('Not enough stock available');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(cartItemId, quantity + 1);
      if ('error' in result) {
        setError(result.error);
      } else {
        setQuantity((prev) => prev + 1);
      }
    });
  };

  const handleDecrement = () => {
    if (!cartItemId) return;

    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(cartItemId, quantity - 1);
      if ('error' in result) {
        setError(result.error);
      } else {
        setQuantity((prev) => prev - 1);
      }
    });
  };

  // Product is out of stock
  if (stock === 0) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  // Show Add to Cart button when item is not in cart
  if (quantity === 0) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleAddToCart}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Add to Cart'
          )}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Show quantity controls when item is in cart
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>
        <span className="w-12 text-center font-semibold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={isPending || quantity >= 99 || quantity >= stock}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}

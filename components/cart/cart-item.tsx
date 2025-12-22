'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateCartItemQuantity, removeFromCartAction } from '@/app/actions/cart';

// Inline utility functions to avoid importing server-only code
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function calculateItemTotal(price: number | string, quantity: number): number {
  return Number(price) * quantity;
}

// Type for cart item with product (serialized from server)
type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: number;
    images: string[];
    stock: number;
  };
};

type CartItemProps = {
  item: CartItemWithProduct;
};

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = () => {
    if (quantity >= 99) {
      setError('Maximum quantity (99) reached');
      return;
    }
    if (quantity >= item.product.stock) {
      setError('Not enough stock available');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity + 1);
      if ('error' in result) {
        setError(result.error);
      } else {
        setQuantity((prev) => prev + 1);
      }
    });
  };

  const handleDecrement = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity - 1);
      if ('error' in result) {
        setError(result.error);
      } else {
        setQuantity((prev) => prev - 1);
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeFromCartAction(item.id);
      if ('error' in result) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Product Image */}
      <Link href={`/product/${item.product.slug}`} className="shrink-0">
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          width={100}
          height={100}
          className="rounded-md object-cover"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <Link
          href={`/product/${item.product.slug}`}
          className="font-semibold hover:underline"
        >
          {item.product.name}
        </Link>

        <p className="text-sm text-muted-foreground">{item.product.brand}</p>

        <p className="font-medium">
          {formatPrice(item.product.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={isPending || quantity >= 99 || quantity >= item.product.stock}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-semibold">
          {formatPrice(calculateItemTotal(item.product.price, quantity))}
        </p>
      </div>
    </div>
  );
}

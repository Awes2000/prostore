'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format-currency';
import { updateCartItemQuantity, removeFromCartAction } from '@/app/actions/cart';

// Serialized cart item type (from server)
type SerializedCartItem = {
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

type CartTableProps = {
  items: SerializedCartItem[];
};

function CartTableRow({ item }: { item: SerializedCartItem }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = () => {
    if (quantity >= 99 || quantity >= item.product.stock) return;

    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity + 1);
      if (!('error' in result)) {
        setQuantity((prev) => prev + 1);
      }
    });
  };

  const handleDecrement = () => {
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity - 1);
      if (!('error' in result)) {
        setQuantity((prev) => prev - 1);
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCartAction(item.id);
    });
  };

  const subtotal = item.product.price * quantity;

  return (
    <TableRow>
      {/* Product with Image */}
      <TableCell>
        <Link
          href={`/product/${item.product.slug}`}
          className="flex items-center gap-3"
        >
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            width={64}
            height={64}
            className="rounded-md object-cover"
          />
          <div className="hidden sm:block">
            <p className="font-medium">{item.product.name}</p>
            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
          </div>
        </Link>
      </TableCell>

      {/* Price */}
      <TableCell className="hidden md:table-cell">
        {formatCurrency(item.product.price)}
      </TableCell>

      {/* Quantity */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </Button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={isPending || quantity >= 99 || quantity >= item.product.stock}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        </div>
      </TableCell>

      {/* Subtotal */}
      <TableCell className="font-medium">
        {formatCurrency(subtotal)}
      </TableCell>

      {/* Actions */}
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
}

export default function CartTable({ items }: CartTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="hidden md:table-cell">Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <CartTableRow key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
}

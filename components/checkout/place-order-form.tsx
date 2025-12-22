'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createOrderAction } from '@/app/actions/order';
import { useState } from 'react';

export default function PlaceOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = () => {
    setError(null);

    startTransition(async () => {
      const result = await createOrderAction();
      if ('error' in result) {
        setError(result.error);
      } else {
        router.push(`/orders/${result.orderId}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      <Button
        onClick={handlePlaceOrder}
        className="w-full"
        size="lg"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Place Order
          </>
        )}
      </Button>
    </div>
  );
}

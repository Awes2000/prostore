'use client';

import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearCartAction } from '@/app/actions/cart';

export default function ClearCartButton() {
  const [isPending, startTransition] = useTransition();

  const handleClearCart = () => {
    startTransition(async () => {
      await clearCartAction();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleClearCart}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      Clear Cart
    </Button>
  );
}

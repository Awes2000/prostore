'use client';

import { useState, useTransition } from 'react';
import { Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  deleteOrderAction,
  markOrderAsPaidAndDeliveredAction,
} from '@/app/actions/admin-orders';
import { useRouter } from 'next/navigation';

type OrderActionsProps = {
  orderId: string;
  paymentMethod: string;
  isPaid: boolean;
  isDelivered: boolean;
};

export default function OrderActions({
  orderId,
  paymentMethod,
  isPaid,
  isDelivered,
}: OrderActionsProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteOrderAction(orderId);
      if ('error' in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleMarkAsPaidAndDelivered = () => {
    setError(null);
    startUpdateTransition(async () => {
      const result = await markOrderAsPaidAndDeliveredAction(orderId);
      if ('error' in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const showMarkAsPaidButton =
    paymentMethod === 'Cash on Delivery' && (!isPaid || !isDelivered);

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}

      {showMarkAsPaidButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAsPaidAndDelivered}
          disabled={isUpdating || isDeleting}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Paid & Delivered
            </>
          )}
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting || isUpdating}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone and will permanently remove the order and all its items
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

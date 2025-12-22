'use client';

import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format-currency';
import { shortenId } from '@/lib/shorten-id';

type StripeFormProps = {
  orderId: string;
  amount: number | string;
};

export default function StripeForm({ orderId, amount }: StripeFormProps) {
  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credit/Debit Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground mb-2">
            Stripe integration coming soon
          </p>
          <p className="text-sm text-muted-foreground">
            This placeholder will be replaced with the actual Stripe Elements
            integration.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono">{shortenId(orderId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

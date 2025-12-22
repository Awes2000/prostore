'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, CreditCard, Banknote, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { savePaymentMethodAction } from '@/app/actions/payment';
import {
  PAYMENT_METHODS,
  PaymentMethod,
  DEFAULT_PAYMENT_METHOD,
} from '@/lib/schemas/payment';
import { cn } from '@/lib/utils';

type PaymentFormProps = {
  defaultValue?: PaymentMethod | null;
};

const PAYMENT_OPTIONS = [
  {
    value: 'PayPal' as const,
    label: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet,
  },
  {
    value: 'Stripe' as const,
    label: 'Stripe',
    description: 'Credit or debit card',
    icon: CreditCard,
  },
  {
    value: 'Cash on Delivery' as const,
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Banknote,
  },
] as const;

export default function PaymentForm({ defaultValue }: PaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    defaultValue || DEFAULT_PAYMENT_METHOD
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await savePaymentMethodAction(selectedMethod);
      if ('error' in response) {
        setError(response.error);
      } else {
        router.push('/checkout/place-order');
      }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMethod === option.value;

              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <input
                    type="radio"
                    id={option.value}
                    name="paymentMethod"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) =>
                      setSelectedMethod(e.target.value as PaymentMethod)
                    }
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              );
            })}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

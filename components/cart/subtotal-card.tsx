import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format-currency';

type SubtotalCardProps = {
  itemCount: number;
  subtotal: number;
  shipping?: number;
  tax?: number;
};

export default function SubtotalCard({
  itemCount,
  subtotal,
  shipping = 0,
  tax = 0,
}: SubtotalCardProps) {
  const total = subtotal + shipping + tax;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            <span>{formatCurrency(shipping)}</span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax</span>
          {tax === 0 ? (
            <span className="text-muted-foreground">Calculated at checkout</span>
          ) : (
            <span>{formatCurrency(tax)}</span>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout/shipping">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

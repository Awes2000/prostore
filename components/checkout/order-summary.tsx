import Link from 'next/link';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format-currency';
import { ShippingAddress } from '@/lib/schemas/shipping';
import { PaymentMethod } from '@/lib/schemas/payment';

type OrderItem = {
  id?: string;
  productId: string;
  name: string;
  image: string;
  price: number | string;
  quantity: number;
};

type OrderSummaryProps = {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  itemsPrice: number | string;
  shippingPrice: number | string;
  taxPrice: number | string;
  totalPrice: number | string;
  isEditable?: boolean;
};

export default function OrderSummary({
  shippingAddress,
  paymentMethod,
  items,
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  isEditable = false,
}: OrderSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Shipping, Payment, Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shipping Address</CardTitle>
            {isEditable && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/checkout/shipping">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="font-medium">{shippingAddress.fullName}</p>
            <p className="text-muted-foreground">
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{' '}
              {shippingAddress.postalCode}
              <br />
              {shippingAddress.country}
            </p>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Method</CardTitle>
            {isEditable && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/checkout/payment">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p>{paymentMethod}</p>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            {isEditable && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/cart">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const price = Number(item.price);
                  const subtotal = price * item.quantity;

                  return (
                    <TableRow key={item.id || `item-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium line-clamp-2">
                            {item.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(subtotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Price Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{formatCurrency(itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {Number(shippingPrice) === 0
                  ? 'Free'
                  : formatCurrency(shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(taxPrice)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

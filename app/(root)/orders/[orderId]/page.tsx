import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { shippingAddressSchema } from '@/lib/schemas/shipping';
import { PaymentMethod } from '@/lib/schemas/payment';
import { shortenId } from '@/lib/shorten-id';
import { formatDate } from '@/lib/format-date';
import OrderSummary from '@/components/checkout/order-summary';
import PayPalButton from '@/components/payment/paypal-button';
import StripeForm from '@/components/payment/stripe-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck, Package, Banknote } from 'lucide-react';

export const metadata = {
  title: 'Order Details',
};

type OrderDetailsPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/orders/${orderId}`);
  }

  // Get order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Check if order exists
  if (!order) {
    notFound();
  }

  // Verify the order belongs to the current user
  if (order.userId !== session.user.id) {
    notFound();
  }

  // Parse shipping address
  const addressResult = shippingAddressSchema.safeParse(order.shippingAddress);
  if (!addressResult.success) {
    notFound();
  }

  // Prepare items for display
  const orderItems = order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    image: item.image,
    price: Number(item.price),
    quantity: item.quantity,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Order Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground mt-1">
              Order ID: <span className="font-mono">{shortenId(orderId)}</span>
            </p>
            <p className="text-muted-foreground text-sm">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={order.isPaid ? 'default' : 'secondary'}
              className={
                order.isPaid
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }
            >
              {order.isPaid ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Payment
                </>
              )}
            </Badge>
            <Badge
              variant={order.isDelivered ? 'default' : 'secondary'}
              className={
                order.isDelivered
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              }
            >
              {order.isDelivered ? (
                <>
                  <Package className="h-3 w-3 mr-1" />
                  Delivered
                </>
              ) : (
                <>
                  <Truck className="h-3 w-3 mr-1" />
                  Not Delivered
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <OrderSummary
        shippingAddress={addressResult.data}
        paymentMethod={order.paymentMethod as PaymentMethod}
        items={orderItems}
        itemsPrice={Number(order.itemsPrice)}
        shippingPrice={Number(order.shippingPrice)}
        taxPrice={Number(order.taxPrice)}
        totalPrice={Number(order.totalPrice)}
        isEditable={false}
      />

      {/* Payment Section */}
      <div className="mt-6 lg:ml-auto lg:w-1/3">
        {order.isPaid ? (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Payment Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 dark:text-green-400">
                Paid on {order.paidAt ? formatDate(order.paidAt) : 'N/A'}
              </p>
            </CardContent>
          </Card>
        ) : order.paymentMethod === 'PayPal' ? (
          <PayPalButton
            orderId={order.id}
            amount={Number(order.totalPrice)}
          />
        ) : order.paymentMethod === 'Stripe' ? (
          <StripeForm
            orderId={order.id}
            amount={Number(order.totalPrice)}
          />
        ) : (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Cash on Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground">
                  Payment will be collected upon delivery.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please have the exact amount ready when your order arrives.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Status */}
        {order.isDelivered && (
          <Card className="mt-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Package className="h-5 w-5" />
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 dark:text-green-400">
                Delivered on{' '}
                {order.deliveredAt ? formatDate(order.deliveredAt) : 'N/A'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

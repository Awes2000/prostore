import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { getCart } from '@/lib/cart';
import { shippingAddressSchema, ShippingAddress } from '@/lib/schemas/shipping';
import { paymentMethodSchema, PaymentMethod } from '@/lib/schemas/payment';
import { calculateOrderPrices } from '@/lib/schemas/order';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import OrderSummary from '@/components/checkout/order-summary';
import PlaceOrderForm from '@/components/checkout/place-order-form';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Review Order',
};

export default async function PlaceOrderPage() {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/checkout/place-order');
  }

  // Get user with address and payment method
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      address: true,
      paymentMethod: true,
    },
  });

  // Check shipping address
  if (!user?.address) {
    redirect('/checkout/shipping');
  }

  const addressResult = shippingAddressSchema.safeParse(user.address);
  if (!addressResult.success) {
    redirect('/checkout/shipping');
  }

  // Check payment method
  if (!user?.paymentMethod) {
    redirect('/checkout/payment');
  }

  const paymentResult = paymentMethodSchema.safeParse({
    paymentMethod: user.paymentMethod,
  });
  if (!paymentResult.success) {
    redirect('/checkout/payment');
  }

  // Get cart with items
  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  // Prepare items for display
  const orderItems = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    image: item.product.images[0] || '',
    price: Number(item.product.price),
    quantity: item.quantity,
  }));

  // Calculate prices
  const prices = calculateOrderPrices(orderItems);

  return (
    <div className="max-w-6xl mx-auto">
      <CheckoutSteps currentStep={4} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Review Order</h1>
        <p className="text-muted-foreground mt-2">Step 4 of 4</p>
      </div>

      <OrderSummary
        shippingAddress={addressResult.data}
        paymentMethod={paymentResult.data.paymentMethod}
        items={orderItems}
        itemsPrice={prices.itemsPrice}
        shippingPrice={prices.shippingPrice}
        taxPrice={prices.taxPrice}
        totalPrice={prices.totalPrice}
        isEditable={true}
      />

      <div className="mt-6 lg:ml-auto lg:w-1/3">
        <Card>
          <CardContent className="pt-6">
            <PlaceOrderForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

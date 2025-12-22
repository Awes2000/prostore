import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCart, getCartTotal } from '@/lib/cart';
import CartTable from '@/components/cart/cart-table';
import SubtotalCard from '@/components/cart/subtotal-card';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import ClearCartButton from '@/components/cart/clear-cart-button';

export const metadata = {
  title: 'Shopping Cart',
};

// Serialize cart item for client component (convert Decimals to numbers)
function serializeCartItem(item: NonNullable<Awaited<ReturnType<typeof getCart>>>['items'][number]) {
  return {
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      brand: item.product.brand,
      price: Number(item.product.price),
      images: item.product.images,
      stock: item.product.stock,
    },
  };
}

export default async function CartPage() {
  const cart = await getCart();
  const cartTotal = await getCartTotal();

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <CheckoutSteps currentStep={1} />
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const serializedItems = cart.items.map(serializeCartItem);

  return (
    <div className="max-w-6xl mx-auto">
      <CheckoutSteps currentStep={1} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <ClearCartButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <CartTable items={serializedItems} />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <SubtotalCard
            itemCount={itemCount}
            subtotal={cartTotal}
          />
        </div>
      </div>
    </div>
  );
}

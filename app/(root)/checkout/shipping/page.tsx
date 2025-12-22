import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getShippingAddressAction } from '@/app/actions/shipping';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import ShippingForm from '@/components/checkout/shipping-form';

export const metadata = {
  title: 'Shipping Address',
};

export default async function ShippingPage() {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/checkout/shipping');
  }

  // Get existing address if available
  const address = await getShippingAddressAction();

  return (
    <div className="max-w-4xl mx-auto">
      <CheckoutSteps currentStep={2} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Shipping Address</h1>
        <p className="text-muted-foreground mt-2">Step 2 of 4</p>
      </div>

      <ShippingForm defaultValues={address} />
    </div>
  );
}

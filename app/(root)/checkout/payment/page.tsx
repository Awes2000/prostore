import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getShippingAddressAction } from '@/app/actions/shipping';
import { getPaymentMethodAction } from '@/app/actions/payment';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import PaymentForm from '@/components/checkout/payment-form';

export const metadata = {
  title: 'Payment Method',
};

export default async function PaymentPage() {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/checkout/payment');
  }

  // Check if shipping address is set
  const address = await getShippingAddressAction();
  if (!address) {
    redirect('/checkout/shipping');
  }

  // Get existing payment method if available
  const paymentMethod = await getPaymentMethodAction();

  return (
    <div className="max-w-4xl mx-auto">
      <CheckoutSteps currentStep={3} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Payment Method</h1>
        <p className="text-muted-foreground mt-2">Step 3 of 4</p>
      </div>

      <PaymentForm defaultValue={paymentMethod} />
    </div>
  );
}

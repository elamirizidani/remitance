import { redirect } from 'next/navigation';

// Payment is handled exclusively via Stripe Checkout — initiated from the homepage.
// Any direct visit to this route is redirected to the homepage.
export default function PaymentPage() {
  redirect('/');
}

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(priceId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        priceId,
        customerId: customer?.stripe_customer_id,
      }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    
    if (!stripe) throw new Error('Stripe failed to load');
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) throw error;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function createPortalSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
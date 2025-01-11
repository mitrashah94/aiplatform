import { serve } from 'https://deno.fresh.dev/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@13.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature || !endpointSecret) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get price and product details
        const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
        const product = await stripe.products.retrieve(price.product as string);

        // Get customer from database
        const { data: customerData } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!customerData) break;

        // Upsert price in database
        const { data: priceData } = await supabase
          .from('prices')
          .upsert({
            stripe_price_id: price.id,
            active: price.active,
            currency: price.currency,
            interval: price.recurring?.interval,
            interval_count: price.recurring?.interval_count,
            unit_amount: price.unit_amount,
            product_id: product.id,
          })
          .select()
          .single();

        // Upsert subscription in database
        await supabase.from('subscriptions').upsert({
          user_id: customerData.user_id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: priceData?.id,
          quantity: subscription.items.data[0].quantity,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            ended_at: new Date(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
});
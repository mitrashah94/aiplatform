/*
  # Update Stripe Integration

  1. Changes
    - Add stripe_subscription_id to subscriptions table
    - Add webhook_logs table
    - Add webhook processing functions
    - Update RLS policies
*/

-- Add stripe_subscription_id to subscriptions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
    AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id text UNIQUE;
  END IF;
END $$;

-- Create webhook_logs table if not exists
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create or replace webhook logs policy
DROP POLICY IF EXISTS "Admins can view webhook logs" ON webhook_logs;
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.email() IN (
      'admin@elekite.ai'
      -- Add other admin emails here
    )
  );

-- Create or replace subscription handling functions
CREATE OR REPLACE FUNCTION handle_subscription_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Update subscription status
  UPDATE subscriptions
  SET 
    status = NEW.status,
    cancel_at_period_end = NEW.cancel_at_period_end,
    current_period_start = NEW.current_period_start,
    current_period_end = NEW.current_period_end,
    ended_at = NEW.ended_at,
    cancel_at = NEW.cancel_at,
    canceled_at = NEW.canceled_at,
    trial_start = NEW.trial_start,
    trial_end = NEW.trial_end
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace customer handling function
CREATE OR REPLACE FUNCTION handle_customer_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up customer data
  DELETE FROM customers WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace subscription status sync function
CREATE OR REPLACE FUNCTION sync_subscription_status(subscription_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 
    CASE 
      WHEN current_period_end < now() THEN 'expired'
      WHEN trial_end < now() THEN 'active'
      WHEN trial_end >= now() THEN 'trialing'
      ELSE status
    END
  WHERE id = subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace webhook processing function
CREATE OR REPLACE FUNCTION process_stripe_webhook(event_type text, payload jsonb)
RETURNS void AS $$
BEGIN
  CASE event_type
    WHEN 'customer.subscription.updated' THEN
      UPDATE subscriptions
      SET 
        status = payload->>'status',
        cancel_at_period_end = (payload->>'cancel_at_period_end')::boolean,
        current_period_start = (payload->>'current_period_start')::timestamptz,
        current_period_end = (payload->>'current_period_end')::timestamptz,
        ended_at = NULLIF(payload->>'ended_at', '')::timestamptz,
        cancel_at = NULLIF(payload->>'cancel_at', '')::timestamptz,
        canceled_at = NULLIF(payload->>'canceled_at', '')::timestamptz,
        trial_start = NULLIF(payload->>'trial_start', '')::timestamptz,
        trial_end = NULLIF(payload->>'trial_end', '')::timestamptz
      WHERE stripe_subscription_id = payload->>'id';
      
    WHEN 'customer.subscription.deleted' THEN
      UPDATE subscriptions
      SET status = 'canceled',
          ended_at = now()
      WHERE stripe_subscription_id = payload->>'id';
      
    WHEN 'customer.deleted' THEN
      DELETE FROM customers
      WHERE stripe_customer_id = payload->>'id';
      
    ELSE
      -- Log unhandled event types
      INSERT INTO webhook_logs (event_type, payload)
      VALUES (event_type, payload);
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_subscription_updated ON subscriptions;
DROP TRIGGER IF EXISTS on_customer_deleted ON customers;

-- Create triggers
CREATE TRIGGER on_subscription_updated
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_updated();

CREATE TRIGGER on_customer_deleted
  BEFORE DELETE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION handle_customer_deleted();
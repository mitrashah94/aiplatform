/*
  # Stripe Integration Schema

  1. New Tables
    - `customers` - Links users to Stripe customers
    - `products` - Stores Stripe product information
    - `prices` - Stores Stripe price information
    - `subscriptions` - Tracks user subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  stripe_customer_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id text UNIQUE,
  active boolean DEFAULT true,
  name text,
  description text,
  image text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prices table
CREATE TABLE prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id text UNIQUE,
  product_id uuid REFERENCES products,
  active boolean DEFAULT true,
  description text,
  unit_amount bigint,
  currency text,
  type text,
  interval text,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text,
  metadata jsonb,
  price_id uuid REFERENCES prices,
  quantity integer,
  cancel_at_period_end boolean,
  created_at timestamptz DEFAULT now(),
  current_period_start timestamptz,
  current_period_end timestamptz,
  ended_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view own customer data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own customer data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Prices policies
CREATE POLICY "Prices are viewable by everyone"
  ON prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX customers_user_id_idx ON customers(user_id);
CREATE INDEX prices_product_id_idx ON prices(product_id);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_price_id_idx ON subscriptions(price_id);

-- Update functions
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();
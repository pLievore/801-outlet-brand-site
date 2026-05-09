-- 0004_square_order_id.sql
-- Adds square_order_id to orders so the webhook can look up our order by
-- Square's Order ID (always present in payment events), not by payment.reference_id
-- which is unreliable across Square's hosted checkout flow.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS square_order_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_square_order_id
  ON orders(square_order_id)
  WHERE square_order_id IS NOT NULL;

-- 0002_mark_order_paid.sql
-- Atomic function called from the Square webhook to mark an order paid,
-- decrement stock, and record the inventory movement in a single TX.
-- Idempotent: returns 'already_paid' if called twice for the same order.

CREATE OR REPLACE FUNCTION mark_order_paid(
  p_checkout_id TEXT,
  p_payment_id TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_status TEXT;
  v_item RECORD;
BEGIN
  SELECT id, status INTO v_order_id, v_status
    FROM orders
    WHERE square_checkout_id = p_checkout_id
    FOR UPDATE;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('status', 'order_not_found');
  END IF;

  IF v_status = 'paid' THEN
    RETURN jsonb_build_object('status', 'already_paid', 'order_id', v_order_id);
  END IF;

  IF v_status NOT IN ('pending') THEN
    RETURN jsonb_build_object('status', 'invalid_state', 'order_id', v_order_id, 'current', v_status);
  END IF;

  FOR v_item IN
    SELECT variant_id, quantity
      FROM order_items
      WHERE order_id = v_order_id AND variant_id IS NOT NULL
  LOOP
    UPDATE product_variants
       SET stock_qty = stock_qty - v_item.quantity
     WHERE id = v_item.variant_id AND stock_qty >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock for variant %', v_item.variant_id;
    END IF;

    INSERT INTO inventory_movements (variant_id, delta, reason, reference_id)
    VALUES (v_item.variant_id, -v_item.quantity, 'order_paid', v_order_id);
  END LOOP;

  UPDATE orders
     SET status = 'paid',
         square_payment_id = COALESCE(square_payment_id, p_payment_id),
         paid_at = NOW()
   WHERE id = v_order_id;

  RETURN jsonb_build_object('status', 'paid', 'order_id', v_order_id);
END;
$$;

-- Restrict execution: only service_role can call this (webhooks).
REVOKE ALL ON FUNCTION mark_order_paid(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_order_paid(TEXT, TEXT) TO service_role;

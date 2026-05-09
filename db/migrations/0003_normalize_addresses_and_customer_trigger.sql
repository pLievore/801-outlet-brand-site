-- 0003_normalize_addresses_and_customer_trigger.sql
-- 1) Normalize legacy shipping_address shape from old seed-sales.ts
--    {firstName, lastName, address1, address2, zip}  →  {line1, line2, postalCode}
--    Customer name moves to orders.notes.
--    Idempotent: safe to re-run (the WHERE filter excludes already-normalized rows).
--
-- 2) Trigger that auto-creates a customers row whenever someone signs up via Supabase Auth.
--    Pulls full_name from raw_user_meta_data if provided at signup.

-- ============================================
-- 1) Normalize existing shipping_addresses
-- ============================================
UPDATE orders
SET
  shipping_address = jsonb_strip_nulls(jsonb_build_object(
    'line1',      shipping_address->>'address1',
    'line2',      NULLIF(shipping_address->>'address2', ''),
    'city',       shipping_address->>'city',
    'state',      shipping_address->>'state',
    'postalCode', shipping_address->>'zip',
    'country',    shipping_address->>'country',
    'phone',      NULLIF(shipping_address->>'phone', '')
  )),
  notes = COALESCE(
    NULLIF(notes, ''),
    NULLIF(
      TRIM(
        COALESCE(shipping_address->>'firstName', '') || ' ' ||
        COALESCE(shipping_address->>'lastName', '')
      ),
      ''
    )
  )
WHERE shipping_address ? 'firstName' OR shipping_address ? 'address1';

-- Mirror the fix into billing_address where it follows the same legacy shape
UPDATE orders
SET billing_address = shipping_address
WHERE billing_address IS NULL AND shipping_address IS NOT NULL;

-- ============================================
-- 2) Auto-create a customers row on auth.users insert
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (auth_user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (email) DO UPDATE
    SET auth_user_id = COALESCE(public.customers.auth_user_id, EXCLUDED.auth_user_id),
        full_name    = COALESCE(public.customers.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill customers rows for any existing auth users that don't have one
INSERT INTO public.customers (auth_user_id, email, full_name)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )
FROM auth.users u
LEFT JOIN public.customers c ON c.auth_user_id = u.id OR c.email = u.email
WHERE c.id IS NULL AND u.email IS NOT NULL
ON CONFLICT (email) DO UPDATE
  SET auth_user_id = COALESCE(public.customers.auth_user_id, EXCLUDED.auth_user_id);

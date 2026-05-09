-- 0001_init.sql
-- Initial schema for 801 Outlet e-commerce.
-- Schema follows SPEC.md §5. Prices are in cents (INTEGER) — never floats.
--
-- Apply in Supabase: SQL Editor → New Query → paste this file → Run.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PRODUCTS & CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INTEGER
    CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= 0),
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  weight_grams INTEGER,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_low_stock
  ON product_variants(stock_qty)
  WHERE stock_qty <= low_stock_threshold;

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id, sort_order);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'shipping'
    CHECK (type IN ('shipping', 'billing')),
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  square_checkout_id TEXT UNIQUE,
  square_payment_id TEXT,
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- ADMIN
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVENTORY MOVEMENTS (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL
    CHECK (reason IN ('order_paid', 'order_cancelled', 'order_refunded', 'manual_adjustment', 'restock')),
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_variant
  ON inventory_movements(variant_id, created_at DESC);

-- ============================================
-- updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements  ENABLE ROW LEVEL SECURITY;

-- Public catalog: anyone can read active products and related rows
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "variants_public_read" ON product_variants;
CREATE POLICY "variants_public_read" ON product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.status = 'active')
  );

DROP POLICY IF EXISTS "images_public_read" ON product_images;
CREATE POLICY "images_public_read" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.status = 'active')
  );

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "product_categories_public_read" ON product_categories;
CREATE POLICY "product_categories_public_read" ON product_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_categories.product_id AND p.status = 'active')
  );

-- Customer-owned data: only the authenticated owner
DROP POLICY IF EXISTS "customers_self_read" ON customers;
CREATE POLICY "customers_self_read" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "customers_self_update" ON customers;
CREATE POLICY "customers_self_update" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "addresses_owner_all" ON addresses;
CREATE POLICY "addresses_owner_all" ON addresses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = addresses.customer_id AND c.auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_owner_read" ON orders;
CREATE POLICY "orders_owner_read" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = orders.customer_id AND c.auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_owner_read" ON order_items;
CREATE POLICY "order_items_owner_read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id AND c.auth_user_id = auth.uid()
    )
  );

-- admin_users + inventory_movements: no policies — service_role bypasses RLS.
-- All admin writes must go through server actions using SUPABASE_SERVICE_ROLE_KEY.

-- ============================================
-- SEED: categories (idempotent)
-- ============================================
INSERT INTO categories (slug, name, sort_order) VALUES
  ('sofas',      'Sofas',      1),
  ('sectionals', 'Sectionals', 2),
  ('recliners', 'Recliners',  3),
  ('beds',      'Beds',       4),
  ('mattresses', 'Mattresses', 5),
  ('dining',    'Dining',     6),
  ('storage',   'Storage',    7),
  ('other',     'Other',     99)
ON CONFLICT (slug) DO NOTHING;

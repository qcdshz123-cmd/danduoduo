-- ============================================================
-- 速订货 (SuDingHuo) - Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- ── 1. Roles ────────────────────────────────────────────────
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO roles (name, description) VALUES
  ('admin',    '店铺管理员 - 全部权限'),
  ('staff',    '员工 - 开单/库存/商品管理'),
  ('customer', '客户 - 仅查看自己的订单和商品');

-- ── 2. Stores ───────────────────────────────────────────────
CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  address    TEXT,
  phone      TEXT,
  is_active  BOOLEAN DEFAULT true,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Profiles (extends auth.users) ────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id    UUID NOT NULL REFERENCES stores(id),
  role_id     UUID NOT NULL REFERENCES roles(id),
  display_name TEXT NOT NULL,
  avatar_url  TEXT,
  phone       TEXT UNIQUE,
  is_active   BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Product Categories ───────────────────────────────────
CREATE TABLE product_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id),
  parent_id  UUID REFERENCES product_categories(id),
  name       TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  image_url  TEXT,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, name, COALESCE(parent_id::text, ''))
);

-- ── 5. Products ─────────────────────────────────────────────
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id),
  category_id UUID REFERENCES product_categories(id),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  barcode     TEXT,
  description TEXT,
  unit        TEXT DEFAULT '件',
  base_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price  DECIMAL(12,2) DEFAULT 0,
  min_stock   INTEGER DEFAULT 0,
  max_stock   INTEGER,
  is_active   BOOLEAN DEFAULT true,
  has_variants BOOLEAN DEFAULT false,
  tags        TEXT[] DEFAULT '{}',
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, code)
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ── 6. Product Variants ─────────────────────────────────────
CREATE TABLE product_variants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku        TEXT NOT NULL,
  barcode    TEXT,
  spec_name  TEXT,
  spec_value TEXT,
  price      DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, sku)
);

-- ── 7. Product Images ───────────────────────────────────────
CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  thumb_url  TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 8. Product Price Tiers ──────────────────────────────────
CREATE TABLE product_price_tiers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  min_qty    INTEGER NOT NULL DEFAULT 1,
  price      DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, name)
);

-- ── 9. Customers ────────────────────────────────────────────
CREATE TABLE customers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           UUID NOT NULL REFERENCES stores(id),
  profile_id         UUID REFERENCES profiles(id),
  name               TEXT NOT NULL,
  code               TEXT NOT NULL,
  contact_person     TEXT,
  phone              TEXT,
  wechat             TEXT,
  address            TEXT,
  notes              TEXT,
  credit_limit       DECIMAL(12,2) DEFAULT 0,
  balance            DECIMAL(12,2) DEFAULT 0,
  default_price_level TEXT DEFAULT 'retail',
  is_active          BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, code)
);

-- ── 10. Customer Price Levels ───────────────────────────────
CREATE TABLE customer_price_levels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  price_tier_id UUID NOT NULL REFERENCES product_price_tiers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, price_tier_id)
);

-- ── 11. Orders ──────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id),
  order_number     TEXT NOT NULL UNIQUE,
  customer_id      UUID REFERENCES customers(id),
  created_by       UUID NOT NULL REFERENCES profiles(id),
  status           TEXT NOT NULL DEFAULT 'pending',
  total_amount     DECIMAL(12,2) DEFAULT 0,
  discount_amount  DECIMAL(12,2) DEFAULT 0,
  paid_amount      DECIMAL(12,2) DEFAULT 0,
  payment_status   TEXT DEFAULT 'unpaid',
  payment_method   TEXT,
  notes            TEXT,
  shipped_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('unpaid','partial','paid'))
);

CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_orders_store_customer ON orders(store_id, customer_id);
CREATE INDEX idx_orders_store_created ON orders(store_id, created_at DESC);

-- ── 12. Order Items ─────────────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  variant_id    UUID REFERENCES product_variants(id),
  product_name  TEXT NOT NULL,
  sku           TEXT,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit          TEXT NOT NULL DEFAULT '件',
  unit_price    DECIMAL(12,2) NOT NULL,
  total_price   DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 13. Order Status History ────────────────────────────────
CREATE TABLE order_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status  TEXT,
  to_status    TEXT NOT NULL,
  changed_by   UUID NOT NULL REFERENCES profiles(id),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 14. Payments ────────────────────────────────────────────
CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount      DECIMAL(12,2) NOT NULL,
  method      TEXT NOT NULL,
  reference   TEXT,
  received_by UUID NOT NULL REFERENCES profiles(id),
  notes       TEXT,
  paid_at     TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_method CHECK (method IN ('cash','wechat','alipay','bank_transfer'))
);

-- ── 15. Inventory ───────────────────────────────────────────
CREATE TABLE inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id),
  product_id      UUID NOT NULL REFERENCES products(id),
  variant_id      UUID REFERENCES product_variants(id),
  quantity        INTEGER NOT NULL DEFAULT 0,
  locked_quantity INTEGER DEFAULT 0,
  min_stock       INTEGER DEFAULT 0,
  max_stock       INTEGER,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, product_id, COALESCE(variant_id::text, ''))
);

CREATE INDEX idx_inventory_store_qty ON inventory(store_id, quantity);

-- ── 16. Inventory Transactions ──────────────────────────────
CREATE TABLE inventory_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID NOT NULL REFERENCES stores(id),
  inventory_id   UUID NOT NULL REFERENCES inventory(id),
  type           TEXT NOT NULL,
  quantity       INTEGER NOT NULL,
  before_qty     INTEGER NOT NULL,
  after_qty      INTEGER NOT NULL,
  reference_type TEXT,
  reference_id   UUID,
  notes          TEXT,
  created_by     UUID NOT NULL REFERENCES profiles(id),
  created_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('in','out','transfer_in','transfer_out','adjustment','return'))
);

CREATE INDEX idx_invtx_store_created ON inventory_transactions(store_id, created_at DESC);
CREATE INDEX idx_invtx_inventory_created ON inventory_transactions(inventory_id, created_at DESC);

-- ============================================================
-- Row-Level Security Policies
-- All tables are store-scoped. Users can only see their own store's data.
-- ============================================================

-- Helper: returns the store_id for the current authenticated user
CREATE OR REPLACE FUNCTION fn_get_user_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: returns the role for the current user
CREATE OR REPLACE FUNCTION fn_get_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM profiles p JOIN roles r ON r.id = p.role_id WHERE p.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename NOT IN ('roles')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- ── Roles: Public read ──────────────────────────────────────
CREATE POLICY "Roles are readable by everyone" ON roles
  FOR SELECT USING (true);

-- ── Stores ──────────────────────────────────────────────────
CREATE POLICY "Store members can read own store" ON stores
  FOR SELECT USING (id = fn_get_user_store_id());

-- ── Profiles ────────────────────────────────────────────────
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can read store profiles" ON profiles
  FOR SELECT USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Product Categories ──────────────────────────────────────
CREATE POLICY "Store members read categories" ON product_categories
  FOR SELECT USING (store_id = fn_get_user_store_id());
CREATE POLICY "Staff can manage categories" ON product_categories
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Products ────────────────────────────────────────────────
CREATE POLICY "Store members read active products" ON products
  FOR SELECT USING (store_id = fn_get_user_store_id());
CREATE POLICY "Staff can manage products" ON products
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Product Variants ───────────────────────────────────────
CREATE POLICY "Store members read variants" ON product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_variants.product_id AND store_id = fn_get_user_store_id())
  );
CREATE POLICY "Staff can manage variants" ON product_variants
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND EXISTS (SELECT 1 FROM products WHERE id = product_variants.product_id AND store_id = fn_get_user_store_id())
  );

-- ── Product Images ─────────────────────────────────────────
CREATE POLICY "Store members read images" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_images.product_id AND store_id = fn_get_user_store_id())
  );
CREATE POLICY "Staff can manage images" ON product_images
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND EXISTS (SELECT 1 FROM products WHERE id = product_images.product_id AND store_id = fn_get_user_store_id())
  );

-- ── Product Price Tiers ────────────────────────────────────
CREATE POLICY "Store members read price tiers" ON product_price_tiers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_price_tiers.product_id AND store_id = fn_get_user_store_id())
  );
CREATE POLICY "Staff can manage price tiers" ON product_price_tiers
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND EXISTS (SELECT 1 FROM products WHERE id = product_price_tiers.product_id AND store_id = fn_get_user_store_id())
  );

-- ── Customers ───────────────────────────────────────────────
CREATE POLICY "Staff can read store customers" ON customers
  FOR SELECT USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );
CREATE POLICY "Customer can read own record" ON customers
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can manage customers" ON customers
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Orders ──────────────────────────────────────────────────
CREATE POLICY "Staff can read store orders" ON orders
  FOR SELECT USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );
CREATE POLICY "Customer can read own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );
CREATE POLICY "Staff can manage orders" ON orders
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Order Items ─────────────────────────────────────────────
CREATE POLICY "Staff can read store order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND store_id = fn_get_user_store_id())
  );
CREATE POLICY "Staff can manage order items" ON order_items
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND store_id = fn_get_user_store_id())
  );

-- ── Payments ────────────────────────────────────────────────
CREATE POLICY "Staff can read store payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND store_id = fn_get_user_store_id())
  );
CREATE POLICY "Staff can manage payments" ON payments
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND store_id = fn_get_user_store_id())
  );

-- ── Inventory ──────────────────────────────────────────────
CREATE POLICY "Staff can read store inventory" ON inventory
  FOR SELECT USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );
CREATE POLICY "Staff can manage inventory" ON inventory
  FOR ALL USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Inventory Transactions ─────────────────────────────────
CREATE POLICY "Staff can read store transactions" ON inventory_transactions
  FOR SELECT USING (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );
CREATE POLICY "Staff can create transactions" ON inventory_transactions
  FOR INSERT WITH CHECK (
    fn_get_user_role() IN ('admin', 'staff')
    AND store_id = fn_get_user_store_id()
  );

-- ── Storage Buckets ─────────────────────────────────────────
-- These must be created via Supabase Dashboard or API:
-- 1. product-images (public read, staff write)
-- 2. avatars (authenticated read, owner write)
-- 3. exports (authenticated read, staff write)

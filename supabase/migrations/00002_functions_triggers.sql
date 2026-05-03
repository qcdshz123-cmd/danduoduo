-- ============================================================
-- PostgreSQL Functions & Triggers
-- ============================================================

-- 1. Auto-generate order number: SO{YYMMDD}{store_code}{4-digit-seq}
CREATE OR REPLACE FUNCTION fn_generate_order_number(p_store_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_store_code TEXT;
  v_date_part TEXT;
  v_seq INT;
BEGIN
  SELECT code INTO v_store_code FROM stores WHERE id = p_store_id;
  v_date_part := to_char(now(), 'YYMMDD');

  SELECT COUNT(*) + 1 INTO v_seq
  FROM orders
  WHERE store_id = p_store_id
    AND created_at::date = CURRENT_DATE;

  RETURN 'SO' || v_date_part || v_store_code || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger: Auto-update order totals on order_items change
CREATE OR REPLACE FUNCTION fn_update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders SET
    total_amount = COALESCE((
      SELECT SUM(quantity * unit_price)
      FROM order_items
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_order_totals ON order_items;
CREATE TRIGGER trg_update_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION fn_update_order_totals();

-- 3. Trigger: Update order payment_status on payments change
CREATE OR REPLACE FUNCTION fn_update_order_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(12,2);
  v_paid  DECIMAL(12,2);
  v_order_id UUID;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT total_amount INTO v_total FROM orders WHERE id = v_order_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM payments WHERE order_id = v_order_id;

  UPDATE orders SET
    paid_amount = v_paid,
    payment_status = CASE
      WHEN v_paid >= v_total THEN 'paid'
      WHEN v_paid > 0 THEN 'partial'
      ELSE 'unpaid'
    END,
    updated_at = now()
  WHERE id = v_order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_payment_status ON payments;
CREATE TRIGGER trg_update_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION fn_update_order_payment_status();

-- 4. Trigger: Update inventory on order status change
CREATE OR REPLACE FUNCTION fn_update_inventory_on_order_status()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
  v_inv_id UUID;
  v_before_qty INT;
  v_after_qty INT;
BEGIN
  -- confirmed: lock stock
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    FOR v_item IN
      SELECT oi.product_id, oi.variant_id, oi.quantity
      FROM order_items oi WHERE oi.order_id = NEW.id
    LOOP
      UPDATE inventory
      SET locked_quantity = locked_quantity + v_item.quantity,
          updated_at = now()
      WHERE store_id = NEW.store_id
        AND product_id = v_item.product_id
        AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL));
    END LOOP;
  END IF;

  -- shipped: deduct stock
  IF NEW.status = 'shipped' AND OLD.status = 'confirmed' THEN
    FOR v_item IN
      SELECT oi.product_id, oi.variant_id, oi.quantity
      FROM order_items oi WHERE oi.order_id = NEW.id
    LOOP
      SELECT id, quantity INTO v_inv_id, v_before_qty FROM inventory
      WHERE store_id = NEW.store_id
        AND product_id = v_item.product_id
        AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL));

      v_after_qty := v_before_qty - v_item.quantity;

      UPDATE inventory
      SET quantity = v_after_qty,
          locked_quantity = locked_quantity - v_item.quantity,
          updated_at = now()
      WHERE id = v_inv_id;

      INSERT INTO inventory_transactions (store_id, inventory_id, type, quantity, before_qty, after_qty, reference_type, reference_id, created_by)
      VALUES (NEW.store_id, v_inv_id, 'out', v_item.quantity, v_before_qty, v_after_qty, 'order', NEW.id, NEW.created_by);
    END LOOP;
  END IF;

  -- cancelled: release lock or return stock
  IF NEW.status = 'cancelled' AND (OLD.status = 'confirmed' OR OLD.status = 'shipped') THEN
    FOR v_item IN
      SELECT oi.product_id, oi.variant_id, oi.quantity
      FROM order_items oi WHERE oi.order_id = NEW.id
    LOOP
      SELECT id, quantity INTO v_inv_id, v_before_qty FROM inventory
      WHERE store_id = NEW.store_id
        AND product_id = v_item.product_id
        AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL));

      IF OLD.status = 'confirmed' THEN
        -- Release lock only
        UPDATE inventory
        SET locked_quantity = locked_quantity - v_item.quantity,
            updated_at = now()
        WHERE id = v_inv_id;
      ELSE
        -- Return to stock (was shipped)
        v_after_qty := v_before_qty + v_item.quantity;
        UPDATE inventory
        SET quantity = v_after_qty,
            updated_at = now()
        WHERE id = v_inv_id;

        INSERT INTO inventory_transactions (store_id, inventory_id, type, quantity, before_qty, after_qty, reference_type, reference_id, created_by)
        VALUES (NEW.store_id, v_inv_id, 'return', v_item.quantity, v_before_qty, v_after_qty, 'order', NEW.id, NEW.created_by);
      END IF;
    END LOOP;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_on_order_status ON orders;
CREATE TRIGGER trg_inventory_on_order_status
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION fn_update_inventory_on_order_status();

-- 5. Trigger: Log status changes
CREATE OR REPLACE FUNCTION fn_log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.created_by);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_status_change ON orders;
CREATE TRIGGER trg_log_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_log_status_change();

-- 6. Trigger: Auto-create inventory record on product insert
CREATE OR REPLACE FUNCTION fn_ensure_inventory_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (store_id, product_id, variant_id, min_stock, max_stock)
  VALUES (NEW.store_id, NEW.id, NULL, NEW.min_stock, NEW.max_stock)
  ON CONFLICT (store_id, product_id, COALESCE(variant_id::text, '')) DO NOTHING;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_inventory ON products;
CREATE TRIGGER trg_ensure_inventory
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION fn_ensure_inventory_record();

-- 7. Auto-update updated_at on all tables
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    ', t, t);
  END LOOP;
END $$;

-- 8. Constraint: Prevent negative inventory
CREATE OR REPLACE FUNCTION fn_validate_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity < 0 THEN
    RAISE EXCEPTION 'Inventory quantity cannot be negative (product_id: %, current: %, attempted: %)',
      NEW.product_id, OLD.quantity, NEW.quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_inventory ON inventory;
CREATE TRIGGER trg_validate_inventory
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  WHEN (NEW.quantity < 0)
  EXECUTE FUNCTION fn_validate_inventory_quantity();

import { OrderStatus, PaymentStatus, PaymentMethod, Role, PriceLevel, StockStatus } from './enums';

// ── Auth & Profile ──────────────────────────────────────────
export interface Profile {
  id: string;
  store_id: string;
  role_id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Product ─────────────────────────────────────────────────
export interface ProductCategory {
  id: string;
  store_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  children?: ProductCategory[];
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  spec_name: string | null;
  spec_value: string | null;
  price: number | null;
  cost_price: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed (from inventory join)
  stock_quantity?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  thumb_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductPriceTier {
  id: string;
  product_id: string;
  name: string;
  min_qty: number;
  price: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  code: string;
  barcode: string | null;
  description: string | null;
  unit: string;
  base_price: number;
  cost_price: number | null;
  min_stock: number;
  max_stock: number | null;
  is_active: boolean;
  has_variants: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations (populated by queries)
  category?: ProductCategory | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  price_tiers?: ProductPriceTier[];
  // Computed
  stock_quantity?: number;
  stock_status?: StockStatus;
}

// ── Customer ────────────────────────────────────────────────
export interface Customer {
  id: string;
  store_id: string;
  profile_id: string | null;
  name: string;
  code: string;
  contact_person: string | null;
  phone: string | null;
  wechat: string | null;
  address: string | null;
  notes: string | null;
  credit_limit: number | null;
  balance: number;
  default_price_level: PriceLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Order ───────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joined
  product_image?: string | null;
  current_stock?: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string;
  notes: string | null;
  created_at: string;
  // Joined
  changed_by_name?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  received_by: string;
  notes: string | null;
  paid_at: string;
  created_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  order_number: string;
  customer_id: string | null;
  created_by: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  notes: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer | null;
  items?: OrderItem[];
  payments?: Payment[];
  status_history?: OrderStatusHistory[];
  created_by_name?: string;
}

// ── Inventory ───────────────────────────────────────────────
export interface Inventory {
  id: string;
  store_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  locked_quantity: number;
  min_stock: number;
  max_stock: number | null;
  updated_at: string;
  // Joined
  product_name?: string;
  product_code?: string;
  product_image?: string | null;
  variant_sku?: string | null;
  variant_spec?: string | null;
  stock_status?: StockStatus;
}

export interface InventoryTransaction {
  id: string;
  store_id: string;
  inventory_id: string;
  type: string;
  quantity: number;
  before_qty: number;
  after_qty: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  // Joined
  product_name?: string;
  created_by_name?: string;
}

// ── Reports ─────────────────────────────────────────────────
export interface SalesSummary {
  period: string;        // e.g. '2026-05-02'
  order_count: number;
  total_revenue: number;
  total_profit: number;
  avg_order_value: number;
  item_count: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  product_code: string;
  product_image: string | null;
  quantity_sold: number;
  total_revenue: number;
  percentage: number;
}

// ── API Helpers ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

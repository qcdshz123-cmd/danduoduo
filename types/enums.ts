// ── Order ──────────────────────────────────────────────────
export const OrderStatus = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  SHIPPED:   'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  UNPAID:  'unpaid',
  PARTIAL: 'partial',
  PAID:    'paid',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH:          'cash',
  WECHAT:        'wechat',
  ALIPAY:        'alipay',
  BANK_TRANSFER: 'bank_transfer',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// ── Inventory ───────────────────────────────────────────────
export const InventoryTransactionType = {
  IN:           'in',
  OUT:          'out',
  TRANSFER_IN:  'transfer_in',
  TRANSFER_OUT: 'transfer_out',
  ADJUSTMENT:   'adjustment',
  RETURN:       'return',
} as const;
export type InventoryTransactionType = (typeof InventoryTransactionType)[keyof typeof InventoryTransactionType];

export const StockStatus = {
  IN_STOCK:     'in_stock',
  LOW_STOCK:    'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  OVERSTOCK:    'overstock',
} as const;
export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];

// ── Role ────────────────────────────────────────────────────
export const Role = {
  ADMIN:    'admin',
  STAFF:    'staff',
  CUSTOMER: 'customer',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// ── Discount / Price Level ──────────────────────────────────
export const PriceLevel = {
  RETAIL:    'retail',
  WHOLESALE: 'wholesale',
  VIP:       'vip',
} as const;
export type PriceLevel = (typeof PriceLevel)[keyof typeof PriceLevel];

// ── Sort Direction ──────────────────────────────────────────
export const SortDirection = {
  ASC:  'asc',
  DESC: 'desc',
} as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

// ── View Mode ───────────────────────────────────────────────
export const ViewMode = {
  GRID: 'grid',
  LIST: 'list',
} as const;
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

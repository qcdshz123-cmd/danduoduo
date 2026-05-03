import { supabase } from './supabase';
import type { Inventory, InventoryTransaction, PaginatedResponse } from '../types/models';
import type { InventoryTransactionType, StockStatus } from '../types/enums';
import { config } from '../constants/config';
import { z } from 'zod';

// ── DTOs ────────────────────────────────────────────────────────

export interface InventoryQueryParams {
  search?: string;
  stockStatus?: StockStatus | null;
  categoryId?: string | null;
  page?: number;
  limit?: number;
}

export interface StockInDto {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  notes?: string | null;
}

export interface StockOutDto {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  notes?: string | null;
}

export interface TransferDto {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  from_location?: string | null;
  to_location?: string | null;
  notes?: string | null;
}

export interface AdjustDto {
  product_id: string;
  variant_id?: string | null;
  new_quantity: number;
  reason: string;
}

export interface TransactionQueryParams {
  inventoryId?: string;
  productId?: string;
  type?: InventoryTransactionType | null;
  page?: number;
  limit?: number;
}

// ── Zod Schemas ─────────────────────────────────────────────────

export const stockInSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1, '数量必须大于0'),
  notes: z.string().max(500).nullable().optional(),
});

export const stockOutSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1, '数量必须大于0'),
  notes: z.string().max(500).nullable().optional(),
});

export const transferSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1, '数量必须大于0'),
  from_location: z.string().max(100).nullable().optional(),
  to_location: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const adjustSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  new_quantity: z.number().int().min(0, '库存不能为负数'),
  reason: z.string().min(1, '请填写调整原因').max(500),
});

// ── Select fragments ────────────────────────────────────────────

const INVENTORY_LIST_SELECT = `
  *,
  products!inner(name, code, base_price),
  product_variants(sku, spec_name, spec_value)
`;

const TRANSACTION_SELECT = `
  *,
  created_by:profiles(display_name)
`;

// ── Service ─────────────────────────────────────────────────────

export const inventoryService = {

  /** 分页库存列表。stock_status 为计算字段，启用 stockStatus 过滤时采用全量获取+客户端分页策略。 */
  async findAll(params: InventoryQueryParams = {}): Promise<PaginatedResponse<Inventory>> {
    const { search, stockStatus, categoryId, page = 1, limit = config.pageSize } = params;

    let query = supabase
      .from('inventory')
      .select(INVENTORY_LIST_SELECT, { count: 'exact' })
      .order('updated_at', { ascending: false });

    if (search) {
      const safe = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`products.name.ilike.%${safe}%,products.code.ilike.%${safe}%`);
    }

    if (categoryId) {
      query = query.eq('products.category_id', categoryId);
    }

    // stockStatus 是客户端计算字段，启用时需全量获取再分页
    if (stockStatus) {
      const { data, error } = await query;
      if (error) throw error;

      const allItems = (data ?? []).map(mapInventoryItem);
      const filtered = allItems.filter((item) => item.stock_status === stockStatus);
      const from = (page - 1) * limit;
      const paged = filtered.slice(from, from + limit);

      return {
        data: paged,
        count: filtered.length,
        hasMore: from + limit < filtered.length,
      };
    }

    // 无 stockStatus 过滤时使用标准服务端分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []).map(mapInventoryItem),
      count: count ?? 0,
      hasMore: (count ?? 0) > to + 1,
    };
  },

  /** 单个库存详情 */
  async findById(id: string): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select(INVENTORY_LIST_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapInventoryItem(data) : null;
  },

  /** 入库 */
  async stockIn(dto: StockInDto): Promise<Inventory> {
    const validated = stockInSchema.parse(dto);
    const record = await ensureInventory(validated.product_id, validated.variant_id ?? null);

    const beforeQty = record.quantity;
    const afterQty = beforeQty + validated.quantity;

    // 先记录交易日志（防止库存变更后日志写入失败导致数据不一致）
    await logTransaction({
      inventory_id: record.id,
      type: 'in',
      quantity: validated.quantity,
      before_qty: beforeQty,
      after_qty: afterQty,
      notes: validated.notes ?? null,
    });

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: afterQty })
      .eq('id', record.id)
      .select(INVENTORY_LIST_SELECT)
      .single();
    if (error) throw error;

    return data ? mapInventoryItem(data) : record;
  },

  /** 出库 */
  async stockOut(dto: StockOutDto): Promise<Inventory> {
    const validated = stockOutSchema.parse(dto);
    const record = await ensureInventory(validated.product_id, validated.variant_id ?? null);

    if (record.quantity < validated.quantity) {
      throw new Error(`库存不足：当前库存 ${record.quantity}，出库 ${validated.quantity}`);
    }

    const beforeQty = record.quantity;
    const afterQty = beforeQty - validated.quantity;

    // 先记录交易日志
    await logTransaction({
      inventory_id: record.id,
      type: 'out',
      quantity: validated.quantity,
      before_qty: beforeQty,
      after_qty: afterQty,
      notes: validated.notes ?? null,
    });

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: afterQty })
      .eq('id', record.id)
      .select(INVENTORY_LIST_SELECT)
      .single();
    if (error) throw error;

    return data ? mapInventoryItem(data) : record;
  },

  /** 调拨 */
  async transfer(dto: TransferDto): Promise<{ source: Inventory; target: Inventory }> {
    const validated = transferSchema.parse(dto);

    // 调出
    const source = await inventoryService.stockOut({
      product_id: validated.product_id,
      variant_id: validated.variant_id,
      quantity: validated.quantity,
      notes: `调拨出库${validated.from_location ? ` (${validated.from_location})` : ''}${validated.notes ? ` - ${validated.notes}` : ''}`,
    });

    // 调入
    const target = await inventoryService.stockIn({
      product_id: validated.product_id,
      variant_id: validated.variant_id,
      quantity: validated.quantity,
      notes: `调拨入库${validated.to_location ? ` (${validated.to_location})` : ''}${validated.notes ? ` - ${validated.notes}` : ''}`,
    });

    return { source, target };
  },

  /** 盘点调整 */
  async adjust(dto: AdjustDto): Promise<Inventory> {
    const validated = adjustSchema.parse(dto);
    const record = await ensureInventory(validated.product_id, validated.variant_id ?? null);

    const beforeQty = record.quantity;
    const afterQty = validated.new_quantity;
    const diff = afterQty - beforeQty;

    // 先记录交易日志
    await logTransaction({
      inventory_id: record.id,
      type: 'adjustment',
      quantity: diff,
      before_qty: beforeQty,
      after_qty: afterQty,
      notes: `盘点调整: ${validated.reason}`,
    });

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: afterQty })
      .eq('id', record.id)
      .select(INVENTORY_LIST_SELECT)
      .single();
    if (error) throw error;

    return data ? mapInventoryItem(data) : record;
  },

  /** 低库存预警列表 */
  async getLowStock(limit?: number): Promise<Inventory[]> {
    const query = supabase
      .from('inventory')
      .select(INVENTORY_LIST_SELECT)
      .gt('min_stock', 0)
      .gt('quantity', 0)
      .order('quantity', { ascending: true });

    const { data, error } = await (limit
      ? query.limit(limit)
      : query);

    if (error) throw error;
    // Client-side filter: quantity <= min_stock
    const items = (data ?? []).map(mapInventoryItem);
    return items.filter((item) => item.quantity <= (item.min_stock || 0));
  },

  /** 超库存列表 */
  async getOverstock(limit?: number): Promise<Inventory[]> {
    const query = supabase
      .from('inventory')
      .select(INVENTORY_LIST_SELECT)
      .gt('max_stock', 0)
      .order('quantity', { ascending: false });

    const { data, error } = await (limit
      ? query.limit(limit)
      : query);

    if (error) throw error;
    // Client-side filter: quantity >= max_stock
    const items = (data ?? []).map(mapInventoryItem);
    return items.filter((item) => item.max_stock != null && item.quantity >= item.max_stock);
  },

  /** 交易日志 */
  async getTransactions(params: TransactionQueryParams = {}): Promise<PaginatedResponse<InventoryTransaction>> {
    const { inventoryId, productId, type, page = 1, limit = config.pageSize } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('inventory_transactions')
      .select(`${TRANSACTION_SELECT}, inventory!inner(product_id, products!inner(name, code))`, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (inventoryId) query = query.eq('inventory_id', inventoryId);
    if (productId) query = query.eq('inventory.product_id', productId);
    if (type) query = query.eq('type', type);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []).map(mapTransaction),
      count: count ?? 0,
      hasMore: (count ?? 0) > to + 1,
    };
  },
};

// ── Internal helpers ────────────────────────────────────────────

interface LogTransactionParams {
  inventory_id: string;
  type: InventoryTransactionType;
  quantity: number;
  before_qty: number;
  after_qty: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
}

async function logTransaction(params: LogTransactionParams) {
  const { error } = await supabase.from('inventory_transactions').insert({
    inventory_id: params.inventory_id,
    type: params.type,
    quantity: params.quantity,
    before_qty: params.before_qty,
    after_qty: params.after_qty,
    reference_type: params.reference_type ?? null,
    reference_id: params.reference_id ?? null,
    notes: params.notes ?? null,
  });
  if (error) throw error;
}

/**
 * 确保库存记录存在：如果某商品的库存记录不存在，自动创建一条 quantity=0 的记录。
 * 库存触发器（如果有）也会在商品创建时自动创建库存记录，这里是防御性编程。
 */
async function ensureInventory(productId: string, variantId: string | null): Promise<Inventory> {
  // 先查是否存在
  let query = supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId);

  if (variantId) {
    query = query.eq('variant_id', variantId);
  } else {
    query = query.is('variant_id', null);
  }

  const { data: existing, error: lookupError } = await query.maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing as Inventory;

  // 不存在则创建
  const { data: created, error: createError } = await supabase
    .from('inventory')
    .insert({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: 0,
      locked_quantity: 0,
      min_stock: 0,
      max_stock: null,
    })
    .select()
    .single();

  if (createError) throw createError;
  return created as Inventory;
}

// ── Mappers ─────────────────────────────────────────────────────

function mapInventoryItem(row: Record<string, unknown>): Inventory {
  const inventory = row as unknown as Inventory;
  const product = row.products as { name?: string; code?: string; base_price?: number } | null;
  const variant = row.product_variants as { sku?: string; spec_name?: string; spec_value?: string } | null;

  return {
    ...inventory,
    product_name: product?.name,
    product_code: product?.code,
    product_image: (row as { product_image?: string }).product_image ?? null,
    variant_sku: variant?.sku ?? null,
    variant_spec: variant?.spec_name && variant?.spec_value
      ? `${variant.spec_name}:${variant.spec_value}`
      : null,
    stock_status: computeStockStatus(inventory),
  };
}

function mapTransaction(row: Record<string, unknown>): InventoryTransaction {
  const t = row as unknown as InventoryTransaction;
  const inv = row.inventory as
    | { product_id?: string; products?: { name?: string; code?: string } }
    | undefined;
  const createdBy = row.created_by as { display_name?: string } | null;

  return {
    ...t,
    product_name: inv?.products?.name,
    created_by_name: createdBy?.display_name,
  };
}

function computeStockStatus(inv: Pick<Inventory, 'quantity' | 'min_stock' | 'max_stock'>): StockStatus {
  const { quantity, min_stock, max_stock } = inv;

  if (quantity <= 0) return 'out_of_stock';
  if (max_stock != null && quantity >= max_stock) return 'overstock';
  if (quantity <= (min_stock || 0)) return 'low_stock';
  return 'in_stock';
}

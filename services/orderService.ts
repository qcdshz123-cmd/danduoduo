import { supabase } from './supabase';
import type { Order, OrderItem, Payment, OrderStatusHistory, PaginatedResponse } from '../types/models';
import type { OrderStatus, PaymentMethod } from '../types/enums';
import { config } from '../constants/config';
import { z } from 'zod';

// ── DTOs ────────────────────────────────────────────────────────
export interface CreateOrderDto {
  customer_id?: string | null;
  notes?: string | null;
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    sku?: string | null;
    quantity: number;
    unit: string;
    unit_price: number;
  }>;
}

export interface OrderQueryParams {
  status?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RecordPaymentDto {
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
}

export const createOrderItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  product_name: z.string().min(1),
  sku: z.string().nullable().optional(),
  quantity: z.number().int().min(1),
  unit: z.string().default('件'),
  unit_price: z.number().min(0),
});

export const createOrderSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  items: z.array(createOrderItemSchema).min(1, '至少需要一个商品'),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, '收款金额必须大于0'),
  method: z.enum(['cash', 'wechat', 'alipay', 'bank_transfer']),
  reference: z.string().max(100).nullable().optional(),
  notes: z.string().max(200).nullable().optional(),
});

// ── Select fragments ────────────────────────────────────────────
const ORDER_DETAIL_SELECT =
  `*,
  customers(*),
  order_items(*),
  payments(*),
  order_status_history(*),
  created_by:profiles!orders_created_by_fkey(display_name)`;

// ── Service ─────────────────────────────────────────────────────
export const orderService = {
  /** Paginated order list */
  async findAll(params: OrderQueryParams = {}): Promise<PaginatedResponse<Order>> {
    const { status, search, page = 1, limit = config.pageSize } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select(
        `*,
        customers(name),
        order_items(id, quantity)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`order_number.ilike.%${safe}%,customers.name.ilike.%${safe}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []).map(mapOrderSummary),
      count: count ?? 0,
      hasMore: (count ?? 0) > to + 1,
    };
  },

  /** Full order detail */
  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_DETAIL_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapOrderDetail(data);
  },

  /** Create order with items */
  async create(dto: CreateOrderDto): Promise<Order> {
    const validated = createOrderSchema.parse(dto);
    const totalAmount = validated.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: validated.customer_id ?? null,
        notes: validated.notes ?? null,
        total_amount: totalAmount,
        discount_amount: 0,
        paid_amount: 0,
        status: 'pending' as OrderStatus,
        payment_status: 'unpaid',
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = validated.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      product_name: item.product_name,
      sku: item.sku ?? null,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    const fullOrder = await orderService.findById(order.id);
    if (!fullOrder) throw new Error('Failed to retrieve created order');
    return fullOrder;
  },

  // ── Status Transitions ────────────────────────────────────
  async confirm(id: string): Promise<Order> {
    // Log BEFORE status update: if logging fails, the status won't change
    await logStatus(id, 'pending', 'confirmed');

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('status', 'pending')
      .select(ORDER_DETAIL_SELECT)
      .single();
    if (error) throw error;

    return mapOrderDetail(data);
  },

  async ship(id: string): Promise<Order> {
    await logStatus(id, 'confirmed', 'shipped');

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'shipped', shipped_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'confirmed')
      .select(ORDER_DETAIL_SELECT)
      .single();
    if (error) throw error;

    return mapOrderDetail(data);
  },

  async complete(id: string): Promise<Order> {
    await logStatus(id, 'shipped', 'completed');

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'shipped')
      .select(ORDER_DETAIL_SELECT)
      .single();
    if (error) throw error;

    return mapOrderDetail(data);
  },

  async cancel(id: string, reason?: string): Promise<Order> {
    await logStatus(id, null, 'cancelled', reason);

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_reason: reason ?? null,
      })
      .eq('id', id)
      .in('status', ['pending', 'confirmed'])
      .select(ORDER_DETAIL_SELECT)
      .single();
    if (error) throw error;

    return mapOrderDetail(data);
  },

  // ── Payments ──────────────────────────────────────────────
  async recordPayment(orderId: string, dto: RecordPaymentDto): Promise<Payment> {
    const validated = recordPaymentSchema.parse(dto);
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount: validated.amount,
        method: validated.method,
        reference: validated.reference ?? null,
        notes: validated.notes ?? null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPayments(orderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*, changed_by:profiles(display_name)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((h: Record<string, unknown>) => ({
      ...h,
      changed_by_name: extractDisplayName(h.changed_by),
    })) as OrderStatusHistory[];
  },
};

// ── Internal helpers ────────────────────────────────────────────

async function logStatus(
  orderId: string,
  from: OrderStatus | null,
  to: OrderStatus,
  notes?: string | null
) {
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    from_status: from,
    to_status: to,
    notes: notes ?? null,
  });
}

// ── Mappers ─────────────────────────────────────────────────────

function mapOrderSummary(row: Record<string, unknown>): Order {
  const order = row as unknown as Order;
  const customer = row.customers as { name?: string } | null;
  const items = row.order_items as Array<{ quantity: number }> | undefined;

  return {
    ...order,
    customer_name: customer?.name ?? '散客',
    item_count: items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
    customer: row.customers as Order['customer'],
  } as Order & { customer_name: string; item_count: number };
}

function mapOrderDetail(row: Record<string, unknown>): Order {
  return {
    ...(row as unknown as Order),
    customer: (row.customers as Order['customer']) ?? null,
    items: (row.order_items as OrderItem[]) ?? [],
    payments: (row.payments as Payment[]) ?? [],
    status_history: (row.order_status_history as OrderStatusHistory[]) ?? [],
    created_by_name: extractDisplayName(row.created_by),
  };
}

function extractDisplayName(v: unknown): string | undefined {
  if (!v) return undefined;
  if (Array.isArray(v)) return (v[0] as { display_name?: string })?.display_name;
  return (v as { display_name?: string }).display_name;
}

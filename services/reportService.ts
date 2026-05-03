import { supabase } from './supabase';
import type { SalesSummary, TopProduct } from '../types/models';

// ── DTOs ────────────────────────────────────────────────────────

export interface DateRangeParams {
  startDate: string; // ISO 8601 date string e.g. '2026-05-01'
  endDate: string;   // ISO 8601 date string e.g. '2026-05-31'
}

export interface RevenueProfitRow {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface InventoryReportRow {
  status: string;
  count: number;
  totalValue: number;
}

export interface CustomerOrderStat {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  orderCount: number;
  totalAmount: number;
  avgOrderValue: number;
}

// ── Select fragment ────────────────────────────────────────────

const ORDER_ITEMS_SELECT = `
  id,
  order_id,
  quantity,
  unit_price,
  total_price,
  product_id,
  created_at,
  products!inner(name, code, cost_price)
`;

// ── Service ─────────────────────────────────────────────────────

export const reportService = {

  /**
   * 销售概览：按天聚合订单数据
   * 从已完成/已发货/已确认的订单中按 created_at 天分组聚合
   * 策略：全量获取时间段内订单，客户端 Map 聚合
   */
  async getSalesSummary(params: DateRangeParams): Promise<SalesSummary[]> {
    const { startDate, endDate } = params;

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .in('status', ['completed', 'shipped', 'confirmed'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 按天聚合
    const dailyMap = new Map<string, { revenue: number; orderCount: number }>();
    for (const row of data ?? []) {
      const day = (row.created_at as string).slice(0, 10);
      const existing = dailyMap.get(day) ?? { revenue: 0, orderCount: 0 };
      existing.revenue += (row.total_amount as number) || 0;
      existing.orderCount += 1;
      dailyMap.set(day, existing);
    }

    // 获取每天的利润（从 order_items + products.cost_price）
    const { data: items } = await supabase
      .from('order_items')
      .select(ORDER_ITEMS_SELECT)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    const dailyProfit = new Map<string, number>();
    const dailyItems = new Map<string, number>();
    for (const item of items ?? []) {
      const day = (item.created_at as string).slice(0, 10);
      const costPrice = (item.products as { cost_price?: number } | null)?.cost_price ?? 0;
      const revenue = (item.total_price as number) || 0;
      const profit = revenue - costPrice * (item.quantity as number);

      dailyProfit.set(day, (dailyProfit.get(day) ?? 0) + profit);
      dailyItems.set(day, (dailyItems.get(day) ?? 0) + (item.quantity as number));
    }

    const result: SalesSummary[] = [];
    for (const [day, stats] of dailyMap) {
      result.push({
        period: day,
        order_count: stats.orderCount,
        total_revenue: stats.revenue,
        total_profit: dailyProfit.get(day) ?? 0,
        avg_order_value: stats.orderCount > 0 ? Math.round(stats.revenue / stats.orderCount * 100) / 100 : 0,
        item_count: dailyItems.get(day) ?? 0,
      });
    }

    return result.sort((a, b) => a.period.localeCompare(b.period));
  },

  /**
   * 营收利润：按天聚合营收/成本/毛利
   */
  async getRevenueProfit(params: DateRangeParams): Promise<RevenueProfitRow[]> {
    const { startDate, endDate } = params;

    const { data, error } = await supabase
      .from('order_items')
      .select(ORDER_ITEMS_SELECT)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (error) throw error;

    const dailyMap = new Map<string, { revenue: number; cost: number; orderIds: Set<string> }>();

    for (const item of data ?? []) {
      const day = (item.created_at as string).slice(0, 10);
      const entry = dailyMap.get(day) ?? { revenue: 0, cost: 0, orderIds: new Set() };

      const qty = (item.quantity as number) || 0;
      const unitPrice = (item.unit_price as number) || 0;
      const costPrice = (item.products as { cost_price?: number } | null)?.cost_price ?? 0;

      entry.revenue += unitPrice * qty;
      entry.cost += costPrice * qty;
      if ((item as { order_id?: string }).order_id) {
        entry.orderIds.add((item as { order_id: string }).order_id);
      }
      dailyMap.set(day, entry);
    }

    const result: RevenueProfitRow[] = [];
    for (const [day, stats] of dailyMap) {
      result.push({
        date: day,
        revenue: Math.round(stats.revenue * 100) / 100,
        cost: Math.round(stats.cost * 100) / 100,
        profit: Math.round((stats.revenue - stats.cost) * 100) / 100,
        orderCount: stats.orderIds.size,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * 热销排行：按商品聚合销量和销售额
   */
  async getTopProducts(params: DateRangeParams & { limit?: number }): Promise<TopProduct[]> {
    const { startDate, endDate, limit = 10 } = params;

    const { data, error } = await supabase
      .from('order_items')
      .select(ORDER_ITEMS_SELECT)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (error) throw error;

    // 按 product_id 聚合
    const productMap = new Map<string, {
      product_name: string;
      product_code: string;
      quantity_sold: number;
      total_revenue: number;
    }>();

    for (const item of data ?? []) {
      const pid = item.product_id as string;
      const product = item.products as { name?: string; code?: string } | null;
      const entry = productMap.get(pid) ?? {
        product_name: product?.name ?? '未知商品',
        product_code: product?.code ?? '',
        quantity_sold: 0,
        total_revenue: 0,
      };

      entry.quantity_sold += (item.quantity as number) || 0;
      entry.total_revenue += (item.total_price as number) || 0;
      productMap.set(pid, entry);
    }

    const totalRevenue = [...productMap.values()].reduce((sum, p) => sum + p.total_revenue, 0);

    const sorted = [...productMap.entries()]
      .map(([product_id, stats]) => ({
        product_id,
        product_name: stats.product_name,
        product_code: stats.product_code,
        product_image: null as string | null,
        quantity_sold: stats.quantity_sold,
        total_revenue: Math.round(stats.total_revenue * 100) / 100,
        percentage: totalRevenue > 0 ? Math.round((stats.total_revenue / totalRevenue) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);

    return sorted;
  },

  /**
   * 库存报告：按库存状态聚合
   * 使用客户端计算 stock_status（与 inventoryService 一致）
   */
  async getInventoryReport(): Promise<InventoryReportRow[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('quantity, min_stock, max_stock, products!inner(base_price)');

    if (error) throw error;

    const statusMap = new Map<string, { count: number; totalValue: number }>();

    for (const row of data ?? []) {
      const quantity = (row.quantity as number) || 0;
      const minStock = (row.min_stock as number) || 0;
      const maxStock = (row.max_stock as number | null) ?? null;
      const basePrice = (row.products as { base_price?: number } | null)?.base_price ?? 0;

      // 计算库存状态（与 inventoryService.computeStockStatus 一致）
      let status: string;
      if (quantity <= 0) {
        status = '缺货';
      } else if (maxStock != null && quantity >= maxStock) {
        status = '超库存';
      } else if (quantity <= minStock) {
        status = '低库存';
      } else {
        status = '正常';
      }

      const entry = statusMap.get(status) ?? { count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += quantity * basePrice;
      statusMap.set(status, entry);
    }

    return [...statusMap.entries()].map(([status, stats]) => ({
      status,
      count: stats.count,
      totalValue: Math.round(stats.totalValue * 100) / 100,
    }));
  },

  /**
   * 客户订单统计：按客户聚合订单数和金额
   */
  async getCustomerOrderStats(params: DateRangeParams): Promise<CustomerOrderStat[]> {
    const { startDate, endDate } = params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        customer_id,
        customers!inner(name, phone)
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .not('customer_id', 'is', null)
      .in('status', ['completed', 'shipped', 'confirmed']);

    if (error) throw error;

    const customerMap = new Map<string, {
      customerName: string;
      customerPhone: string | null;
      orderCount: number;
      totalAmount: number;
    }>();

    for (const row of data ?? []) {
      const cid = row.customer_id as string;
      const customer = row.customers as { name?: string; phone?: string } | null;
      const entry = customerMap.get(cid) ?? {
        customerName: customer?.name ?? '未知客户',
        customerPhone: customer?.phone ?? null,
        orderCount: 0,
        totalAmount: 0,
      };

      entry.orderCount += 1;
      entry.totalAmount += (row.total_amount as number) || 0;
      customerMap.set(cid, entry);
    }

    return [...customerMap.entries()]
      .map(([customerId, stats]) => ({
        customerId,
        customerName: stats.customerName,
        customerPhone: stats.customerPhone,
        orderCount: stats.orderCount,
        totalAmount: Math.round(stats.totalAmount * 100) / 100,
        avgOrderValue: stats.orderCount > 0
          ? Math.round((stats.totalAmount / stats.orderCount) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  },
};

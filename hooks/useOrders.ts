import { useState, useEffect, useCallback } from 'react';
import { orderService, OrderQueryParams } from '../services/orderService';
import type { Order, PaginatedResponse } from '../types/models';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useOrders(params: OrderQueryParams = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p: number, append: boolean) => {
    const { status, search, limit } = params;
    try {
      if (p === 1 && !append) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      const result: PaginatedResponse<Order> = await orderService.findAll({ status, search, limit, page: p });
      setOrders((prev) => (append ? [...prev, ...result.data] : result.data));
      setHasMore(result.hasMore);
      setTotal(result.count);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载订单失败');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [params.status, params.search, params.limit]);

  useEffect(() => { setPage(1); fetch(1, false); }, [fetch]);

  const refresh = useCallback(async () => { setPage(1); await fetch(1, false); }, [fetch]);
  const loadMore = useCallback(async () => {
    if (!hasMore || isRefreshing) return;
    const next = page + 1;
    setPage(next);
    await fetch(next, true);
  }, [hasMore, isRefreshing, page, fetch]);

  return { orders, isLoading, isRefreshing, error, hasMore, total, refresh, loadMore };
}

import { useState, useEffect, useCallback } from 'react';
import { inventoryService, TransactionQueryParams } from '../services/inventoryService';
import type { InventoryTransaction, PaginatedResponse } from '../types/models';

interface UseInventoryTransactionsReturn {
  transactions: InventoryTransaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useInventoryTransactions(
  params: TransactionQueryParams = {}
): UseInventoryTransactionsReturn {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p: number, append: boolean) => {
    const { inventoryId, productId, type, limit } = params;
    try {
      if (p === 1 && !append) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      const result: PaginatedResponse<InventoryTransaction> = await inventoryService.getTransactions({
        inventoryId,
        productId,
        type,
        limit,
        page: p,
      });
      setTransactions((prev) => (append ? [...prev, ...result.data] : result.data));
      setHasMore(result.hasMore);
      setTotal(result.count);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载交易记录失败');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [params.inventoryId, params.productId, params.type, params.limit]);

  useEffect(() => { setPage(1); fetch(1, false); }, [fetch]);

  const refresh = useCallback(async () => { setPage(1); await fetch(1, false); }, [fetch]);
  const loadMore = useCallback(async () => {
    if (!hasMore || isRefreshing) return;
    const next = page + 1;
    setPage(next);
    await fetch(next, true);
  }, [hasMore, isRefreshing, page, fetch]);

  return { transactions, isLoading, isRefreshing, error, hasMore, total, refresh, loadMore };
}

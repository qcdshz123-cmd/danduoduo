import { useState, useEffect, useCallback } from 'react';
import { customerService, CustomerQueryParams } from '../services/customerService';
import type { Customer, PaginatedResponse } from '../types/models';

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useCustomers(params: CustomerQueryParams = {}): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p: number, append: boolean) => {
    const { search, limit } = params;
    try {
      if (p === 1 && !append) setIsLoading(true);
      setError(null);
      const result: PaginatedResponse<Customer> = await customerService.findAll({ search, limit, page: p });
      setCustomers((prev) => (append ? [...prev, ...result.data] : result.data));
      setHasMore(result.hasMore);
      setTotal(result.count);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载客户失败');
    } finally {
      setIsLoading(false);
    }
  }, [params.search, params.limit]);

  useEffect(() => { setPage(1); fetch(1, false); }, [fetch]);

  const refresh = useCallback(async () => { setPage(1); await fetch(1, false); }, [fetch]);
  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetch(next, true);
  }, [hasMore, page, fetch]);

  return { customers, isLoading, error, hasMore, total, refresh, loadMore };
}

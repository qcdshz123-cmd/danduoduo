import { useState, useEffect, useCallback } from 'react';
import { productService, ProductQueryParams } from '../services/productService';
import type { Product, PaginatedResponse } from '../types/models';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useProducts(params: ProductQueryParams = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(
    async (p: number, append: boolean) => {
      const { search, categoryId, limit } = params;
      try {
        if (p === 1 && !append) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);

        const result: PaginatedResponse<Product> = await productService.findAll({
          search,
          categoryId,
          limit,
          page: p,
        });

        setProducts((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasMore(result.hasMore);
        setTotal(result.count);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : '加载商品失败';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [params.search, params.categoryId, params.limit]
  );

  // Re-fetch when params change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchProducts(1, false);
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isRefreshing) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchProducts(nextPage, true);
  }, [hasMore, isRefreshing, page, fetchProducts]);

  return {
    products,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    total,
    refresh,
    loadMore,
  };
}

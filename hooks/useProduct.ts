import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/models';

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProduct(id: string | undefined): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.findById(id);
      setProduct(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '加载商品失败';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const refresh = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refresh };
}

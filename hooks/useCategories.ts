import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import type { ProductCategory } from '../types/models';

interface UseCategoriesReturn {
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryService.findAll();
      setCategories(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '加载分类失败';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refresh };
}

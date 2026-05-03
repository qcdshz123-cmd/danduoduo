import { supabase } from './supabase';
import type { ProductCategory } from '../types/models';

export const categoryService = {
  /** Get all active categories for the current store, ordered by sort_order */
  async findAll(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /** Get categories as a nested tree */
  async findTree(): Promise<ProductCategory[]> {
    const all = await categoryService.findAll();
    return buildTree(all);
  },

  /** Get a single category */
  async findById(id: string): Promise<ProductCategory | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /** Create a new category */
  async create(category: {
    name: string;
    parent_id?: string | null;
    sort_order?: number;
    image_url?: string | null;
  }): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        name: category.name,
        parent_id: category.parent_id ?? null,
        sort_order: category.sort_order ?? 0,
        image_url: category.image_url ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Update a category */
  async update(
    id: string,
    updates: Partial<{
      name: string;
      parent_id: string | null;
      sort_order: number;
      image_url: string | null;
      is_active: boolean;
    }>
  ): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Soft-delete a category */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  /** Reorder categories (best-effort; partial failure may leave inconsistent sort_order) */
  async reorder(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    for (const { id, sort_order } of items) {
      const { error } = await supabase.from('product_categories').update({ sort_order }).eq('id', id);
      if (error) {
        throw new Error(`Failed to reorder category ${id}: ${error.message}`);
      }
    }
  },
};

// ── Helpers ─────────────────────────────────────────────────────

function buildTree(categories: ProductCategory[], parentId: string | null = null): ProductCategory[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

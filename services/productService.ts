import { supabase } from './supabase';
import type { Product, ProductVariant, ProductImage, ProductPriceTier, PaginatedResponse } from '../types/models';
import { StockStatus } from '../types/enums';
import { createProductSchema, updateProductSchema } from './validators';
import { config } from '../constants/config';

// ── DTOs ────────────────────────────────────────────────────────
export interface CreateProductDto {
  name: string;
  code: string;
  barcode?: string | null;
  category_id?: string | null;
  description?: string | null;
  unit?: string;
  base_price: number;
  cost_price?: number | null;
  min_stock?: number;
  max_stock?: number | null;
  has_variants?: boolean;
  tags?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  is_active?: boolean;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface CreateVariantDto {
  product_id: string;
  sku: string;
  barcode?: string | null;
  spec_name?: string | null;
  spec_value?: string | null;
  price?: number | null;
  cost_price?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

// ── Service ─────────────────────────────────────────────────────
export const productService = {
  /** Paginated product list with search & category filter */
  async findAll(params: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> {
    const { search, categoryId, page = 1, limit = config.pageSize } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*, categories:product_categories(*), product_variants(*), product_images(*)', {
        count: 'exact',
      })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []).map(mapProductRow),
      count: count ?? 0,
      hasMore: (count ?? 0) > to + 1,
    };
  },

  /** Single product with all relations */
  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(
        `*,
        categories:product_categories(*),
        product_variants(*),
        product_images(*),
        product_price_tiers(*),
        inventories(*)`
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return mapProductRow(data);
  },

  /** Get product by barcode (searches both product and variant barcodes) */
  async findByBarcode(barcode: string): Promise<Product | null> {
    // First try direct product barcode
    const { data: byProduct } = await supabase
      .from('products')
      .select('*, categories:product_categories(*), product_variants(*), product_images(*)')
      .eq('barcode', barcode)
      .single();

    if (byProduct) return mapProductRow(byProduct);

    // Then try variant barcode
    const { data: byVariant } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('barcode', barcode)
      .single();

    if (byVariant) {
      return productService.findById(byVariant.product_id);
    }

    return null;
  },

  /** Create a new product */
  async create(dto: CreateProductDto): Promise<Product> {
    const validated = createProductSchema.parse(dto);
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: validated.name,
        code: validated.code,
        barcode: validated.barcode ?? null,
        category_id: validated.category_id ?? null,
        description: validated.description ?? null,
        unit: validated.unit,
        base_price: validated.base_price,
        cost_price: validated.cost_price ?? null,
        min_stock: validated.min_stock,
        max_stock: validated.max_stock ?? null,
        has_variants: validated.has_variants,
        tags: validated.tags,
      })
      .select()
      .single();

    if (error) throw error;
    return mapProductRow(data);
  },

  /** Update a product */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const validated = updateProductSchema.parse(dto);
    const updates: Record<string, unknown> = {};
    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.code !== undefined) updates.code = validated.code;
    if (validated.barcode !== undefined) updates.barcode = validated.barcode;
    if (validated.category_id !== undefined) updates.category_id = validated.category_id;
    if (validated.description !== undefined) updates.description = validated.description;
    if (validated.unit !== undefined) updates.unit = validated.unit;
    if (validated.base_price !== undefined) updates.base_price = validated.base_price;
    if (validated.cost_price !== undefined) updates.cost_price = validated.cost_price;
    if (validated.min_stock !== undefined) updates.min_stock = validated.min_stock;
    if (validated.max_stock !== undefined) updates.max_stock = validated.max_stock;
    if (validated.has_variants !== undefined) updates.has_variants = validated.has_variants;
    if (validated.tags !== undefined) updates.tags = validated.tags;
    if (validated.is_active !== undefined) updates.is_active = validated.is_active;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapProductRow(data);
  },

  /** Soft-delete a product */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // ── Variants ───────────────────────────────────────────────
  async createVariant(dto: CreateVariantDto): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: dto.product_id,
        sku: dto.sku,
        barcode: dto.barcode ?? null,
        spec_name: dto.spec_name ?? null,
        spec_value: dto.spec_value ?? null,
        price: dto.price ?? null,
        cost_price: dto.cost_price ?? null,
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateVariant(id: string, dto: UpdateVariantDto): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteVariant(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Price Tiers ────────────────────────────────────────────
  async createPriceTier(tier: Omit<ProductPriceTier, 'id' | 'created_at'>): Promise<ProductPriceTier> {
    const { data, error } = await supabase
      .from('product_price_tiers')
      .insert(tier)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePriceTier(id: string, updates: Partial<ProductPriceTier>): Promise<ProductPriceTier> {
    const { data, error } = await supabase
      .from('product_price_tiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePriceTier(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_price_tiers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Images ─────────────────────────────────────────────────
  async addImage(image: Omit<ProductImage, 'id' | 'created_at'>): Promise<ProductImage> {
    const { data, error } = await supabase
      .from('product_images')
      .insert(image)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /** Upload a product image to Supabase Storage and return the public URL */
  async uploadImage(productId: string, uri: string, fileName: string): Promise<string> {
    const ext = fileName.split('.').pop() ?? 'jpg';
    const path = `products/${productId}/${Date.now()}.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, blob, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return urlData.publicUrl;
  },
};

// ── Helpers ─────────────────────────────────────────────────────

function mapProductRow(row: Record<string, unknown>): Product {
  const product = row as unknown as Product;
  return {
    ...product,
    category: (row.categories as Product['category']) ?? null,
    variants: (row.product_variants as ProductVariant[]) ?? [],
    images: (row.product_images as ProductImage[]) ?? [],
    price_tiers: (row.product_price_tiers as ProductPriceTier[]) ?? [],
    stock_quantity: computeStockQuantity(row.inventories),
    stock_status: computeStockStatus(row.inventories, product.min_stock),
  };
}

function computeStockQuantity(inventories: unknown): number {
  const invs = inventories as Array<{ quantity: number; locked_quantity: number }> | undefined;
  if (!invs || invs.length === 0) return 0;
  return invs.reduce((sum, i) => sum + (i.quantity - (i.locked_quantity ?? 0)), 0);
}

function computeStockStatus(inventories: unknown, minStock: number): StockStatus {
  const qty = computeStockQuantity(inventories);
  if (qty <= 0) return StockStatus.OUT_OF_STOCK;
  if (qty <= minStock) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}

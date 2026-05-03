import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, '商品名称不能为空').max(100),
  code: z.string().min(1, '商品编号不能为空').max(50),
  barcode: z.string().max(50).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  unit: z.string().max(20).default('件'),
  base_price: z.number().min(0, '售价不能为负数'),
  cost_price: z.number().min(0).nullable().optional(),
  min_stock: z.number().int().min(0).default(1),
  max_stock: z.number().int().min(0).nullable().optional(),
  has_variants: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(20).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createVariantSchema = z.object({
  product_id: z.string().uuid(),
  sku: z.string().min(1, 'SKU不能为空').max(50),
  barcode: z.string().max(50).nullable().optional(),
  spec_name: z.string().max(50).nullable().optional(),
  spec_value: z.string().max(50).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  cost_price: z.number().min(0).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const updateVariantSchema = createVariantSchema.partial();

export const createPriceTierSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1, '等级名称不能为空').max(50),
  min_qty: z.number().int().min(1, '起批量至少为1'),
  price: z.number().min(0, '价格不能为负数'),
});

export const updatePriceTierSchema = createPriceTierSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().default(0),
  image_url: z.string().url().nullable().optional(),
});

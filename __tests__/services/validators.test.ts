import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  createPriceTierSchema,
  updatePriceTierSchema,
  createCategorySchema,
} from '../../services/validators';

describe('createProductSchema', () => {
  const validProduct = {
    name: '测试商品',
    code: 'P001',
    base_price: 99.99,
  };

  it('validates a complete valid product', () => {
    expect(() =>
      createProductSchema.parse({
        ...validProduct,
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        description: 'desc',
        unit: '件',
        cost_price: 50,
        min_stock: 10,
        max_stock: 100,
        has_variants: false,
        tags: ['新品'],
      }),
    ).not.toThrow();
  });

  it('validates a minimal valid product', () => {
    expect(() => createProductSchema.parse(validProduct)).not.toThrow();
  });

  it('applies defaults for optional fields', () => {
    const result = createProductSchema.parse(validProduct);
    expect(result.unit).toBe('件');
    expect(result.min_stock).toBe(1);
    expect(result.has_variants).toBe(false);
    expect(result.tags).toEqual([]);
  });

  it('rejects empty name', () => {
    expect(() => createProductSchema.parse({ ...validProduct, name: '' })).toThrow(/不能为空/);
  });

  it('rejects name over 100 characters', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, name: 'A'.repeat(101) }),
    ).toThrow();
  });

  it('rejects empty code', () => {
    expect(() => createProductSchema.parse({ ...validProduct, code: '' })).toThrow(/不能为空/);
  });

  it('rejects negative base_price', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, base_price: -1 }),
    ).toThrow(/不能为负数/);
  });

  it('rejects negative cost_price', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, cost_price: -5 }),
    ).toThrow();
  });

  it('rejects negative min_stock', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, min_stock: -1 }),
    ).toThrow();
  });

  it('rejects non-integer min_stock', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, min_stock: 1.5 }),
    ).toThrow();
  });

  it('rejects tags with more than 20 items', () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
    expect(() => createProductSchema.parse({ ...validProduct, tags })).toThrow();
  });

  it('rejects tag string over 30 characters', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, tags: ['A'.repeat(31)] }),
    ).toThrow();
  });

  it('rejects non-UUID category_id', () => {
    expect(() =>
      createProductSchema.parse({ ...validProduct, category_id: 'not-uuid' }),
    ).toThrow();
  });

  it('accepts null for nullable optional fields', () => {
    expect(() =>
      createProductSchema.parse({
        ...validProduct,
        barcode: null,
        category_id: null,
        description: null,
        cost_price: null,
        max_stock: null,
      }),
    ).not.toThrow();
  });
});

describe('updateProductSchema', () => {
  it('accepts empty object (all fields partial)', () => {
    expect(() => updateProductSchema.parse({})).not.toThrow();
  });

  it('accepts partial updates', () => {
    const result = updateProductSchema.parse({ name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('accepts is_active flag', () => {
    const result = updateProductSchema.parse({ is_active: false });
    expect(result.is_active).toBe(false);
  });
});

describe('createVariantSchema', () => {
  const validVariant = {
    product_id: '550e8400-e29b-41d4-a716-446655440000',
    sku: 'SKU-001',
  };

  it('validates a valid variant', () => {
    expect(() => createVariantSchema.parse(validVariant)).not.toThrow();
  });

  it('rejects empty SKU', () => {
    expect(() => createVariantSchema.parse({ ...validVariant, sku: '' })).toThrow(
      /不能为空/,
    );
  });

  it('applies defaults', () => {
    const result = createVariantSchema.parse(validVariant);
    expect(result.sort_order).toBe(0);
    expect(result.is_active).toBe(true);
  });

  it('rejects non-UUID product_id', () => {
    expect(() =>
      createVariantSchema.parse({ ...validVariant, product_id: 'bad' }),
    ).toThrow();
  });
});

describe('updateVariantSchema', () => {
  it('accepts empty object', () => {
    expect(() => updateVariantSchema.parse({})).not.toThrow();
  });
});

describe('createPriceTierSchema', () => {
  const validTier = {
    product_id: '550e8400-e29b-41d4-a716-446655440000',
    name: '批发价',
    min_qty: 10,
    price: 80,
  };

  it('validates a valid price tier', () => {
    expect(() => createPriceTierSchema.parse(validTier)).not.toThrow();
  });

  it('rejects empty name', () => {
    expect(() => createPriceTierSchema.parse({ ...validTier, name: '' })).toThrow(
      /不能为空/,
    );
  });

  it('rejects min_qty less than 1', () => {
    expect(() =>
      createPriceTierSchema.parse({ ...validTier, min_qty: 0 }),
    ).toThrow(/至少为1/);
  });

  it('rejects negative price', () => {
    expect(() =>
      createPriceTierSchema.parse({ ...validTier, price: -1 }),
    ).toThrow(/不能为负数/);
  });
});

describe('updatePriceTierSchema', () => {
  it('accepts empty object', () => {
    expect(() => updatePriceTierSchema.parse({})).not.toThrow();
  });
});

describe('createCategorySchema', () => {
  const validCategory = { name: '服装' };

  it('validates a valid category', () => {
    expect(() => createCategorySchema.parse(validCategory)).not.toThrow();
  });

  it('rejects empty name', () => {
    expect(() => createCategorySchema.parse({ name: '' })).toThrow(/不能为空/);
  });

  it('accepts optional parent_id UUID', () => {
    const result = createCategorySchema.parse({
      ...validCategory,
      parent_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.parent_id).toBeDefined();
  });

  it('rejects non-UUID parent_id', () => {
    expect(() =>
      createCategorySchema.parse({ ...validCategory, parent_id: 'bad' }),
    ).toThrow();
  });

  it('rejects non-URL image_url', () => {
    expect(() =>
      createCategorySchema.parse({ ...validCategory, image_url: 'not-a-url' }),
    ).toThrow();
  });

  it('applies sort_order default of 0', () => {
    const result = createCategorySchema.parse(validCategory);
    expect(result.sort_order).toBe(0);
  });
});

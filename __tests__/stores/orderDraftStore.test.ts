import { act } from '@testing-library/react-native';
import { useOrderDraftStore } from '../../stores/orderDraftStore';
import type { Product, Customer } from '../../types/models';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: '测试商品',
  code: 'P001',
  store_id: 'store-1',
  category_id: null,
  description: null,
  unit: '件',
  base_price: 99.99,
  cost_price: null,
  barcode: null,
  min_stock: 10,
  max_stock: null,
  has_variants: false,
  is_active: true,
  tags: [],
  metadata: {},
  created_at: '',
  updated_at: '',
  ...overrides,
});

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: 'cust-1',
  store_id: 'store-1',
  profile_id: null,
  name: '测试客户',
  code: 'C001',
  contact_person: null,
  phone: '13800138000',
  wechat: null,
  address: null,
  notes: null,
  credit_limit: null,
  balance: 0,
  default_price_level: 'retail',
  is_active: true,
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('orderDraftStore', () => {
  beforeEach(() => {
    act(() => { useOrderDraftStore.getState().clearDraft(); });
  });

  describe('initial state', () => {
    it('has empty cart', () => {
      expect(useOrderDraftStore.getState().cartItems).toEqual([]);
    });

    it('has null customer', () => {
      expect(useOrderDraftStore.getState().selectedCustomer).toBeNull();
    });

    it('has empty notes', () => {
      expect(useOrderDraftStore.getState().notes).toBe('');
    });
  });

  describe('addToCart', () => {
    it('adds products to cart with quantity 1', () => {
      const product = makeProduct();
      act(() => { useOrderDraftStore.getState().addToCart([product]); });

      const items = useOrderDraftStore.getState().cartItems;
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('prod-1');
      expect(items[0].quantity).toBe(1);
    });

    it('adds multiple products at once', () => {
      const p1 = makeProduct({ id: 'p1', name: 'A' });
      const p2 = makeProduct({ id: 'p2', name: 'B' });
      act(() => { useOrderDraftStore.getState().addToCart([p1, p2]); });

      expect(useOrderDraftStore.getState().cartItems).toHaveLength(2);
    });

    it('does not add duplicate products', () => {
      const product = makeProduct();
      act(() => { useOrderDraftStore.getState().addToCart([product]); });
      act(() => { useOrderDraftStore.getState().addToCart([product]); });

      expect(useOrderDraftStore.getState().cartItems).toHaveLength(1);
    });

    it('skips duplicates when adding a mixed batch', () => {
      const p1 = makeProduct({ id: 'p1' });
      const p2 = makeProduct({ id: 'p2' });
      act(() => { useOrderDraftStore.getState().addToCart([p1]); });
      act(() => { useOrderDraftStore.getState().addToCart([p1, p2]); });

      expect(useOrderDraftStore.getState().cartItems).toHaveLength(2);
    });

    it('handles empty products array', () => {
      act(() => { useOrderDraftStore.getState().addToCart([]); });
      expect(useOrderDraftStore.getState().cartItems).toEqual([]);
    });
  });

  describe('updateQty', () => {
    it('updates quantity of an item', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      act(() => { useOrderDraftStore.getState().updateQty('prod-1', 5); });

      expect(useOrderDraftStore.getState().cartItems[0].quantity).toBe(5);
    });

    it('clamps quantity to minimum of 1', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      act(() => { useOrderDraftStore.getState().updateQty('prod-1', 3); });
      act(() => { useOrderDraftStore.getState().updateQty('prod-1', 0); });

      expect(useOrderDraftStore.getState().cartItems[0].quantity).toBe(1);
    });

    it('does nothing for non-existent product id', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      act(() => { useOrderDraftStore.getState().updateQty('non-existent', 10); });

      expect(useOrderDraftStore.getState().cartItems[0].quantity).toBe(1);
    });

    it('does not mutate the original item', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      const before = useOrderDraftStore.getState().cartItems[0];

      act(() => { useOrderDraftStore.getState().updateQty('prod-1', 3); });

      const after = useOrderDraftStore.getState().cartItems[0];
      expect(after).not.toBe(before);
      expect(before.quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('removes an item by product id', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      act(() => { useOrderDraftStore.getState().removeFromCart('prod-1'); });

      expect(useOrderDraftStore.getState().cartItems).toHaveLength(0);
    });

    it('does nothing for non-existent product id', () => {
      act(() => { useOrderDraftStore.getState().addToCart([makeProduct()]); });
      act(() => { useOrderDraftStore.getState().removeFromCart('wrong'); });

      expect(useOrderDraftStore.getState().cartItems).toHaveLength(1);
    });
  });

  describe('setCustomer', () => {
    it('sets selected customer', () => {
      const customer = makeCustomer();
      act(() => { useOrderDraftStore.getState().setCustomer(customer); });

      expect(useOrderDraftStore.getState().selectedCustomer).toEqual(customer);
    });

    it('clears customer when null is passed', () => {
      act(() => { useOrderDraftStore.getState().setCustomer(makeCustomer()); });
      act(() => { useOrderDraftStore.getState().setCustomer(null); });

      expect(useOrderDraftStore.getState().selectedCustomer).toBeNull();
    });
  });

  describe('setNotes', () => {
    it('sets notes', () => {
      act(() => { useOrderDraftStore.getState().setNotes('备注信息'); });
      expect(useOrderDraftStore.getState().notes).toBe('备注信息');
    });
  });

  describe('clearDraft', () => {
    it('resets all state to defaults', () => {
      act(() => {
        const store = useOrderDraftStore.getState();
        store.addToCart([makeProduct()]);
        store.setCustomer(makeCustomer());
        store.setNotes('test');
      });

      act(() => { useOrderDraftStore.getState().clearDraft(); });

      const state = useOrderDraftStore.getState();
      expect(state.cartItems).toEqual([]);
      expect(state.selectedCustomer).toBeNull();
      expect(state.notes).toBe('');
    });
  });
});

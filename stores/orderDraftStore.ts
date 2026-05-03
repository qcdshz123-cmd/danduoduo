import { create } from 'zustand';
import type { Product, Customer } from '../types/models';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderDraftState {
  cartItems: CartItem[];
  selectedCustomer: (Customer & { customer_name?: string }) | null;
  notes: string;

  // Actions
  setCustomer: (customer: Customer | null) => void;
  addToCart: (products: Product[]) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setNotes: (notes: string) => void;
  clearDraft: () => void;
}

export const useOrderDraftStore = create<OrderDraftState>((set) => ({
  cartItems: [],
  selectedCustomer: null,
  notes: '',

  setCustomer: (customer) => set({ selectedCustomer: customer }),

  addToCart: (products) =>
    set((state) => {
      const existingIds = new Set(state.cartItems.map((i) => i.product.id));
      const newItems = products
        .filter((p) => !existingIds.has(p.id))
        .map((p) => ({ product: p, quantity: 1 }));
      return { cartItems: [...state.cartItems, ...newItems] };
    }),

  updateQty: (productId, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),

  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    })),

  setNotes: (notes) => set({ notes }),

  clearDraft: () => set({ cartItems: [], selectedCustomer: null, notes: '' }),
}));

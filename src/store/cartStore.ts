import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  businessId: string;
}

interface CartState {
  items: CartItem[];
  businessId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  businessId: null,

  addItem: (item) => set((state) => {
    // Prevent ordering from multiple businesses at once
    if (state.businessId && state.businessId !== item.businessId) {
      // For now, we'll just return state (could throw an error or show a toast)
      return state;
    }

    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      };
    }
    return { items: [...state.items, item], businessId: item.businessId };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    return { items: newItems, businessId: newItems.length === 0 ? null : state.businessId };
  }),

  updateQuantity: (id, delta) => set((state) => {
    const newItems = state.items.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    });
    return { items: newItems };
  }),

  clearCart: () => set({ items: [], businessId: null }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));

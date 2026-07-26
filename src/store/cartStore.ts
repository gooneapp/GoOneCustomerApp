/**
 * GoOne Customer App — Cart Store
 */
import { create } from 'zustand';
interface CartItem { id: string; name: string; price: number; qty: number; businessId: string; businessName: string; unit?: string; }
interface CartState {
  items: CartItem[];
  businessId: string | null;
  businessName: string;
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
}
export const useCartStore = create<CartState>((set, get) => ({
  items: [], businessId: null, businessName: '',
  get itemCount() { return get().items.reduce((s, i) => s + i.qty, 0); },
  get total() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
  addItem: (product) => {
    const { items, businessId } = get();
    if (businessId && businessId !== product.businessId) {
      // Different business - clear cart
      set({ items: [{ ...product, qty: 1 }], businessId: product.businessId, businessName: product.businessName });
      return;
    }
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      set({ items: items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) });
    } else {
      set({ items: [...items, { ...product, qty: 1 }], businessId: product.businessId, businessName: product.businessName });
    }
  },
  updateQty: (id, delta) => {
    const items = get().items.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0);
    set({ items, businessId: items.length === 0 ? null : get().businessId, businessName: items.length === 0 ? '' : get().businessName });
  },
  clearCart: () => set({ items: [], businessId: null, businessName: '' }),
}));

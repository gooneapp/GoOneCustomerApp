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

// itemCount/total must be plain state fields recomputed on every mutation —
// NOT object getters on the initial state literal. Zustand's set() does a
// shallow `{...oldState, ...partial}` merge; spreading an object with a
// getter evaluates it once and bakes the result in as a plain value on the
// new object, permanently freezing it at whatever it was during the very
// first set() call (0, since the cart starts empty). That silently broke
// the cart/checkout total (always showed ₹0) despite items being present.
const derive = (items: CartItem[]) => ({
  itemCount: items.reduce((s, i) => s + i.qty, 0),
  total: items.reduce((s, i) => s + i.price * i.qty, 0),
});

export const useCartStore = create<CartState>((set, get) => ({
  items: [], businessId: null, businessName: '',
  itemCount: 0,
  total: 0,
  addItem: (product) => {
    const { items, businessId } = get();
    if (businessId && businessId !== product.businessId) {
      // Different business - clear cart
      const newItems = [{ ...product, qty: 1 }];
      set({ items: newItems, businessId: product.businessId, businessName: product.businessName, ...derive(newItems) });
      return;
    }
    const existing = items.find((i) => i.id === product.id);
    const newItems = existing
      ? items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...items, { ...product, qty: 1 }];
    set({ items: newItems, businessId: product.businessId, businessName: product.businessName, ...derive(newItems) });
  },
  updateQty: (id, delta) => {
    const items = get().items.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0);
    set({
      items,
      businessId: items.length === 0 ? null : get().businessId,
      businessName: items.length === 0 ? '' : get().businessName,
      ...derive(items),
    });
  },
  clearCart: () => set({ items: [], businessId: null, businessName: '', itemCount: 0, total: 0 }),
}));

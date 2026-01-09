import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  calculateTotal: () => void;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      total: 0,
      itemCount: 0,

      // Acciones
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Si el producto ya existe, actualizar cantidad
          const updatedItems = items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
          set({ items: updatedItems });
        } else {
          // Si es un producto nuevo, agregarlo
          const newItem: CartItem = { product, quantity };
          set({ items: [...items, newItem] });
        }

        get().calculateTotal();
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter((item) => item.product.id !== productId);
        set({ items: updatedItems });
        get().calculateTotal();
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
        get().calculateTotal();
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      getItemQuantity: (productId) => {
        const { items } = get();
        const item = items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      calculateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => {
          return sum + item.product.price * item.quantity;
        }, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ total, itemCount });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);

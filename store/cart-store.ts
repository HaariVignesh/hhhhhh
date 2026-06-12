import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Methods
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed getters
  itemCount: () => number;
  subtotal: () => number;
  hasItem: (productId: string, variantId?: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex !== -1) {
            const existing = state.items[existingIndex];
            const newQty = Math.min(
              existing.quantity + item.quantity,
              existing.stock
            );
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = { ...existing, quantity: newQty };
            return { items: updatedItems };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            const clamped = Math.max(1, Math.min(quantity, i.stock));
            return { ...i, quantity: clamped };
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      hasItem: (productId, variantId) => {
        return get().items.some(
          (i) =>
            i.productId === productId &&
            (variantId === undefined || i.variantId === variantId)
        );
      },
    }),
    {
      name: "nue-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

"use client";

import { useCartStore } from "@/store/cart-store";

export function useCart() {
  const store = useCartStore();

  return {
    ...store,
    isEmpty: store.items.length === 0,
  };
}

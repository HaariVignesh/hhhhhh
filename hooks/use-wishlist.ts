"use client";

import { useWishlistStore } from "@/store/wishlist-store";

export function useWishlist() {
  return useWishlistStore();
}

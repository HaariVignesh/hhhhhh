import type { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: { addresses: true; orders: true };
}>;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    category: true;
    reviews: { include: { user: { select: { name: true; image: true } } } };
  };
}>;

export type ProductCard = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { include: { images: true } }; variant: true } };
    payment: true;
    user: { select: { name: true; email: true } };
  };
}>;

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: { children: true; _count: { select: { products: true } } };
}>;

export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  colorHex?: string;
  quantity: number;
  stock: number;
};

export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  category: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "rating";
  page?: number;
  limit?: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type CouponValidation = {
  valid: boolean;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discount: number;
  message?: string;
};

export type CheckoutSession = {
  items: CartItem[];
  shipping: ShippingAddress;
  couponCode?: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  recentOrders: OrderWithRelations[];
  topProducts: Array<{ product: ProductCard; soldCount: number }>;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
};

export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: { user: { select: { name: true; image: true } } };
}>;

export type AddressFormData = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type SortOption = {
  label: string;
  value: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
];

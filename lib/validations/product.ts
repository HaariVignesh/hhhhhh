import { z } from "zod";

export const variantSchema = z.object({
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  colorHex: z
    .string()
    .regex(
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
      "Color hex must be a valid hex color (e.g. #fff or #ffffff)"
    )
    .optional(),
  sku: z.string().trim().optional(),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .optional(),
  stock: z
    .number({
      required_error: "Stock is required",
      invalid_type_error: "Stock must be a number",
    })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  isActive: z.boolean().default(true),
});

export const productSchema = z
  .object({
    name: z
      .string({ required_error: "Product name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be at most 255 characters")
      .trim(),
    slug: z
      .string({ required_error: "Slug is required" })
      .min(2, "Slug must be at least 2 characters")
      .max(255, "Slug must be at most 255 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens only"
      )
      .trim(),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .trim(),
    price: z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
      })
      .positive("Price must be greater than 0"),
    comparePrice: z
      .number({ invalid_type_error: "Compare price must be a number" })
      .positive("Compare price must be greater than 0")
      .optional(),
    costPrice: z
      .number({ invalid_type_error: "Cost price must be a number" })
      .positive("Cost price must be greater than 0")
      .optional(),
    categoryId: z
      .string({ required_error: "Category is required" })
      .min(1, "Category is required"),
    sku: z
      .string()
      .trim()
      .max(100, "SKU must be at most 100 characters")
      .optional(),
    material: z
      .string()
      .trim()
      .max(255, "Material must be at most 255 characters")
      .optional(),
    careInstructions: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    isFeatured: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine((data) => !data.comparePrice || data.comparePrice > data.price, {
    message: "Compare price must be greater than the sale price",
    path: ["comparePrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;

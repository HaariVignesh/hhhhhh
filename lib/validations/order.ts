import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim(),
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(
      /^(\+91[\s-]?)?[6-9]\d{9}$/,
      "Please enter a valid Indian phone number (+91 or 10 digits starting with 6-9)"
    ),
  addressLine1: z
    .string({ required_error: "Address line 1 is required" })
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address must be at most 255 characters")
    .trim(),
  addressLine2: z
    .string()
    .max(255, "Address line 2 must be at most 255 characters")
    .trim()
    .optional(),
  city: z
    .string({ required_error: "City is required" })
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters")
    .trim(),
  state: z
    .string({ required_error: "State is required" })
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be at most 100 characters")
    .trim(),
  postalCode: z
    .string({ required_error: "Postal code is required" })
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),
  country: z
    .string({ required_error: "Country is required" })
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be at most 100 characters")
    .trim()
    .default("India"),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().trim().toUpperCase().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

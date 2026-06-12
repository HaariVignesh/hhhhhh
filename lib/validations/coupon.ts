import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string({ required_error: "Coupon code is required" })
      .trim()
      .toUpperCase()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(
        /^[A-Z0-9]+$/,
        "Code must contain only uppercase letters and numbers"
      ),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional(),
    type: z.enum(["PERCENTAGE", "FIXED"], {
      required_error: "Discount type is required",
      invalid_type_error: "Type must be PERCENTAGE or FIXED",
    }),
    value: z
      .number({
        required_error: "Discount value is required",
        invalid_type_error: "Value must be a number",
      })
      .positive("Discount value must be greater than 0"),
    minOrderAmount: z
      .number({ invalid_type_error: "Minimum order amount must be a number" })
      .min(0, "Minimum order amount cannot be negative")
      .optional(),
    maxDiscount: z
      .number({ invalid_type_error: "Maximum discount must be a number" })
      .positive("Maximum discount must be greater than 0")
      .optional(),
    usageLimit: z
      .number({ invalid_type_error: "Usage limit must be a number" })
      .int("Usage limit must be a whole number")
      .positive("Usage limit must be greater than 0")
      .optional(),
    perUserLimit: z
      .number({
        required_error: "Per-user limit is required",
        invalid_type_error: "Per-user limit must be a number",
      })
      .int("Per-user limit must be a whole number")
      .min(1, "Per-user limit must be at least 1")
      .default(1),
    isActive: z.boolean().default(true),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE") {
        return data.value > 0 && data.value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1 and 100",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.startsAt && data.expiresAt) {
        return data.expiresAt > data.startsAt;
      }
      return true;
    },
    {
      message: "Expiry date must be after the start date",
      path: ["expiresAt"],
    }
  );

export type CouponInput = z.infer<typeof couponSchema>;

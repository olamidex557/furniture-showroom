import { z } from "zod";

export const updateProductDtoSchema = z.object({
  id: z.string().min(1, "Product ID is required."),

  name: z
    .string()
    .min(2, "Product name must be at least 2 characters long."),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters long."),

  price: z.coerce
    .number()
    .min(0, "Price must be greater than or equal to 0."),

  description: z
    .string()
    .nullable()
    .optional(),

  dimensions: z
    .string()
    .nullable()
    .optional(),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),

  isAvailable: z.boolean(),
});

export type UpdateProductDto = z.infer<typeof updateProductDtoSchema>;
import { z } from "zod";

export const updateProductDtoSchema = z.object({
  id: z.string().min(1, "Product ID is required."),
  name: z.string().min(2, "Product name is required."),
  category: z.string().min(2, "Category is required."),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  description: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  isAvailable: z.boolean(),
});

export type UpdateProductDto = z.infer<typeof updateProductDtoSchema>;
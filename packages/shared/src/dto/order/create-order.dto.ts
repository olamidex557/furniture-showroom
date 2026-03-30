import { z } from "zod";

export const createOrderItemDtoSchema = z.object({
  productId: z.string().min(1, "Product ID is required."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export const createOrderDtoSchema = z
  .object({
    customerName: z.string().min(2, "Customer name is required."),
    phone: z.string().min(7, "Phone number is required."),
    address: z.string().nullable().optional(),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    items: z
      .array(createOrderItemDtoSchema)
      .min(1, "At least one item is required."),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && !data.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Delivery address is required for delivery orders.",
      });
    }
  });

export type CreateOrderItemDto = z.infer<typeof createOrderItemDtoSchema>;
export type CreateOrderDto = z.infer<typeof createOrderDtoSchema>;
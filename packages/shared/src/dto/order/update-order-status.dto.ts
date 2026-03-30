import { z } from "zod";

export const orderStatusEnum = z.enum([
  "pending",
  "processing",
  "completed",
  "cancelled",
]);

export const updateOrderStatusDtoSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  status: orderStatusEnum,
  note: z.string().optional().nullable(),
});

export type UpdateOrderStatusDto = z.infer<
  typeof updateOrderStatusDtoSchema
>;
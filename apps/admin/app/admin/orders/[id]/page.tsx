import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import AdminOrderDetailsClient from "../../../../components/admin-order-details-client";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

async function updateOrderStatus(formData: FormData) {
  "use server";

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !status) return;

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      clerk_user_id,
      customer_name,
      status,
      phone,
      address,
      delivery_method,
      subtotal,
      delivery_fee,
      total,
      created_at
    `)
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return notFound();
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select(`
      id,
      quantity,
      unit_price,
      line_total,
      products (
        name
      )
    `)
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return (
    <AdminOrderDetailsClient
      order={order}
      items={(items ?? []) as any[]}
      updateOrderStatus={updateOrderStatus}
    />
  );
}
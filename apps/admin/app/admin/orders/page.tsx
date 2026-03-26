import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import AdminOrdersClient from "../../../components/admin-orders-client";

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

export default async function AdminOrdersPage() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      clerk_user_id,
      customer_name,
      status,
      delivery_method,
      phone,
      address,
      subtotal,
      delivery_fee,
      total,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <AdminOrdersClient
      orders={data ?? []}
      updateOrderStatus={updateOrderStatus}
    />
  );
}
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { updateOrderStatusDtoSchema } from "../../../../../../packages/shared/src/dto/order/update-order-status.dto";
import AdminOrderDetailsClient from "../../../../components/admin-order-details-client";

async function updateOrderStatus(formData: FormData) {
  "use server";

  const raw = {
    orderId: String(formData.get("orderId") || "").trim(),
    status: String(formData.get("status") || "").trim(),
  };

  const parsed = updateOrderStatusDtoSchema.safeParse(raw);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message || "Invalid order status update.";
    redirect(
      `/admin/orders/${raw.orderId}?error=${encodeURIComponent(message)}`
    );
  }

  const dto = parsed.data;

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: dto.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dto.orderId);

  if (error) {
    redirect(
      `/admin/orders/${dto.orderId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${dto.orderId}`);

  redirect(`/admin/orders/${dto.orderId}`);
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      customer_name,
      phone,
      address,
      delivery_method,
      subtotal,
      delivery_fee,
      total,
      status,
      created_at,
      clerk_user_id
    `)
    .eq("id", id)
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
      product_id,
      products (
        id,
        name,
        category
      )
    `)
    .eq("order_id", id);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return (
    <AdminOrderDetailsClient
      order={order}
      items={items ?? []}
      updateOrderStatus={updateOrderStatus}
    />
  );
}
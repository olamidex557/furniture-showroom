import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

async function updateOrderStatus(formData: FormData) {
  "use server";

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !status) return;

  if (!ORDER_STATUSES.includes(status as any)) return;

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

  // 🔥 refresh both pages
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = params.id;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
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

  if (orderError || !order) return notFound();

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select(`
      id,
      quantity,
      unit_price,
      line_total,
      products ( name )
    `)
    .eq("order_id", orderId);

  if (itemsError) throw new Error(itemsError.message);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 🔥 STATUS + UPDATE */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500 mb-1">Current Status</p>
              <span
                className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold capitalize ${getStatusStyles(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* 🔥 UPDATE FORM */}
            <form action={updateOrderStatus} className="flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />

              <select
                name="status"
                defaultValue={order.status}
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
              >
                Update
              </button>
            </form>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow border">
          <h2 className="text-lg font-bold mb-3">Customer Details</h2>

          <p className="text-sm">
            <strong>Phone:</strong> {order.phone || "N/A"}
          </p>

          <p className="text-sm mt-2">
            <strong>Delivery:</strong> {order.delivery_method}
          </p>

          {order.delivery_method === "delivery" && (
            <p className="text-sm mt-2">
              <strong>Address:</strong> {order.address || "N/A"}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow border">
          <h2 className="text-lg font-bold mb-4">Order Items</h2>

          <div className="space-y-4">
            {items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-3"
              >
                <div>
                  <p className="font-semibold">
                    {item.products?.[0]?.name ?? "Product"}
                  </p>
                  <p className="text-sm text-stone-500">
                    {item.quantity} × ₦
                    {Number(item.unit_price).toLocaleString()}
                  </p>
                </div>

                <p className="font-semibold">
                  ₦{Number(item.line_total).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-white p-5 shadow border">
          <h2 className="text-lg font-bold mb-4">Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{Number(order.subtotal).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₦{Number(order.delivery_fee).toLocaleString()}</span>
            </div>

            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₦{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase-admin";

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

  if (!orderId || !status) {
    return;
  }

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

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      clerk_user_id,
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
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Orders Management
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review customer orders and update fulfillment status.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900">
              No orders yet
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Customer orders will appear here once checkout starts happening.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-stone-100">
                  <tr className="text-left text-sm text-stone-600">
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Delivery</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Update</th>
                    <th className="px-5 py-4 font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-stone-200 align-top"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-stone-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-medium text-stone-900">
                          {order.phone || "No phone"}
                        </p>
                        <p className="mt-1 break-all text-xs text-stone-500">
                          {order.clerk_user_id || "No user id"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-medium capitalize text-stone-900">
                          {order.delivery_method}
                        </p>
                        <p className="mt-1 max-w-xs text-xs text-stone-500">
                          {order.delivery_method === "delivery"
                            ? order.address || "No address"
                            : "Customer pickup"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-stone-900">
                          ₦{Number(order.total).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          Subtotal: ₦{Number(order.subtotal).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          Delivery: ₦{Number(order.delivery_fee).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <form action={updateOrderStatus} className="flex min-w-[180px] flex-col gap-2">
                          <input type="hidden" name="orderId" value={order.id} />

                          <select
                            name="status"
                            defaultValue={order.status}
                            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-500"
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                          >
                            Save
                          </button>
                        </form>
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
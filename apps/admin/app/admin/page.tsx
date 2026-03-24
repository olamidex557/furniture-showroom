import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase-admin";

export default async function AdminDashboardPage() {
  const [
    productsRes,
    ordersRes,
    pendingOrdersRes,
    lowStockRes,
  ] = await Promise.all([
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .lte("stock", 2),
  ]);

  const totalProducts = productsRes.count ?? 0;
  const totalOrders = ordersRes.count ?? 0;
  const pendingOrders = pendingOrdersRes.count ?? 0;
  const lowStockItems = lowStockRes.count ?? 0;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Furniture Admin</p>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <Link
            href="/admin/products"
            className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Manage Products
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow border">
            <p className="text-sm text-stone-500">Total Products</p>
            <h2 className="mt-2 text-3xl font-bold">{totalProducts}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border">
            <p className="text-sm text-stone-500">Total Orders</p>
            <h2 className="mt-2 text-3xl font-bold">{totalOrders}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border">
            <p className="text-sm text-stone-500">Pending Orders</p>
            <h2 className="mt-2 text-3xl font-bold text-amber-600">
              {pendingOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow border">
            <p className="text-sm text-stone-500">Low Stock</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {lowStockItems}
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}
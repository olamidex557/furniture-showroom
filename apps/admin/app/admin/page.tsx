import { supabaseAdmin } from "../../lib/supabase-admin";
import AdminDashboardClient from "../../components/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const [
    productsRes,
    ordersRes,
    pendingOrdersRes,
    lowStockRes,
    recentOrdersRes,
    lowStockProductsRes,
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
      .lte("stock", 5),
    supabaseAdmin
      .from("orders")
      .select("id, phone, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("products")
      .select("id, name, category, stock, price")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(5),
  ]);

  const stats = {
    totalProducts: productsRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    pendingOrders: pendingOrdersRes.count ?? 0,
    lowStockItems: lowStockRes.count ?? 0,
  };

  const recentOrders = recentOrdersRes.data ?? [];
  const lowStockProducts = lowStockProductsRes.data ?? [];

  return (
    <AdminDashboardClient
      stats={stats}
      recentOrders={recentOrders}
      lowStockProducts={lowStockProducts}
    />
  );
}
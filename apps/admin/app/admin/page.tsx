import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase-admin";

export default async function AdminDashboardPage() {
  const [
    productsResult,
    ordersResult,
    pendingOrdersResult,
    lowStockResult,
    zonesResult,
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
      .from("delivery_zones")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const stats = [
    {
      label: "Total Products",
      value: productsResult.count ?? 0,
      href: "/admin/products",
    },
    {
      label: "Total Orders",
      value: ordersResult.count ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrdersResult.count ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Low Stock Items",
      value: lowStockResult.count ?? 0,
      href: "/admin/products",
    },
    {
      label: "Active Delivery Zones",
      value: zonesResult.count ?? 0,
      href: "/admin/delivery-fees",
    },
  ];

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Overview</p>
            <h1 className="admin-title mt-2">Admin Dashboard</h1>
            <p className="admin-subtitle mt-3">
              Monitor products, orders, stock, and location-based delivery fees.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products/new" className="admin-btn-primary">
              Add Product
            </Link>
            <Link href="/admin/orders" className="admin-btn-secondary">
              Manage Orders
            </Link>
            <Link href="/admin/delivery-fees" className="admin-btn-secondary">
              Delivery Fees
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="admin-card p-6 transition hover:-translate-y-0.5"
            >
              <p className="text-sm font-medium text-stone-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="admin-card p-6">
            <h2 className="text-xl font-bold text-stone-900">
              Quick Actions
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/products" className="admin-btn-secondary">
                Manage Products
              </Link>

              <Link href="/admin/orders" className="admin-btn-secondary">
                Manage Orders
              </Link>

              <Link
                href="/admin/products/new"
                className="admin-btn-secondary"
              >
                Add New Product
              </Link>

              <Link
                href="/admin/delivery-fees"
                className="admin-btn-secondary"
              >
                Set Delivery Fees
              </Link>
            </div>
          </div>

          <div className="admin-card p-6">
            <h2 className="text-xl font-bold text-stone-900">
              Delivery Fee Control
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Set different delivery charges for each customer location instead
              of using a single flat fee. This helps you price delivery more
              accurately and keeps checkout flexible.
            </p>

            <div className="mt-5">
              <Link href="/admin/delivery-fees" className="admin-btn-primary">
                Open Delivery Fee Manager
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
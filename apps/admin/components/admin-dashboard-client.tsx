"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
};

type RecentOrder = {
  id: string;
  phone: string | null;
  total: number;
  status: string;
  created_at: string;
};

type LowStockProduct = {
  id: string;
  name: string;
  category: string | null;
  stock: number;
  price: number;
};

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "admin-badge admin-badge-success";
    case "processing":
      return "admin-badge admin-badge-info";
    case "cancelled":
      return "admin-badge admin-badge-danger";
    case "pending":
    default:
      return "admin-badge admin-badge-warning";
  }
}

export default function AdminDashboardClient({
  stats,
  recentOrders,
  lowStockProducts,
}: {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".dashboard-hero", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".dashboard-stat", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      });

      gsap.from(".dashboard-panel", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.3,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="dashboard-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Monitor store activity, track low stock items, and manage orders
              from one clean control center.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products" className="admin-btn-secondary">
              Manage Products
            </Link>

            <Link href="/admin/orders" className="admin-btn-primary">
              Manage Orders
            </Link>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dashboard-stat admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Total Products</p>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-4xl font-bold text-stone-950">
                {stats.totalProducts}
              </h2>
              <span className="admin-badge admin-badge-neutral">Catalog</span>
            </div>
          </div>

          <div className="dashboard-stat admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Total Orders</p>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-4xl font-bold text-stone-950">
                {stats.totalOrders}
              </h2>
              <span className="admin-badge admin-badge-neutral">All time</span>
            </div>
          </div>

          <div className="dashboard-stat admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Pending Orders</p>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-4xl font-bold text-amber-600">
                {stats.pendingOrders}
              </h2>
              <span className="admin-badge admin-badge-warning">
                Needs action
              </span>
            </div>
          </div>

          <div className="dashboard-stat admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Low Stock</p>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-4xl font-bold text-red-600">
                {stats.lowStockItems}
              </h2>
              <span className="admin-badge admin-badge-danger">
                Restock soon
              </span>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="dashboard-panel admin-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-950">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Jump straight into the tasks that matter most.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/admin/products/new"
                className="admin-card-soft p-5 transition hover:bg-stone-100"
              >
                <div className="mb-3 text-sm font-semibold text-stone-500">
                  CREATE
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Add Product
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Add a new furniture item to your store catalog.
                </p>
              </Link>

              <Link
                href="/admin/orders"
                className="admin-card-soft p-5 transition hover:bg-stone-100"
              >
                <div className="mb-3 text-sm font-semibold text-stone-500">
                  REVIEW
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Handle Orders
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Review incoming orders and update their statuses.
                </p>
              </Link>

              <Link
                href="/admin/products"
                className="admin-card-soft p-5 transition hover:bg-stone-100"
              >
                <div className="mb-3 text-sm font-semibold text-stone-500">
                  UPDATE
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Edit Catalog
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Update pricing, stock, and product visibility.
                </p>
              </Link>

              <div className="admin-card-dark p-5">
                <div className="mb-3 text-sm font-semibold text-stone-300">
                  STATUS
                </div>
                <h3 className="text-lg font-bold">Store Overview</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {stats.pendingOrders > 0
                    ? `You have ${stats.pendingOrders} pending orders needing attention.`
                    : "All orders are currently under control."}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel admin-card-dark p-6">
            <h2 className="text-xl font-bold text-white">Performance Snapshot</h2>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              A quick glance at your current store health.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-stone-300">
                  <span>Inventory readiness</span>
                  <span>84%</span>
                </div>
                <div className="h-2 rounded-full bg-stone-700">
                  <div className="h-2 w-[84%] rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-stone-300">
                  <span>Order flow</span>
                  <span>72%</span>
                </div>
                <div className="h-2 rounded-full bg-stone-700">
                  <div className="h-2 w-[72%] rounded-full bg-stone-300" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-stone-300">
                  <span>Catalog visibility</span>
                  <span>91%</span>
                </div>
                <div className="h-2 rounded-full bg-stone-700">
                  <div className="h-2 w-[91%] rounded-full bg-stone-200" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="dashboard-panel admin-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-950">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Latest customer activity
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-sm font-semibold text-stone-700 hover:text-stone-950"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-stone-500">No orders found yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="admin-card-soft flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {order.phone || "No phone"} • ₦
                        {Number(order.total).toLocaleString()}
                      </p>
                    </div>

                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-panel admin-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-950">
                  Low Stock Alert
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Products that may need restocking
                </p>
              </div>

              <Link
                href="/admin/products"
                className="text-sm font-semibold text-stone-700 hover:text-stone-950"
              >
                Open products
              </Link>
            </div>

            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No low-stock products right now.
                </p>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="admin-card-soft flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {product.category || "Uncategorized"} • ₦
                        {Number(product.price).toLocaleString()}
                      </p>
                    </div>

                    <span className="admin-badge admin-badge-danger">
                      Stock: {product.stock}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
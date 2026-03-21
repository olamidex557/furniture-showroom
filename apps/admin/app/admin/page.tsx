import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase-admin";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, email")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    return (
      <main className="space-y-4">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Profile lookup failed: {error.message}
        </p>
      </main>
    );
  }

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { count: productCount } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: availableCount } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_available", true);

  const { count: lowStockCount } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true })
    .lte("stock", 3);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Manage showroom products, track stock levels, and keep the catalog
          ready for customers on the mobile app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Products</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">
            {productCount ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Available Products</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">
            {availableCount ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Low Stock Items</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">
            {lowStockCount ?? 0}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-stone-500">
          Use these shortcuts to manage the showroom faster.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Manage Products
          </Link>

          <Link
            href="/admin/products/new"
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}
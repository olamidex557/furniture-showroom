import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, email")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight">
              Furniture Admin
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Showroom management dashboard
            </p>
          </div>

          <nav className="space-y-1 p-4">
            <Link
              href="/admin"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Products
            </Link>

            <Link
              href="/admin/products/new"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Add Product
            </Link>
          </nav>

          <div className="mt-8 border-t border-stone-200 px-6 py-4">
            <p className="text-sm font-medium text-stone-800">
              {profile.full_name ?? profile.email ?? "Admin"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
              {profile.role}
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-stone-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Welcome back</p>
                <h2 className="text-lg font-semibold text-stone-900">
                  {profile.full_name ?? "Admin"}
                </h2>
              </div>

              <Link
                href="/"
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Home
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
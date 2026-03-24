import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WelcomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm lg:p-10">
            <div className="mb-6 inline-flex items-center rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">
              Furniture Admin Portal
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-stone-950 lg:text-5xl">
              Manage your furniture store with clarity and control.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">
              Your account is authenticated and ready. Open the main admin
              dashboard to manage products, review orders, and monitor store
              activity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-2xl bg-black px-6 py-4 text-base font-semibold text-white shadow transition hover:bg-stone-800"
              >
                Open Admin Dashboard
              </Link>

              <Link
                href="/admin/products"
                className="inline-flex items-center rounded-2xl border border-stone-300 bg-white px-6 py-4 text-base font-semibold text-stone-800 transition hover:bg-stone-100"
              >
                Manage Products
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 p-5 ring-1 ring-stone-200">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                  ✓
                </div>
                <h2 className="font-semibold text-stone-900">Authenticated</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Clerk authentication is active and working correctly.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-5 ring-1 ring-stone-200">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                  □
                </div>
                <h2 className="font-semibold text-stone-900">Products</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Add, edit, delete, and monitor product inventory.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-5 ring-1 ring-stone-200">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                  ≡
                </div>
                <h2 className="font-semibold text-stone-900">Orders</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Review customer orders and manage fulfillment.
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-stone-200 bg-stone-900 p-8 text-white shadow-sm lg:p-10">
            <p className="text-sm font-medium text-stone-300">Admin Status</p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-4 text-sm leading-7 text-stone-300">
              This admin space is ready for product management, order tracking,
              and store updates.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-stone-300">Access</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Secure session active
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-stone-300">Next step</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Open dashboard and manage your store
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-stone-300">Recommended</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Review low-stock products and pending orders
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
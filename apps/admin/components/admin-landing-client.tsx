"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function AdminLandingClient() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".landing-hero", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".landing-card", {
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.15,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="landing-hero admin-card p-8 lg:p-10">
            <div className="mb-6 inline-flex rounded-full border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
              IVORYWOOD Admin Portal
            </div>

            <h1 className="admin-title max-w-3xl">
              Manage your furniture store with clarity and control.
            </h1>

            <p className="admin-subtitle mt-5 max-w-2xl">
              Your admin workspace is ready. From here, you can manage products,
              review orders, monitor low stock items, and keep store operations
              running smoothly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="admin-btn-primary"
              >
                Open Admin Dashboard
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="admin-btn-secondary"
              >
                Manage Products
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/orders")}
                className="admin-btn-secondary"
              >
                Manage Orders
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="landing-card admin-card-soft p-5">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  ✓
                </div>
                <h2 className="text-lg font-bold text-stone-900">
                  Authenticated
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Clerk authentication is active and your admin session is ready.
                </p>
              </div>

              <div className="landing-card admin-card-soft p-5">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  □
                </div>
                <h2 className="text-lg font-bold text-stone-900">Products</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Add, edit, hide, and review inventory across your catalog.
                </p>
              </div>

              <div className="landing-card admin-card-soft p-5">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  ≡
                </div>
                <h2 className="text-lg font-bold text-stone-900">Orders</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Track customer orders and update statuses quickly.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="landing-card admin-card-dark p-8 lg:p-10">
              <p className="text-sm font-medium text-stone-300">Admin Status</p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-4 text-sm leading-7 text-stone-300">
                This admin space is designed for fast product updates, clean
                order management, and better visibility into store activity.
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
            </div>

            <div className="landing-card admin-card p-6">
              <h3 className="text-lg font-bold text-stone-900">
                Quick Access
              </h3>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/products/new")}
                  className="admin-btn-secondary w-full"
                >
                  Add New Product
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/orders")}
                  className="admin-btn-secondary w-full"
                >
                  Open Orders
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/products")}
                  className="admin-btn-secondary w-full"
                >
                  Open Catalog
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
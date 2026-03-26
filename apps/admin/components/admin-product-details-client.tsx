"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type ProductImage = {
  id: string;
  image_url: string;
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  dimensions: string | null;
  price: number;
  stock: number;
  is_available: boolean;
  created_at: string | null;
  updated_at: string | null;
  product_images?: ProductImage[];
};

export default function AdminProductDetailsClient({
  product,
}: {
  product: Product;
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".product-details-hero", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".product-details-panel", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        delay: 0.12,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const imageUrl = product.product_images?.[0]?.image_url ?? null;
  const lowStock = Number(product.stock) <= 5;

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="product-details-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Product Details</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Review product information, stock level, pricing, and visibility
              from one polished view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products" className="admin-btn-secondary">
              Back to Products
            </Link>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className="admin-btn-primary"
            >
              Edit Product
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="product-details-panel admin-card p-6">
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-80 w-full object-cover"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center text-sm text-stone-400">
                  No image available
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-bold text-stone-950">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                {product.category || "Uncategorized"}
              </p>

              <p className="mt-4 text-2xl font-bold text-stone-900">
                ₦{Number(product.price).toLocaleString()}
              </p>

              <div className="mt-6 admin-card-soft p-5">
                <h3 className="mb-3 text-lg font-bold text-stone-900">
                  Description
                </h3>
                <p className="text-sm leading-7 text-stone-600">
                  {product.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 admin-card-soft p-5">
                <h3 className="mb-3 text-lg font-bold text-stone-900">
                  Dimensions
                </h3>
                <p className="text-sm text-stone-600">
                  {product.dimensions || "No dimensions provided."}
                </p>
              </div>
            </div>
          </section>

          <aside className="product-details-panel space-y-6">
            <div className="admin-card p-6">
              <h2 className="mb-4 text-xl font-bold text-stone-950">
                Product Status
              </h2>

              <div className="space-y-4 text-sm text-stone-600">
                <div className="flex items-center justify-between gap-4">
                  <span>ID</span>
                  <span className="font-medium text-stone-900">
                    #{product.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Category</span>
                  <span className="font-medium text-stone-900">
                    {product.category || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Stock</span>
                  <span
                    className={
                      lowStock
                        ? "admin-badge admin-badge-danger"
                        : "admin-badge admin-badge-neutral"
                    }
                  >
                    {product.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Visibility</span>
                  <span
                    className={
                      product.is_available
                        ? "admin-badge admin-badge-success"
                        : "admin-badge admin-badge-neutral"
                    }
                  >
                    {product.is_available ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Created</span>
                  <span className="font-medium text-stone-900">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Updated</span>
                  <span className="font-medium text-stone-900">
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-card-dark p-6">
              <h2 className="text-xl font-bold">Quick Actions</h2>

              <div className="mt-4 space-y-3">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="admin-btn-secondary w-full"
                >
                  Edit This Product
                </Link>

                <Link
                  href="/admin/products"
                  className="admin-btn-secondary w-full"
                >
                  Return to Products
                </Link>
              </div>

              <p className="mt-5 text-sm leading-6 text-stone-300">
                Keep stock, price, and visibility accurate so the customer app
                stays in sync with the admin catalog.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type ProductImage = {
  id: string;
  image_url: string;
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  is_available: boolean;
  created_at: string | null;
  product_images?: ProductImage[];
};

type Props = {
  products: Product[];
  toggleAvailability: (formData: FormData) => Promise<void>;
};

function formatProductDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatProductCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function AdminProductsClient({
  products,
  toggleAvailability,
}: Props) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">(
    "all"
  );

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".products-hero", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".products-toolbar", {
        y: 18,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: "power3.out",
      });

      gsap.from(".product-card", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.2,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        q.length === 0
          ? true
          : product.name.toLowerCase().includes(q) ||
            (product.category ?? "").toLowerCase().includes(q) ||
            product.id.toLowerCase().includes(q);

      const matchesVisibility =
        visibility === "all"
          ? true
          : visibility === "visible"
            ? product.is_available
            : !product.is_available;

      return matchesSearch && matchesVisibility;
    });
  }, [products, search, visibility]);

  const totalProducts = products.length;
  const visibleProducts = products.filter((p) => p.is_available).length;
  const hiddenProducts = products.filter((p) => !p.is_available).length;
  const lowStockProducts = products.filter((p) => Number(p.stock) <= 5).length;

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="products-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Products Management</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Manage your catalog, monitor stock levels, and control visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="admin-btn-secondary">
              Back to Dashboard
            </Link>

            <Link href="/admin/products/new" className="admin-btn-primary">
              Add Product
            </Link>
          </div>
        </div>

        <section className="products-toolbar mb-8 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="admin-card p-4">
            <label className="admin-label mb-2 block">Search products</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or id"
              className="admin-input"
            />
          </div>

          <div className="admin-card p-4">
            <label className="admin-label mb-2 block">Visibility</label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "all" | "visible" | "hidden")
              }
              className="admin-select"
            >
              <option value="all">All products</option>
              <option value="visible">Visible only</option>
              <option value="hidden">Hidden only</option>
            </select>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Total Products</p>
            <h2 className="mt-4 text-4xl font-bold text-stone-950">
              {totalProducts}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Visible</p>
            <h2 className="mt-4 text-4xl font-bold text-green-600">
              {visibleProducts}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Hidden</p>
            <h2 className="mt-4 text-4xl font-bold text-stone-700">
              {hiddenProducts}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Low Stock</p>
            <h2 className="mt-4 text-4xl font-bold text-red-600">
              {lowStockProducts}
            </h2>
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">
              No matching products
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Try changing your search or visibility filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredProducts.map((product) => {
              const imageUrl = product.product_images?.[0]?.image_url ?? null;
              const lowStock = Number(product.stock) <= 5;

              return (
                <div key={product.id} className="product-card admin-card p-6">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-lg font-bold text-stone-950">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {product.category || "Uncategorized"}
                        </p>
                        <p className="mt-3 text-base font-semibold text-stone-900">
                          ₦{formatProductCurrency(product.price)}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          #{product.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="admin-card-soft p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-700">
                        Product Status
                      </p>

                      <div className="space-y-3 text-sm text-stone-600">
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
                          <span className="text-xs font-medium text-stone-900">
                            {product.created_at
                              ? formatProductDate(product.created_at)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card-dark p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-300">
                        Actions
                      </p>

                      <div className="space-y-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="admin-btn-secondary w-full"
                        >
                          View Product
                        </Link>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="admin-btn-secondary w-full"
                        >
                          Edit Product
                        </Link>

                        <form action={toggleAvailability}>
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />
                          <input
                            type="hidden"
                            name="currentValue"
                            value={String(product.is_available)}
                          />

                          <button type="submit" className="admin-btn-primary w-full">
                            {product.is_available ? "Hide Product" : "Show Product"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

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
  product_images?: {
    id: string;
    image_url: string;
  }[];
};

export default function AdminEditProductClient({
  product,
  updateProduct,
}: {
  product: Product;
  updateProduct: (formData: FormData) => Promise<void>;
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState(product.name ?? "");
  const [category, setCategory] = useState(product.category ?? "");
  const [price, setPrice] = useState(String(product.price ?? 0));
  const [stock, setStock] = useState(String(product.stock ?? 0));
  const [dimensions, setDimensions] = useState(product.dimensions ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [isAvailable, setIsAvailable] = useState(
    String(product.is_available)
  );

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".edit-product-hero", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".edit-product-panel", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.12,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const imageUrl = product.product_images?.[0]?.image_url ?? null;

  const previewPrice = useMemo(() => {
    const value = Number(price);
    return Number.isNaN(value) ? 0 : value;
  }, [price]);

  const previewStock = useMemo(() => {
    const value = Number(stock);
    return Number.isNaN(value) ? 0 : value;
  }, [stock]);

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="edit-product-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Edit Product</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Update product information, inventory, and visibility while
              previewing changes in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/products/${product.id}`}
              className="admin-btn-secondary"
            >
              View Product
            </Link>

            <Link href="/admin/products" className="admin-btn-secondary">
              Back to Products
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="edit-product-panel admin-card p-6">
            <form action={updateProduct} className="space-y-5">
              <input type="hidden" name="id" value={product.id} />

              <div>
                <label className="admin-label mb-2 block">Product Name</label>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label mb-2 block">Category</label>
                <input
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="admin-label mb-2 block">Price</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label mb-2 block">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label mb-2 block">Dimensions</label>
                <input
                  name="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="admin-input"
                  placeholder="e.g. 220cm x 95cm x 80cm"
                />
              </div>

              <div>
                <label className="admin-label mb-2 block">Description</label>
                <textarea
                  name="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-textarea"
                  placeholder="Write a short description..."
                />
              </div>

              <div>
                <label className="admin-label mb-2 block">Availability</label>
                <select
                  name="is_available"
                  value={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.value)}
                  className="admin-select"
                >
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className="admin-btn-primary">
                  Save Changes
                </button>

                <Link href="/admin/products" className="admin-btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          <aside className="edit-product-panel space-y-6">
            <div className="admin-card p-6">
              <h2 className="mb-4 text-xl font-bold text-stone-950">
                Live Preview
              </h2>

              <div className="rounded-3xl bg-gradient-to-br from-stone-100 to-amber-50 p-6">
                <div className="mb-5 flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white text-sm text-stone-400">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "No product image available"
                  )}
                </div>

                <p className="text-2xl font-bold text-stone-950">
                  {name || "Product Name"}
                </p>

                <p className="mt-2 text-sm text-stone-500">
                  {category || "Category"}
                </p>

                <p className="mt-4 text-xl font-bold text-stone-900">
                  ₦{previewPrice.toLocaleString()}
                </p>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-stone-500">Stock</span>
                    <span
                      className={
                        previewStock <= 5
                          ? "admin-badge admin-badge-danger"
                          : "admin-badge admin-badge-neutral"
                      }
                    >
                      {previewStock}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Visibility</span>
                    <span
                      className={
                        isAvailable === "true"
                          ? "admin-badge admin-badge-success"
                          : "admin-badge admin-badge-neutral"
                      }
                    >
                      {isAvailable === "true" ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card-dark p-6">
              <h2 className="text-xl font-bold">Product Info</h2>

              <div className="mt-4 space-y-3 text-sm text-stone-300">
                <div className="flex justify-between gap-4">
                  <span>ID</span>
                  <span className="font-medium text-white">
                    #{product.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Created</span>
                  <span className="font-medium text-white">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Current Stock</span>
                  <span className="font-medium text-white">{product.stock}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Current Visibility</span>
                  <span className="font-medium text-white">
                    {product.is_available ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
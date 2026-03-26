"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

export default function AdminNewProductClient({
  createProduct,
}: {
  createProduct: (formData: FormData) => Promise<void>;
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState("true");

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".new-product-hero", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".new-product-panel", {
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

  const previewPrice = useMemo(() => {
    const value = Number(price);
    return Number.isNaN(value) ? 0 : value;
  }, [price]);

  const previewStock = useMemo(() => {
    const value = Number(stock);
    return Number.isNaN(value) ? 0 : value;
  }, [stock]);

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40 text-stone-900"
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="new-product-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-stone-950">
              Add Product
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Create a new product for your store catalog with a cleaner,
              premium admin workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Back to Products
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="new-product-panel rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <form action={createProduct} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Product Name
                </label>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                  placeholder="e.g. Luxury Sofa"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Category
                </label>
                <input
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                  placeholder="e.g. Sofa"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Dimensions
                </label>
                <input
                  name="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                  placeholder="e.g. 220cm x 95cm x 80cm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                  placeholder="Write a short description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Availability
                </label>
                <select
                  name="is_available"
                  value={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                >
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Create Product
                </button>

                <Link
                  href="/admin/products"
                  className="inline-flex items-center rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          <aside className="new-product-panel space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-stone-950">
                Live Preview
              </h2>

              <div className="rounded-3xl bg-gradient-to-br from-stone-100 to-amber-50 p-6">
                <div className="mb-5 flex h-52 items-center justify-center rounded-2xl border border-stone-200 bg-white text-sm text-stone-400">
                  Product image will be added later
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
                    <span className="font-semibold text-stone-900">
                      {previewStock}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Visibility</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isAvailable === "true"
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {isAvailable === "true" ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-stone-900 p-6 shadow-sm text-white">
              <h2 className="text-xl font-bold">Tips</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                <li>Use a clear product name customers can understand quickly.</li>
                <li>Keep stock updated so checkout stays accurate.</li>
                <li>Hidden products stay in admin but won’t show on the store.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
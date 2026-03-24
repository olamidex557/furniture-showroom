import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const stockValue = String(formData.get("stock") || "").trim();
  const isAvailableValue = String(formData.get("is_available") || "true");

  if (!name || !category || !priceValue || !stockValue) {
    throw new Error("Missing required fields.");
  }

  const price = Number(priceValue);
  const stock = Number(stockValue);
  const is_available = isAvailableValue === "true";

  if (Number.isNaN(price) || price < 0) {
    throw new Error("Price must be a valid number.");
  }

  if (Number.isNaN(stock) || stock < 0) {
    throw new Error("Stock must be a valid number.");
  }

  const { error } = await supabaseAdmin.from("products").insert({
    name,
    category,
    description: description || null,
    dimensions: dimensions || null,
    price,
    stock,
    is_available,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
            <p className="mt-2 text-sm text-stone-600">
              Create a new product for your store catalog.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Back to Products
          </Link>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <form action={createProduct} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Product Name
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                placeholder="Write a short description..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Availability
              </label>
              <select
                name="is_available"
                defaultValue="true"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
              >
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Create Product
              </button>

              <Link
                href="/admin/products"
                className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
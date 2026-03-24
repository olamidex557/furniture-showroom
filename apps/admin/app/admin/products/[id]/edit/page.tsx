import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

async function updateProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const stockValue = String(formData.get("stock") || "").trim();
  const isAvailableValue = String(formData.get("is_available") || "false");

  if (!id || !name || !category || !priceValue || !stockValue) {
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

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name,
      category,
      description: description || null,
      dimensions: dimensions || null,
      price,
      stock,
      is_available,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/admin/products/${id}/edit`);

  redirect("/admin/products");
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      category,
      description,
      dimensions,
      price,
      stock,
      is_available,
      created_at,
      product_images (
        id,
        image_url
      )
    `)
    .eq("id", productId)
    .single();

  if (error || !product) {
    return notFound();
  }

  const imageUrl = product.product_images?.[0]?.image_url ?? null;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="mt-2 text-sm text-stone-600">
              Update product details, stock, and availability.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Back to Products
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <form action={updateProduct} className="space-y-5">
              <input type="hidden" name="id" value={product.id} />

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Product Name
                </label>
                <input
                  name="name"
                  defaultValue={product.name ?? ""}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Category
                </label>
                <input
                  name="category"
                  defaultValue={product.category ?? ""}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={product.price ?? 0}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
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
                  defaultValue={product.stock ?? 0}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Dimensions
                </label>
                <input
                  name="dimensions"
                  defaultValue={product.dimensions ?? ""}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={product.description ?? ""}
                  rows={5}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Availability
                </label>
                <select
                  name="is_available"
                  defaultValue={String(product.is_available)}
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
                  Save Changes
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

          <aside className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-stone-900">
                Product Preview
              </h2>

              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center text-sm text-stone-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-lg font-semibold text-stone-900">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {product.category || "Uncategorized"}
                </p>
                <p className="mt-3 font-semibold text-stone-900">
                  ₦{Number(product.price).toLocaleString()}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
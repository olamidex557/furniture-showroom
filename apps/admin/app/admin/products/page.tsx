import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase-admin";

async function toggleAvailability(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") || "");
  const currentValue = String(formData.get("currentValue") || "");

  if (!productId) return;

  const nextValue = currentValue !== "true";

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      is_available: nextValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export default async function AdminProductsPage() {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      category,
      price,
      stock,
      is_available,
      created_at,
      product_images (
        id,
        image_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Products Management
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review products, stock levels, and availability.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Add Product
            </Link>
          </div>
        </div>

        {!products || products.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Products you create will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-stone-100">
                  <tr className="text-left text-sm text-stone-600">
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Availability</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const imageUrl = product.product_images?.[0]?.image_url ?? null;
                    const lowStock = Number(product.stock) <= 2;

                    return (
                      <tr
                        key={product.id}
                        className="border-t border-stone-200 align-top"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
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
                              <p className="font-semibold text-stone-900">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-stone-500">
                                #{product.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-stone-900">
                            {product.category || "Uncategorized"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-stone-900">
                            ₦{Number(product.price).toLocaleString()}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              lowStock
                                ? "bg-red-100 text-red-700"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {product.is_available ? "Visible" : "Hidden"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="inline-flex rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                              View
                            </Link>

                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                              Edit
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
                              <button
                                type="submit"
                                className="inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                              >
                                {product.is_available ? "Hide" : "Show"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
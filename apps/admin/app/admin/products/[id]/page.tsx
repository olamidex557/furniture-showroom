import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export default async function ProductDetailsPage({
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
      updated_at,
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
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Product Details
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review product information, stock, and visibility.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Back to Products
            </Link>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Edit Product
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
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
              <h2 className="text-2xl font-bold text-stone-900">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                {product.category || "Uncategorized"}
              </p>

              <p className="mt-4 text-2xl font-bold text-stone-900">
                ₦{Number(product.price).toLocaleString()}
              </p>

              <div className="mt-6 rounded-2xl bg-stone-50 p-5">
                <h3 className="mb-3 text-lg font-bold text-stone-900">
                  Description
                </h3>
                <p className="text-sm leading-7 text-stone-600">
                  {product.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-stone-50 p-5">
                <h3 className="mb-3 text-lg font-bold text-stone-900">
                  Dimensions
                </h3>
                <p className="text-sm text-stone-600">
                  {product.dimensions || "No dimensions provided."}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-stone-900">
                Product Info
              </h2>

              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex justify-between gap-4">
                  <span>ID</span>
                  <span className="font-medium text-stone-900">
                    #{product.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Category</span>
                  <span className="font-medium text-stone-900">
                    {product.category || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Stock</span>
                  <span className="font-medium text-stone-900">
                    {product.stock}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Status</span>
                  <span
                    className={`font-medium ${
                      product.is_available ? "text-green-700" : "text-stone-700"
                    }`}
                  >
                    {product.is_available ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Created</span>
                  <span className="font-medium text-stone-900">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Updated</span>
                  <span className="font-medium text-stone-900">
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString()
                      : "N/A"}
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
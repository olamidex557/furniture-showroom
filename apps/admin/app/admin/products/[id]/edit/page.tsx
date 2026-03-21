import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

async function updateProduct(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const productId = String(formData.get("product_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const isAvailable = formData.get("is_available") === "on";

  if (!productId || !name || !category || price < 0 || stock < 0) {
    throw new Error("Please provide valid product details.");
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name,
      category,
      price,
      description: description || null,
      dimensions: dimensions || null,
      stock,
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/products");
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      category,
      price,
      description,
      dimensions,
      stock,
      is_available,
      product_images (
        id,
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load product.
      </div>
    );
  }

  const firstImage = product.product_images?.[0]?.image_url ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Edit Product
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Update product details for the showroom catalog.
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        {firstImage ? (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-stone-700">
              Current Image
            </p>
            <img
              src={firstImage}
              alt={product.name}
              className="h-32 w-32 rounded-xl object-cover"
            />
          </div>
        ) : null}

        <form action={updateProduct} className="space-y-5">
          <input type="hidden" name="product_id" value={product.id} />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Product Name
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={product.name}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Category
              </label>
              <input
                name="category"
                type="text"
                required
                defaultValue={product.category}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={product.price}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={product.stock}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Dimensions
            </label>
            <input
              name="dimensions"
              type="text"
              defaultValue={product.dimensions ?? ""}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Description
            </label>
            <textarea
              name="description"
              rows={5}
              defaultValue={product.description ?? ""}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <input
              name="is_available"
              type="checkbox"
              defaultChecked={product.is_available}
              className="h-4 w-4"
            />
            <span className="text-sm text-stone-700">
              Available for sale
            </span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { uploadProductImage } from "../../../../lib/upload-product-image";

async function createProduct(formData: FormData) {
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

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const isAvailable = formData.get("is_available") === "on";
  const imageFile = formData.get("image") as File | null;

  if (!name || !category || price < 0 || stock < 0) {
    throw new Error("Please provide valid product details.");
  }

  const { data: insertedProduct, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      category,
      price,
      description: description || null,
      dimensions: dimensions || null,
      stock,
      is_available: isAvailable,
    })
    .select("id")
    .single();

  if (productError || !insertedProduct) {
    throw new Error(productError?.message || "Failed to create product.");
  }

  if (imageFile && imageFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Only JPG, PNG, and WEBP images are allowed.");
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Image size must not exceed 5MB.");
    }

    const uploaded = await uploadProductImage(imageFile);

    const { error: imageError } = await supabaseAdmin
      .from("product_images")
      .insert({
        product_id: insertedProduct.id,
        image_url: uploaded.publicUrl,
      });

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  redirect("/admin/products");
}

export default async function NewProductPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Add Product
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Create a new furniture item for the showroom catalog.
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <form action={createProduct} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Product Name
              </label>
              <input
                name="name"
                type="text"
                required
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
                placeholder="Chair, Sofa, Bed Frame..."
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
              placeholder="e.g. 6ft x 6ft"
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
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Product Image
            </label>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
            />
            <p className="mt-2 text-xs text-stone-500">
              Accepted formats: JPG, PNG, WEBP. Max size: 5MB.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <input
              name="is_available"
              type="checkbox"
              defaultChecked
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
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
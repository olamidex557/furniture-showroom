import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { createProductDtoSchema } from "../../../../src/dto/product/create-product.dto";
import { uploadProductImage } from "../../../../lib/upload-product-image";

async function createProduct(formData: FormData) {
  "use server";

  const raw = {
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    price: formData.get("price"),
    description: String(formData.get("description") || "").trim() || null,
    dimensions: String(formData.get("dimensions") || "").trim() || null,
    stock: formData.get("stock"),
    isAvailable: formData.get("isAvailable") === "on",
  };

  const parsed = createProductDtoSchema.safeParse(raw);

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message || "Invalid product form data.";
    redirect(`/admin/products/new?error=${encodeURIComponent(firstIssue)}`);
  }

  const dto = parsed.data;

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      name: dto.name,
      category: dto.category,
      price: dto.price,
      description: dto.description,
      dimensions: dto.dimensions,
      stock: dto.stock,
      is_available: dto.isAvailable,
    })
    .select("id")
    .single();

  if (productError || !product) {
    redirect(
      `/admin/products/new?error=${encodeURIComponent(
        productError?.message || "Failed to create product."
      )}`
    );
  }

  const imageFile = formData.get("imageFile");

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const publicUrl = await uploadProductImage(product.id, imageFile);

      const { error: imageInsertError } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: product.id,
          image_url: publicUrl,
        });

      if (imageInsertError) {
        redirect(
          `/admin/products/new?error=${encodeURIComponent(
            imageInsertError.message
          )}`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Image upload failed after product creation.";
      redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const errorMessage = params.error;

  return (
    <main className="admin-page">
      <div className="admin-container max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Catalog</p>
            <h1 className="admin-title mt-2">Add New Product</h1>
            <p className="admin-subtitle mt-3">
              Create a new product and upload its image from your device.
            </p>
          </div>

          <Link href="/admin/products" className="admin-btn-secondary">
            Back to Products
          </Link>
        </div>

        <div className="admin-card p-6">
          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={createProduct} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="admin-label mb-2 block">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="admin-input"
                  placeholder="Luxury Sofa"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="admin-label mb-2 block">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  className="admin-input"
                  placeholder="Living Room"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="price" className="admin-label mb-2 block">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="admin-input"
                  placeholder="250000"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="admin-label mb-2 block">
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className="admin-input"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dimensions" className="admin-label mb-2 block">
                Dimensions
              </label>
              <input
                id="dimensions"
                name="dimensions"
                className="admin-input"
                placeholder="220cm x 95cm x 85cm"
              />
            </div>

            <div>
              <label htmlFor="description" className="admin-label mb-2 block">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="admin-textarea"
                placeholder="Describe the product..."
              />
            </div>

            <div>
              <label htmlFor="imageFile" className="admin-label mb-2 block">
                Product Image
              </label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                className="admin-input"
              />
              <p className="mt-2 text-xs text-stone-500">
                Upload an image from your device. Supported: common image
                formats like JPG, PNG, WEBP.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked
                className="h-4 w-4 rounded border-stone-300"
              />
              <span className="text-sm font-medium text-stone-700">
                Available for sale
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" className="admin-btn-primary">
                Create Product
              </button>

              <Link href="/admin/products" className="admin-btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
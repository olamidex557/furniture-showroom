import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { updateProductDtoSchema } from "../../../../../src/dto/product/update-product.dto";

async function updateProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "").trim();

  const raw = {
    id,
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    price: formData.get("price"),
    description: String(formData.get("description") || "").trim() || null,
    dimensions: String(formData.get("dimensions") || "").trim() || null,
    stock: formData.get("stock"),
    isAvailable: formData.get("isAvailable") === "on",
  };

  const parsed = updateProductDtoSchema.safeParse(raw);

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message || "Invalid product form data.";
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(firstIssue)}`
    );
  }

  const dto = parsed.data;

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name: dto.name,
      category: dto.category,
      price: dto.price,
      description: dto.description,
      dimensions: dto.dimensions,
      stock: dto.stock,
      is_available: dto.isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dto.id);

  if (error) {
    redirect(
      `/admin/products/${dto.id}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${dto.id}`);
  revalidatePath(`/admin/products/${dto.id}/edit`);

  redirect("/admin/products");
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const errorMessage = query.error;

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
      is_available
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-container max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Catalog</p>
            <h1 className="admin-title mt-2">Edit Product</h1>
            <p className="admin-subtitle mt-3">
              Update the details of this product.
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

          <form action={updateProduct} className="space-y-5">
            <input type="hidden" name="id" value={product.id} />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="admin-label mb-2 block">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={product.name ?? ""}
                  className="admin-input"
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
                  defaultValue={product.category ?? ""}
                  className="admin-input"
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
                  defaultValue={product.price ?? 0}
                  className="admin-input"
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
                  defaultValue={product.stock ?? 0}
                  className="admin-input"
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
                defaultValue={product.dimensions ?? ""}
                className="admin-input"
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
                defaultValue={product.description ?? ""}
                className="admin-textarea"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={Boolean(product.is_available)}
                className="h-4 w-4 rounded border-stone-300"
              />
              <span className="text-sm font-medium text-stone-700">
                Available for sale
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" className="admin-btn-primary">
                Save Changes
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
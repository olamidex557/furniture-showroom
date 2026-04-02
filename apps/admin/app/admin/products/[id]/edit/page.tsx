import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { updateProductDtoSchema } from "../../../../../src/dto/product/update-product.dto";
import {
  deleteProductImageByUrl,
  uploadProductImage,
} from "../../../../../lib/upload-product-image";

async function updateProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "").trim();
  const imageId = String(formData.get("imageId") || "").trim();
  const currentImageUrl = String(formData.get("currentImageUrl") || "").trim();
  const removeCurrentImage = formData.get("removeCurrentImage") === "on";
  const newImageFile = formData.get("imageFile");

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
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(firstIssue)}`);
  }

  const dto = parsed.data;

  const { error: productError } = await supabaseAdmin
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

  if (productError) {
    redirect(
      `/admin/products/${dto.id}/edit?error=${encodeURIComponent(
        productError.message
      )}`
    );
  }

  const hasNewFile = newImageFile instanceof File && newImageFile.size > 0;

  if (hasNewFile) {
    try {
      const publicUrl = await uploadProductImage(dto.id, newImageFile);

      if (imageId) {
        const { error: imageUpdateError } = await supabaseAdmin
          .from("product_images")
          .update({
            image_url: publicUrl,
          })
          .eq("id", imageId);

        if (imageUpdateError) {
          redirect(
            `/admin/products/${dto.id}/edit?error=${encodeURIComponent(
              imageUpdateError.message
            )}`
          );
        }
      } else {
        const { error: imageInsertError } = await supabaseAdmin
          .from("product_images")
          .insert({
            product_id: dto.id,
            image_url: publicUrl,
          });

        if (imageInsertError) {
          redirect(
            `/admin/products/${dto.id}/edit?error=${encodeURIComponent(
              imageInsertError.message
            )}`
          );
        }
      }

      if (currentImageUrl) {
        await deleteProductImageByUrl(currentImageUrl);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed.";
      redirect(`/admin/products/${dto.id}/edit?error=${encodeURIComponent(message)}`);
    }
  } else if (removeCurrentImage && imageId) {
    const { error: imageDeleteError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (imageDeleteError) {
      redirect(
        `/admin/products/${dto.id}/edit?error=${encodeURIComponent(
          imageDeleteError.message
        )}`
      );
    }

    if (currentImageUrl) {
      await deleteProductImageByUrl(currentImageUrl);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${dto.id}`);
  revalidatePath(`/admin/products/${dto.id}/edit`);

  redirect("/admin/products");
}

type ProductRow = {
  id: string;
  name: string | null;
  category: string | null;
  price: number | null;
  description: string | null;
  dimensions: string | null;
  stock: number | null;
  is_available: boolean | null;
  product_images:
    | {
        id: string;
        image_url: string | null;
      }[]
    | null;
};

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
      is_available,
      product_images (
        id,
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return notFound();
  }

  const typedProduct = product as ProductRow;
  const currentImage = typedProduct.product_images?.[0] ?? null;

  return (
    <main className="admin-page">
      <div className="admin-container max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Catalog</p>
            <h1 className="admin-title mt-2">Edit Product</h1>
            <p className="admin-subtitle mt-3">
              Update product details and upload a new image from your device.
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
            <input type="hidden" name="id" value={typedProduct.id} />
            <input type="hidden" name="imageId" value={currentImage?.id ?? ""} />
            <input
              type="hidden"
              name="currentImageUrl"
              value={currentImage?.image_url ?? ""}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="admin-label mb-2 block">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={typedProduct.name ?? ""}
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
                  defaultValue={typedProduct.category ?? ""}
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
                  defaultValue={typedProduct.price ?? 0}
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
                  defaultValue={typedProduct.stock ?? 0}
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
                defaultValue={typedProduct.dimensions ?? ""}
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
                defaultValue={typedProduct.description ?? ""}
                className="admin-textarea"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="imageFile" className="admin-label block">
                Product Image
              </label>

              {currentImage?.image_url ? (
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                  <div className="relative h-56 w-full">
                    <Image
                      src={currentImage.image_url}
                      alt={typedProduct.name ?? "Product image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                  No image uploaded yet.
                </div>
              )}

              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                className="admin-input"
              />

              {currentImage?.image_url ? (
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <input
                    type="checkbox"
                    name="removeCurrentImage"
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Remove current image if no new file is uploaded
                  </span>
                </label>
              ) : null}

              <p className="text-xs text-stone-500">
                Upload a new image from your device. If you upload a new one, it
                replaces the current image automatically.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={Boolean(typedProduct.is_available)}
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
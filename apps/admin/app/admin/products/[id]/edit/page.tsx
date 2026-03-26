import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import AdminEditProductClient from "../../../../../components/admin-edit-product-client";

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

  return (
    <AdminEditProductClient
      product={product}
      updateProduct={updateProduct}
    />
  );
}
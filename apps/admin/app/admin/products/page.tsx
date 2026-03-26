import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import AdminProductsClient from "../../../components/admin-products-client";

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

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/edit`);
}

export default async function AdminProductsPage() {
  const { data, error } = await supabaseAdmin
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
    <AdminProductsClient
      products={data ?? []}
      toggleAvailability={toggleAvailability}
    />
  );
}
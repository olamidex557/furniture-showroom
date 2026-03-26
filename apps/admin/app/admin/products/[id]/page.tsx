import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import AdminProductDetailsClient from "../../../../components/admin-product-details-client";

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

  return <AdminProductDetailsClient product={product} />;
}
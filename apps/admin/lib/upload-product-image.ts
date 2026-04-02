import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase-admin";

const PRODUCT_IMAGES_BUCKET = "product-images";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
}

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeName = sanitizeFileName(file.name || "image");
  const filePath = `${productId}/${Date.now()}-${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImageByUrl(imageUrl: string) {
  try {
    const bucketSegment = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
    const index = imageUrl.indexOf(bucketSegment);

    if (index === -1) return;

    const filePath = imageUrl.slice(index + bucketSegment.length);

    if (!filePath) return;

    const { error } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.log("Failed to delete old product image:", error);
  }
}
import { supabaseAdmin } from "./supabase-admin";

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

export async function uploadProductImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeName = sanitizeFileName(file.name || "product-image");
  const extension = safeName.split(".").pop() || "jpg";
  const filePath = `products/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import AdminNewProductClient from "../../../../components/admin-new-product-client";

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const stockValue = String(formData.get("stock") || "").trim();
  const isAvailableValue = String(formData.get("is_available") || "true");

  if (!name || !category || !priceValue || !stockValue) {
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

  const { error } = await supabaseAdmin.from("products").insert({
    name,
    category,
    description: description || null,
    dimensions: dimensions || null,
    price,
    stock,
    is_available,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}

export default function NewProductPage() {
  return <AdminNewProductClient createProduct={createProduct} />;
}
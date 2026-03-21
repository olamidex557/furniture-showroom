import { supabase } from "./supabase";
import type { Product } from "../types/product";

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
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
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Product[];
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
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
    .eq("id", productId)
    .eq("is_available", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Product | null) ?? null;
}

export type AppSettings = {
  delivery_fee: number;
  pickup_enabled: boolean;
  company_email: string | null;
  company_phone: string | null;
  showroom_address: string | null;
};

export async function fetchAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select(`
      delivery_fee,
      pickup_enabled,
      company_email,
      company_phone,
      showroom_address
    `)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as AppSettings | null) ?? null;
}
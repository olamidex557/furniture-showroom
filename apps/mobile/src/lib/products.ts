import { supabase } from "./supabase";
import type { Product } from "../types/product";

export type AppSettings = {
  id: string;
  delivery_fee: number;
  pickup_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OrderHistoryItem = {
  id: string;
  clerk_user_id: string | null;
  status: string;
  delivery_method: string;
  phone: string | null;
  address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

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
      created_at,
      updated_at,
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

export async function fetchProductById(
  productId: string
): Promise<Product | null> {
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
      created_at,
      updated_at,
      product_images (
        id,
        image_url
      )
    `)
    .eq("id", productId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return (data as Product) ?? null;
}

export async function fetchAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select(`
      id,
      delivery_fee,
      pickup_enabled,
      created_at,
      updated_at
    `)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as AppSettings | null) ?? null;
}

export async function fetchOrders(
  clerkUserId: string
): Promise<OrderHistoryItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      clerk_user_id,
      status,
      delivery_method,
      phone,
      address,
      subtotal,
      delivery_fee,
      total,
      created_at
    `)
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OrderHistoryItem[];
}
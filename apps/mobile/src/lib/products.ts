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
      created_at,
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

export async function fetchProductById(id: string): Promise<Product | null> {
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
      product_images (
        id,
        image_url
      )
    `)
    .eq("id", id)
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

export type OrderHistoryItem = {
  id: string;
  status: string;
  delivery_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export async function fetchOrders(): Promise<OrderHistoryItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      delivery_method,
      subtotal,
      delivery_fee,
      total,
      phone,
      address,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OrderHistoryItem[];
}
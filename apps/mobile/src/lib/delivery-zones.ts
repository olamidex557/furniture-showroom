import { supabase } from "./supabase";

export type DeliveryZone = {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
};

export async function fetchActiveDeliveryZones(): Promise<DeliveryZone[]> {
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("id, name, fee, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((zone) => ({
    id: zone.id,
    name: zone.name,
    fee: Number(zone.fee ?? 0),
    is_active: Boolean(zone.is_active),
  }));
}
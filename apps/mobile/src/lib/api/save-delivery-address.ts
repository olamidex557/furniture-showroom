import { supabase } from "../supabase";

export type SaveDeliveryAddressParams = {
  clerkUserId: string;
  email: string | null;
  fullName: string | null;
  phone: string;
  deliveryZone: string;
  streetAddress: string;
  landmark: string | null;
};

export async function saveDeliveryAddress({
  clerkUserId,
  email,
  fullName,
  phone,
  deliveryZone,
  streetAddress,
  landmark,
}: SaveDeliveryAddressParams) {
  const { data, error } = await supabase.rpc("save_customer_delivery_address", {
    p_clerk_user_id: clerkUserId,
    p_email: email,
    p_full_name: fullName,
    p_phone: phone,
    p_delivery_zone: deliveryZone,
    p_street_address: streetAddress,
    p_landmark: landmark,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
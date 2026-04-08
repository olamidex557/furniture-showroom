import { supabase } from "./supabase";

export type CreateAdminNotificationParams = {
  title: string;
  message: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
};

export async function createAdminNotification({
  title,
  message,
  type,
  entityType,
  entityId,
}: CreateAdminNotificationParams) {
  const { error } = await supabase.from("admin_notifications").insert({
    title,
    message,
    type,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
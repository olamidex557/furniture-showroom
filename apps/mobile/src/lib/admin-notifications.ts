import { supabase } from "./supabase";

type CreateAdminNotificationInput = {
  title: string;
  message: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
};

export async function createAdminNotification(
  input: CreateAdminNotificationInput
) {
  const { error } = await supabase.from("admin_notifications").insert({
    title: input.title,
    message: input.message,
    type: input.type,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
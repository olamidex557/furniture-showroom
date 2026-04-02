import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim();

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase URL. Add NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL to apps/admin/.env.local"
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in apps/admin/.env.local"
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "admin-dashboard",
      },
    },
  }
);

export const supabaseAdminConfig = {
  hasUrl: Boolean(supabaseUrl),
  hasServiceRoleKey: Boolean(supabaseServiceRoleKey),
  urlPreview: supabaseUrl.slice(0, 32),
};
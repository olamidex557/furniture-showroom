import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load notifications." },
        { status: 400 }
      );
    }

    const unreadCount = (data ?? []).filter((item) => !item.is_read).length;

    return NextResponse.json(
      {
        success: true,
        data: data ?? [],
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin notifications GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("is_read", false);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to mark all as read." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin notifications PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
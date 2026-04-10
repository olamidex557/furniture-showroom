import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_notifications")
      .select(`
        id,
        title,
        message,
        type,
        entity_type,
        entity_id,
        is_read,
        created_at,
        read_at
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("GET /api/admin-notifications error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data ?? [],
    });
  } catch (error) {
    console.error("GET /api/admin-notifications fatal:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load notifications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const { error } = await supabaseAdmin
      .from("admin_notifications")
      .update({
        is_read: true,
      })
      .eq("is_read", false);

    if (error) {
      console.error("PATCH /api/admin-notifications error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin-notifications fatal:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update notifications.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("admin_notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    if (error) {
      console.error("PATCH /api/admin-notifications/[id]/read error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin-notifications/[id]/read fatal:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to mark notification as read.",
      },
      { status: 500 }
    );
  }
}
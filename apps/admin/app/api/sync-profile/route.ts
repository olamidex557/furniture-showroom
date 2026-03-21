import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  const { data: existingProfile, error: existingError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: existingError.message },
      { status: 500 }
    );
  }

  const role = existingProfile?.role ?? "customer";

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userId,
      email,
      full_name: fullName,
      role,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "clerk_user_id",
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
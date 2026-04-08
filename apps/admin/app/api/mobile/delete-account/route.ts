import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

function getEnv() {
  return {
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    clerkPublishableKey:
      process.env.CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function getAuthorizedParties() {
  const values = [
    process.env.NEXT_PUBLIC_ADMIN_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.EXPO_PUBLIC_ADMIN_API_URL,
    process.env.EXPO_PUBLIC_MOBILE_APP_URL,
  ].filter(Boolean) as string[];

  return values.length > 0 ? values : undefined;
}

export async function POST(request: Request) {
  try {
    const {
      clerkSecretKey,
      clerkPublishableKey,
      supabaseUrl,
      supabaseServiceRoleKey,
    } = getEnv();

    if (!clerkSecretKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: CLERK_SECRET_KEY is missing." },
        { status: 500 }
      );
    }

    if (!clerkPublishableKey) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: Clerk publishable key is missing. Set CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration: NEXT_PUBLIC_SUPABASE_URL is missing." },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing." },
        { status: 500 }
      );
    }

    const clerk = createClerkClient({
      secretKey: clerkSecretKey,
      publishableKey: clerkPublishableKey,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const authResult = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties: getAuthorizedParties(),
    });

    const auth = authResult.toAuth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return NextResponse.json(
        {
          error: authResult.message || "Unauthorized",
          reason: authResult.reason || null,
        },
        { status: 401 }
      );
    }

    const { error: cleanupError } = await supabase.rpc(
      "delete_customer_account_data",
      {
        p_clerk_user_id: clerkUserId,
      }
    );

    if (cleanupError) {
      return NextResponse.json(
        {
          error: cleanupError.message || "Failed to clean up account data.",
        },
        { status: 400 }
      );
    }

    await clerk.users.deleteUser(clerkUserId);

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete account API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
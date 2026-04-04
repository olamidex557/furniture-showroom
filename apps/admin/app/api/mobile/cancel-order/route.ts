import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const bodySchema = z.object({
  orderId: z.string().uuid(),
});

function getEnv() {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    clerkSecretKey,
    clerkPublishableKey,
    supabaseUrl,
    supabaseServiceRoleKey,
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
        { error: 'Server misconfiguration: CLERK_SECRET_KEY is missing.' },
        { status: 500 }
      );
    }

    if (!clerkPublishableKey) {
      return NextResponse.json(
        {
          error:
            'Server misconfiguration: Clerk publishable key is missing. Set CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.',
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXT_PUBLIC_SUPABASE_URL is missing.' },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.' },
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
      acceptsToken: 'session_token',
      authorizedParties: getAuthorizedParties(),
    });

    const auth = authResult.toAuth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return NextResponse.json(
        {
          error: authResult.message || 'Unauthorized',
          reason: authResult.reason || null,
        },
        { status: 401 }
      );
    }

    let json: unknown;

    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    console.log('Cancel order request', {
      orderId,
      clerkUserId,
    });

    const { data, error } = await supabase.rpc('cancel_order_for_customer', {
      p_order_id: orderId,
      p_clerk_user_id: clerkUserId,
    });

    if (error) {
      console.error('Cancel order RPC error', {
        clerkUserId,
        orderId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return NextResponse.json(
        {
          error: error.message || 'Failed to cancel order.',
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
        },
        { status: 400 }
      );
    }

    console.log('Cancel order RPC success', {
      clerkUserId,
      orderId,
      data,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order cancelled successfully.',
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel order API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
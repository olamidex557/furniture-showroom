import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { initializePaystackTransaction } from "../../../../lib/paystack";

function generateReference(orderId: string) {
  return `order_${orderId}_${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const authResult = await auth({
      acceptsToken: ["session_token"],
    });

    const userId = "userId" in authResult ? authResult.userId : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const orderId = String(body?.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        clerk_user_id,
        customer_name,
        total,
        payment_status,
        status
      `)
      .eq("id", orderId)
      .eq("clerk_user_id", userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cancelled orders cannot be paid for." },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid for." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const email = profile?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Customer email is required before payment." },
        { status: 400 }
      );
    }

    const amount = Number(order.total ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order total." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const reference = generateReference(order.id);

    const initializeResponse = await initializePaystackTransaction({
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: `${appUrl}/payment-return?reference=${reference}`,
      metadata: {
        order_id: order.id,
        clerk_user_id: userId,
      },
    });

    const paymentData = initializeResponse.data;

    const { error: attemptError } = await supabaseAdmin
      .from("payment_attempts")
      .insert({
        order_id: order.id,
        clerk_user_id: userId,
        provider: "paystack",
        reference,
        email,
        expected_amount: amount,
        currency: "NGN",
        status: "initiated",
        authorization_url: paymentData.authorization_url,
        access_code: paymentData.access_code,
        raw_initialize_response: initializeResponse,
      });

    if (attemptError) {
      return NextResponse.json(
        { error: attemptError.message },
        { status: 500 }
      );
    }

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "initiated",
        payment_reference: reference,
        payment_provider: "paystack",
        payment_amount: amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      return NextResponse.json(
        { error: orderUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Payment initialized successfully.",
      data: {
        orderId: order.id,
        reference,
        authorization_url: paymentData.authorization_url,
        access_code: paymentData.access_code,
      },
    });
  } catch (error) {
    console.error("POST /api/payments/initialize error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment.",
      },
      { status: 500 }
    );
  }
}
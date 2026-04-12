import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const authResult = await auth({
      acceptsToken: ["session_token"],
    });

    const userId = "userId" in authResult ? authResult.userId : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await params;
    const cleanReference = String(reference || "").trim();

    if (!cleanReference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const { data: paymentAttempt } = await supabaseAdmin
      .from("payment_attempts")
      .select(`
        id,
        order_id,
        clerk_user_id,
        reference,
        status,
        expected_amount,
        currency,
        paid_at,
        created_at,
        updated_at
      `)
      .eq("reference", cleanReference)
      .eq("clerk_user_id", userId)
      .maybeSingle();

    let orderId = paymentAttempt?.order_id ?? null;

    if (!orderId) {
      const { data: fallbackOrder } = await supabaseAdmin
        .from("orders")
        .select(`
          id,
          status,
          payment_status,
          payment_reference,
          paid_at,
          total,
          created_at
        `)
        .eq("payment_reference", cleanReference)
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (fallbackOrder) {
        return NextResponse.json({
          data: {
            reference: cleanReference,
            paymentStatus: fallbackOrder.payment_status ?? "pending",
            paidAt: fallbackOrder.paid_at,
            order: {
              id: fallbackOrder.id,
              status: fallbackOrder.status,
              paymentStatus: fallbackOrder.payment_status ?? "pending",
              paymentReference: fallbackOrder.payment_reference,
              paidAt: fallbackOrder.paid_at,
              total: fallbackOrder.total,
              createdAt: fallbackOrder.created_at,
            },
          },
        });
      }

      return NextResponse.json({
        data: {
          reference: cleanReference,
          paymentStatus: "pending",
          paidAt: null,
          order: null,
        },
      });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        payment_status,
        payment_reference,
        paid_at,
        total,
        created_at
      `)
      .eq("id", orderId)
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (orderError) {
      throw new Error(orderError.message);
    }

    if (!order) {
      return NextResponse.json({
        data: {
          reference: cleanReference,
          paymentStatus: paymentAttempt?.status ?? "pending",
          paidAt: paymentAttempt?.paid_at ?? null,
          order: null,
        },
      });
    }

    return NextResponse.json({
      data: {
        reference: paymentAttempt?.reference ?? cleanReference,
        paymentStatus:
          paymentAttempt?.status ?? order.payment_status ?? "pending",
        paidAt: paymentAttempt?.paid_at ?? order.paid_at ?? null,
        order: {
          id: order.id,
          status: order.status,
          paymentStatus: order.payment_status ?? "pending",
          paymentReference: order.payment_reference,
          paidAt: order.paid_at,
          total: order.total,
          createdAt: order.created_at,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/payments/status/[reference] error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load payment status.",
      },
      { status: 500 }
    );
  }
}
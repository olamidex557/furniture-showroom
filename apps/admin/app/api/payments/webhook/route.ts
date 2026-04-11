import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { verifyPaystackTransaction } from "../../../../lib/paystack";
import { isValidPaystackSignature } from "../../../../lib/paystack-webhook";

type WebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    channel?: string;
    id?: number;
    gateway_response?: string;
    metadata?: Record<string, unknown> | null;
  };
};

async function createAdminPaymentNotification(orderId: string, reference: string) {
  const { error } = await supabaseAdmin.from("admin_notifications").insert({
    title: "Payment received",
    message: `Payment confirmed for order ${orderId.slice(0, 8).toUpperCase()}. Reference: ${reference}`,
    type: "payment_received",
    entity_type: "order",
    entity_id: orderId,
    is_read: false,
  });

  if (error) {
    console.error("Failed to create admin payment notification:", error);
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!isValidPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;

    if (payload.event !== "charge.success") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const reference = String(payload.data?.reference || "").trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

    const { data: paymentAttempt, error: paymentAttemptError } = await supabaseAdmin
      .from("payment_attempts")
      .select(`
        id,
        order_id,
        reference,
        expected_amount,
        currency,
        status
      `)
      .eq("reference", reference)
      .single();

    if (paymentAttemptError || !paymentAttempt) {
      console.error("Payment attempt not found for reference:", reference);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (paymentAttempt.status === "paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const verifyResponse = await verifyPaystackTransaction(reference);
    const verified = verifyResponse.data;

    if (verified.status !== "success") {
      await supabaseAdmin
        .from("payment_attempts")
        .update({
          status: verified.status,
          raw_verify_response: verifyResponse,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentAttempt.id);

      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paidAmount = Number(verified.amount ?? 0) / 100;
    const expectedAmount = Number(paymentAttempt.expected_amount ?? 0);
    const paidCurrency = String(verified.currency || "NGN").toUpperCase();
    const expectedCurrency = String(paymentAttempt.currency || "NGN").toUpperCase();

    if (paidAmount !== expectedAmount || paidCurrency !== expectedCurrency) {
      await supabaseAdmin
        .from("payment_attempts")
        .update({
          status: "mismatch",
          raw_verify_response: verifyResponse,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentAttempt.id);

      console.error("Payment mismatch", {
        reference,
        paidAmount,
        expectedAmount,
        paidCurrency,
        expectedCurrency,
      });

      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select(`
        id,
        product_id,
        quantity
      `)
      .eq("order_id", paymentAttempt.order_id);

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    const productIds = (orderItems ?? [])
      .map((item) => item.product_id)
      .filter(Boolean) as string[];

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, stock, is_available")
      .in("id", productIds);

    if (productsError) {
      throw new Error(productsError.message);
    }

    const productMap = new Map((products ?? []).map((product) => [product.id, product]));

    for (const item of orderItems ?? []) {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new Error(`Product ${item.product_id} not found during stock update.`);
      }

      const nextStock = Number(product.stock) - Number(item.quantity);

      if (nextStock < 0) {
        throw new Error(`Insufficient stock while finalizing payment for ${item.product_id}.`);
      }

      const { error: stockError } = await supabaseAdmin
        .from("products")
        .update({
          stock: nextStock,
          is_available: nextStock > 0 ? product.is_available : false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id);

      if (stockError) {
        throw new Error(stockError.message);
      }
    }

    const paidAt = verified.paid_at || new Date().toISOString();

    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payment_attempts")
      .update({
        status: "paid",
        paid_at: paidAt,
        raw_verify_response: verifyResponse,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentAttempt.id);

    if (paymentUpdateError) {
      throw new Error(paymentUpdateError.message);
    }

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentAttempt.order_id);

    if (orderUpdateError) {
      throw new Error(orderUpdateError.message);
    }

    await createAdminPaymentNotification(paymentAttempt.order_id, reference);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/payments/webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
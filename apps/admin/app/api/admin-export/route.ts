import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export async function GET() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      customer_name,
      phone,
      status,
      total,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to CSV
  const headers = [
    "Order ID",
    "Customer",
    "Phone",
    "Status",
    "Total (₦)",
    "Date",
  ];

  const rows = (orders ?? []).map((order) => [
    order.id,
    order.customer_name ?? "",
    order.phone ?? "",
    order.status,
    order.total ?? 0,
    formatDate(order.created_at),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-export.csv"`,
    },
  });
}
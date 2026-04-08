"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type Order = {
  id: string;
  clerk_user_id: string | null;
  customer_name: string | null;
  status: string;
  phone: string | null;
  address: string | null;
  delivery_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products: {
    name: string;
  }[];
};

const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "admin-badge admin-badge-success";
    case "processing":
      return "admin-badge admin-badge-info";
    case "cancelled":
      return "admin-badge admin-badge-danger";
    case "pending":
    default:
      return "admin-badge admin-badge-warning";
  }
}

function formatOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatOrderCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function AdminOrderDetailsClient({
  order,
  items,
  updateOrderStatus,
}: {
  order: Order;
  items: OrderItem[];
  updateOrderStatus: (formData: FormData) => Promise<void>;
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".order-details-hero", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".order-details-panel", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        delay: 0.12,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="order-details-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Order Details</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Review full order information, customer details, purchased items,
              and update fulfillment status.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/orders" className="admin-btn-secondary">
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="order-details-panel admin-card p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-950">
                    Order #{order.id.slice(0, 8)}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatOrderDateTime(order.created_at)}
                  </p>
                </div>

                <span className={getStatusBadgeClass(order.status)}>
                  {order.status}
                </span>
              </div>

              <div className="admin-card-soft p-5">
                <h3 className="mb-4 text-lg font-bold text-stone-900">
                  Customer Details
                </h3>

                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between gap-4">
                    <span>Customer Name</span>
                    <span className="font-medium text-stone-900">
                      {order.customer_name || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Phone</span>
                    <span className="font-medium text-stone-900">
                      {order.phone || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Delivery Method</span>
                    <span className="font-medium capitalize text-stone-900">
                      {order.delivery_method}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>User ID</span>
                    <span className="break-all text-right font-medium text-stone-900">
                      {order.clerk_user_id || "No user id"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Address</span>
                    <span className="text-right font-medium text-stone-900">
                      {order.delivery_method === "delivery"
                        ? order.address || "N/A"
                        : "Customer pickup"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-details-panel admin-card p-6">
              <h2 className="mb-4 text-xl font-bold text-stone-950">
                Order Items
              </h2>

              {items.length === 0 ? (
                <p className="text-sm text-stone-500">No items found.</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="admin-card-soft flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-semibold text-stone-900">
                          {item.products?.[0]?.name ?? "Product"}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {item.quantity} × ₦{formatOrderCurrency(item.unit_price)}
                        </p>
                      </div>

                      <p className="font-semibold text-stone-900">
                        ₦{formatOrderCurrency(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="order-details-panel space-y-6">
            <div className="admin-card p-6">
              <h2 className="mb-4 text-xl font-bold text-stone-950">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">
                    ₦{formatOrderCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-stone-900">
                    ₦{formatOrderCurrency(order.delivery_fee)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="text-lg font-bold text-stone-950">
                    ₦{formatOrderCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-card-dark p-6">
              <h2 className="text-xl font-bold">Update Status</h2>

              <form action={updateOrderStatus} className="mt-4 space-y-3">
                <input type="hidden" name="orderId" value={order.id} />

                <select
                  name="status"
                  defaultValue={order.status}
                  className="admin-select"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button type="submit" className="admin-btn-primary w-full">
                  Save Status
                </button>
              </form>

              <p className="mt-5 text-sm leading-6 text-stone-300">
                Update this order carefully so the admin dashboard and customer
                flow stay in sync.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
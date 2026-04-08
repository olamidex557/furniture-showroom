"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Order = {
  id: string;
  clerk_user_id: string | null;
  customer_name: string | null;
  status: string;
  delivery_method: string;
  phone: string | null;
  address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
};

type Props = {
  orders: Order[];
  updateOrderStatus: (formData: FormData) => Promise<void>;
};

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

function formatOrderDate(value: string) {
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

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function AdminOrdersClient({
  orders,
  updateOrderStatus,
}: Props) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "processing" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".orders-hero", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".orders-toolbar", {
        y: 18,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: "power3.out",
      });

      gsap.from(".order-card", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.2,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        q.length === 0
          ? true
          : order.id.toLowerCase().includes(q) ||
            (order.customer_name ?? "").toLowerCase().includes(q) ||
            (order.phone ?? "").toLowerCase().includes(q) ||
            (order.address ?? "").toLowerCase().includes(q) ||
            (order.delivery_method ?? "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing"
  ).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="orders-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Orders Management</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Review customer orders, update statuses, and inspect delivery
              details from one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="admin-btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <section className="orders-toolbar mb-8 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="admin-card p-4">
            <label className="admin-label mb-2 block">Search orders</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order id, customer name, phone, or address"
              className="admin-input"
            />
          </div>

          <div className="admin-card p-4">
            <label className="admin-label mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "pending"
                    | "processing"
                    | "completed"
                    | "cancelled"
                )
              }
              className="admin-select"
            >
              <option value="all">All orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">All Orders</p>
            <h2 className="mt-4 text-4xl font-bold text-stone-950">
              {totalOrders}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Pending</p>
            <h2 className="mt-4 text-4xl font-bold text-amber-600">
              {pendingOrders}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Processing</p>
            <h2 className="mt-4 text-4xl font-bold text-blue-600">
              {processingOrders}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Completed</p>
            <h2 className="mt-4 text-4xl font-bold text-green-600">
              {completedOrders}
            </h2>
          </div>
        </section>

        {filteredOrders.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">
              No matching orders
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredOrders.map((order) => {
              const isCustomerCancelled =
                order.status === "cancelled" &&
                order.cancellation_reason === "Cancelled by customer";

              return (
                <div key={order.id} className="order-card admin-card p-6">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-stone-950">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatOrderDate(order.created_at)}
                          </p>
                        </div>

                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-stone-600">
                        <p>
                          <span className="font-semibold text-stone-900">
                            Customer:
                          </span>{" "}
                          {order.customer_name || "No name"}
                        </p>

                        <p>
                          <span className="font-semibold text-stone-900">
                            Phone:
                          </span>{" "}
                          {order.phone || "No phone"}
                        </p>

                        <p>
                          <span className="font-semibold text-stone-900">
                            Delivery:
                          </span>{" "}
                          <span className="capitalize">
                            {order.delivery_method}
                          </span>
                        </p>

                        <p className="break-all">
                          <span className="font-semibold text-stone-900">
                            User ID:
                          </span>{" "}
                          {order.clerk_user_id || "No user id"}
                        </p>

                        <p>
                          <span className="font-semibold text-stone-900">
                            Address:
                          </span>{" "}
                          {order.delivery_method === "delivery"
                            ? order.address || "No address"
                            : "Customer pickup"}
                        </p>

                        {order.cancellation_reason ? (
                          <p>
                            <span className="font-semibold text-stone-900">
                              Cancellation:
                            </span>{" "}
                            <span className="text-red-600">
                              {order.cancellation_reason}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="admin-card-soft p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-700">
                        Order Summary
                      </p>

                      <div className="space-y-2 text-sm text-stone-600">
                        <div className="flex justify-between gap-4">
                          <span>Subtotal</span>
                          <span className="font-semibold text-stone-900">
                            ₦{formatCurrency(order.subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span>Delivery Fee</span>
                          <span className="font-semibold text-stone-900">
                            ₦{formatCurrency(order.delivery_fee)}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-4 border-t border-stone-200 pt-3">
                          <span className="font-semibold text-stone-900">
                            Total
                          </span>
                          <span className="font-bold text-stone-950">
                            ₦{formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card-dark p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-300">
                        Actions
                      </p>

                      {isCustomerCancelled ? (
                        <div className="mb-3 rounded-2xl border border-red-400 bg-red-50 p-3 text-sm text-red-700">
                          Customer-cancelled order. Status editing is locked.
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <form action={updateOrderStatus} className="space-y-3">
                          <input type="hidden" name="orderId" value={order.id} />

                          <select
                            name="status"
                            defaultValue={order.status}
                            className="admin-select"
                            disabled={isCustomerCancelled}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            type="submit"
                            className="admin-btn-primary w-full"
                            disabled={isCustomerCancelled}
                          >
                            {isCustomerCancelled ? "Status Locked" : "Save Status"}
                          </button>
                        </form>

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-btn-secondary w-full"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
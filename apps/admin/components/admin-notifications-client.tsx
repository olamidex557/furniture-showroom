"use client";

import toast from "react-hot-toast";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { supabaseBrowser } from "../lib/supabase-browser";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

function formatNotificationDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function getNotificationHref(notification: AdminNotification) {
  if (notification.entity_type === "order" && notification.entity_id) {
    return `/admin/orders/${notification.entity_id}`;
  }

  if (notification.entity_type === "product" && notification.entity_id) {
    return `/admin/products/${notification.entity_id}`;
  }

  return null;
}

function getNotificationBadgeClass(type: string) {
  switch (type) {
    case "order_cancelled":
      return "admin-badge admin-badge-danger";
    case "order_created":
      return "admin-badge admin-badge-success";
    default:
      return "admin-badge admin-badge-neutral";
  }
}

function formatNotificationType(type: string) {
  switch (type) {
    case "order_cancelled":
      return "Order Cancelled";
    case "order_created":
      return "Order Created";
    default:
      return type
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

function sortNotificationsDesc(items: AdminNotification[]) {
  return [...items].sort((a, b) => {
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}

export default function AdminNotificationsClient() {
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      const hero = pageRef.current?.querySelector(".notifications-hero");

      if (hero) {
        gsap.from(hero, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!pageRef.current || loading || notifications.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".notification-card");

      if (cards.length === 0) return;

      gsap.from(cards, {
        y: 18,
        opacity: 0,
        scale: 0.98,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, notifications]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin-notifications", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load notifications.");
      }

      const nextNotifications = Array.isArray(result.data) ? result.data : [];
      setNotifications(sortNotificationsDesc(nextNotifications));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
  toast.success("Toast is mounted");
}, []);

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          setNotifications((current) => {
            if (payload.eventType === "INSERT") {
              const inserted = payload.new as AdminNotification;
              return sortNotificationsDesc([inserted, ...current]);
            }

            if (payload.eventType === "UPDATE") {
              const updated = payload.new as AdminNotification;

              return sortNotificationsDesc(
                current.map((item) => (item.id === updated.id ? updated : item))
              );
            }

            if (payload.eventType === "DELETE") {
              const deleted = payload.old as { id?: string };

              return current.filter((item) => item.id !== deleted.id);
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      const response = await fetch("/api/admin-notifications", {
        method: "PATCH",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark all as read.");
      }

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOneAsRead = async (id: string) => {
    try {
      setMarkingId(id);

      const response = await fetch(`/api/admin-notifications/${id}/read`, {
        method: "PATCH",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark notification as read.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <main ref={pageRef} className="admin-page">
      <div className="admin-container">
        <div className="notifications-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-500">
              Furniture Admin
            </p>
            <h1 className="admin-title">Notifications</h1>
            <p className="admin-subtitle mt-3 max-w-2xl">
              Stay updated on customer and catalog activity in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="admin-btn-secondary">
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="admin-btn-primary"
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Total</p>
            <h2 className="mt-4 text-4xl font-bold text-stone-950">
              {notifications.length}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Unread</p>
            <h2 className="mt-4 text-4xl font-bold text-red-600">
              {unreadCount}
            </h2>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-medium text-stone-500">Read</p>
            <h2 className="mt-4 text-4xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </h2>
          </div>
        </section>

        {loading ? (
          <div className="admin-card p-10 text-center">
            <p className="text-sm text-stone-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">
              No notifications yet
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              New admin activity will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {notifications.map((notification) => {
              const href = getNotificationHref(notification);

              return (
                <div
                  key={notification.id}
                  className={`notification-card admin-card p-6 ${
                    notification.is_read
                      ? "opacity-80"
                      : "border-l-4 border-red-500"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span
                          className={getNotificationBadgeClass(notification.type)}
                        >
                          {formatNotificationType(notification.type)}
                        </span>

                        {!notification.is_read ? (
                          <span className="admin-badge admin-badge-warning">
                            unread
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-success">
                            read
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-stone-950">
                        {notification.title}
                      </h2>

                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs font-medium text-stone-500">
                        {formatNotificationDateTime(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {href ? (
                        <Link
                          href={href}
                          className="admin-btn-secondary"
                          onClick={() => {
                            if (!notification.is_read) {
                              void handleMarkOneAsRead(notification.id);
                            }
                          }}
                        >
                          Open
                        </Link>
                      ) : null}

                      {!notification.is_read ? (
                        <button
                          type="button"
                          onClick={() => handleMarkOneAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="admin-btn-primary"
                        >
                          {markingId === notification.id
                            ? "Marking..."
                            : "Mark as read"}
                        </button>
                      ) : null}
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
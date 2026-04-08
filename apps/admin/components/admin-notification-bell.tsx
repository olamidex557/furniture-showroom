"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";

type AdminNotification = {
  id: string;
  is_read: boolean;
  created_at: string;
};

type NotificationsApiResponse = {
  success?: boolean;
  data?: AdminNotification[];
  unreadCount?: number;
  error?: string;
};

function sortNotificationsDesc(items: AdminNotification[]) {
  return [...items].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const mountedRef = useRef(true);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-notifications", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as NotificationsApiResponse;

      if (!response.ok) {
        throw new Error(result.error || "Failed to load notifications.");
      }

      const nextNotifications = Array.isArray(result.data) ? result.data : [];

      if (!mountedRef.current) return;

      setNotifications(sortNotificationsDesc(nextNotifications));
    } catch (error) {
      console.error("Failed to load notification bell data:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadNotifications();

    return () => {
      mountedRef.current = false;
    };
  }, [loadNotifications]);

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("admin-notification-bell-realtime")
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

              const exists = current.some((item) => item.id === inserted.id);
              if (exists) return current;

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
      .subscribe((status) => {
        console.log("Bell realtime status:", status);
      });

    return () => {
      void supabaseBrowser.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  return (
    <button
      type="button"
      onClick={() => router.push("/admin/notifications")}
      className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:bg-stone-50"
      aria-label="Open notifications"
      title="Notifications"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 1 5.454 1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.642 23.848 23.848 0 0 1 5.454-1.31m5.715 0a24.255 24.255 0 0 0-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>

      {!loading && unreadCount > 0 ? (
        <span className="absolute -right-2 -top-2 inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-extrabold leading-none text-white shadow-md ring-2 ring-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
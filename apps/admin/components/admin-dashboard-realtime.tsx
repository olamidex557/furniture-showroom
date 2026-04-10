"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function AdminDashboardRealtime() {
  const router = useRouter();

  useEffect(() => {
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      refreshTimeout = setTimeout(() => {
        router.refresh();
      }, 400);
    };

    const ordersChannel = supabaseBrowser
      .channel("admin-dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    const productsChannel = supabaseBrowser
      .channel("admin-dashboard-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    const deliveryZonesChannel = supabaseBrowser
      .channel("admin-dashboard-delivery-zones")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_zones",
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    const notificationsChannel = supabaseBrowser
      .channel("admin-dashboard-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications",
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      void supabaseBrowser.removeChannel(ordersChannel);
      void supabaseBrowser.removeChannel(productsChannel);
      void supabaseBrowser.removeChannel(deliveryZonesChannel);
      void supabaseBrowser.removeChannel(notificationsChannel);
    };
  }, [router]);

  return null;
}
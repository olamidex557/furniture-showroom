import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase-admin";
import AdminNotificationBell from "../../components/admin-notification-bell";
import AdminDashboardRealtime from "../../components/admin-dashboard-realtime";

type OrderRow = {
  id: string;
  status: string;
  total: number | null;
  created_at: string;
  customer_name: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number | null;
  line_total: number | null;
  products:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDateTime(value: string) {
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

function getLagosDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getLagosDayLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
  }).format(date);
}

function getOrderStatusClass(status: string) {
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

function getProductName(products: OrderItemRow["products"]): string {
  if (!products) return "Unknown Product";

  if (Array.isArray(products)) {
    return products[0]?.name || "Unknown Product";
  }

  return products.name || "Unknown Product";
}

function getLastNDays(dayCount: number) {
  const days: { key: string; label: string }[] = [];

  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push({
      key: getLagosDateKey(date),
      label: getLagosDayLabel(date),
    });
  }

  return days;
}

export default async function AdminDashboardPage() {
  const [
    productsCountResult,
    lowStockResult,
    zonesResult,
    ordersResult,
    orderItemsResult,
  ] = await Promise.all([
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .lte("stock", 5),
    supabaseAdmin
      .from("delivery_zones")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        total,
        created_at,
        customer_name
      `)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        line_total,
        products (
          name
        )
      `),
  ]);

  if (ordersResult.error) {
    throw new Error(ordersResult.error.message);
  }

  if (orderItemsResult.error) {
    throw new Error(orderItemsResult.error.message);
  }

  const orders = (ordersResult.data ?? []) as OrderRow[];
  const orderItems = (orderItemsResult.data ?? []) as OrderItemRow[];

  const todayKey = getLagosDateKey(new Date());

  const completedOrders = orders.filter((order) => order.status === "completed");
  const processingOrders = orders.filter((order) => order.status === "processing");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  const revenueOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "processing"
  );

  const totalRevenue = revenueOrders.reduce((sum, order) => {
    return sum + Number(order.total ?? 0);
  }, 0);

  const todayOrders = orders.filter((order) => {
    return getLagosDateKey(order.created_at) === todayKey;
  });

  const todayRevenue = todayOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => {
      return sum + Number(order.total ?? 0);
    }, 0);

  const orderStatusById = new Map(orders.map((order) => [order.id, order.status]));

  const validOrderItems = orderItems.filter((item) => {
    const orderStatus = orderStatusById.get(item.order_id);
    return orderStatus && orderStatus !== "cancelled";
  });

  const productSalesMap = new Map<
    string,
    {
      productId: string;
      name: string;
      quantitySold: number;
      revenue: number;
    }
  >();

  for (const item of validOrderItems) {
    if (!item.product_id) continue;

    const existing = productSalesMap.get(item.product_id);

    if (existing) {
      existing.quantitySold += Number(item.quantity ?? 0);
      existing.revenue += Number(item.line_total ?? 0);
    } else {
      productSalesMap.set(item.product_id, {
        productId: item.product_id,
        name: getProductName(item.products),
        quantitySold: Number(item.quantity ?? 0),
        revenue: Number(item.line_total ?? 0),
      });
    }
  }

  const topSellingProducts = [...productSalesMap.values()]
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 6);

  const stats = [
    {
      label: "Total Products",
      value: productsCountResult.count ?? 0,
      href: "/admin/products",
      valueClassName: "text-stone-950",
    },
    {
      label: "Total Revenue",
      value: `₦${formatCurrency(totalRevenue)}`,
      href: "/admin/orders",
      valueClassName: "text-green-600",
    },
    {
      label: "Orders Today",
      value: todayOrders.length,
      href: "/admin/orders",
      valueClassName: "text-blue-600",
    },
    {
      label: "Revenue Today",
      value: `₦${formatCurrency(todayRevenue)}`,
      href: "/admin/orders",
      valueClassName: "text-emerald-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.length,
      href: "/admin/orders",
      valueClassName: "text-amber-600",
    },
    {
      label: "Completed Orders",
      value: completedOrders.length,
      href: "/admin/orders",
      valueClassName: "text-green-600",
    },
    {
      label: "Cancelled Orders",
      value: cancelledOrders.length,
      href: "/admin/orders",
      valueClassName: "text-red-600",
    },
    {
      label: "Low Stock Items",
      value: lowStockResult.count ?? 0,
      href: "/admin/products",
      valueClassName: "text-red-600",
    },
    {
      label: "Active Delivery Zones",
      value: zonesResult.count ?? 0,
      href: "/admin/delivery-fees",
      valueClassName: "text-stone-950",
    },
  ];

  const trendDays = getLastNDays(7);

  const ordersByDay = trendDays.map((day) => {
    const count = orders.filter(
      (order) => getLagosDateKey(order.created_at) === day.key
    ).length;

    return {
      label: day.label,
      value: count,
    };
  });

  const revenueByDay = trendDays.map((day) => {
    const revenue = orders
      .filter(
        (order) =>
          getLagosDateKey(order.created_at) === day.key &&
          order.status !== "cancelled"
      )
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    return {
      label: day.label,
      value: revenue,
    };
  });

  const maxOrdersByDay = Math.max(...ordersByDay.map((item) => item.value), 1);
  const maxRevenueByDay = Math.max(...revenueByDay.map((item) => item.value), 1);

  const statusChart = [
    {
      label: "Pending",
      value: pendingOrders.length,
      barClassName: "bg-amber-500",
      textClassName: "text-amber-700",
    },
    {
      label: "Processing",
      value: processingOrders.length,
      barClassName: "bg-blue-500",
      textClassName: "text-blue-700",
    },
    {
      label: "Completed",
      value: completedOrders.length,
      barClassName: "bg-green-500",
      textClassName: "text-green-700",
    },
    {
      label: "Cancelled",
      value: cancelledOrders.length,
      barClassName: "bg-red-500",
      textClassName: "text-red-700",
    },
  ];

  const maxStatusValue = Math.max(...statusChart.map((item) => item.value), 1);

  return (
    <main className="admin-page">
      <AdminDashboardRealtime />

      <div className="admin-container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Overview</p>
            <h1 className="admin-title mt-2">Admin Dashboard</h1>
            <p className="admin-subtitle mt-3">
              Monitor products, orders, revenue, stock, and location-based
              delivery fees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminNotificationBell />

            <Link href="/api/admin-export" className="admin-btn-secondary">
              Export Orders CSV
            </Link>

            <Link href="/admin/products/new" className="admin-btn-primary">
              Add Product
            </Link>

            <Link href="/admin/orders" className="admin-btn-secondary">
              Manage Orders
            </Link>

            <Link href="/admin/delivery-fees" className="admin-btn-secondary">
              Delivery Fees
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="admin-card p-6 transition hover:-translate-y-0.5"
            >
              <p className="text-sm font-medium text-stone-500">{stat.label}</p>
              <p
                className={`mt-3 text-3xl font-bold tracking-tight ${stat.valueClassName}`}
              >
                {stat.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                Orders Trend (Last 7 Days)
              </h2>
              <Link href="/admin/orders" className="admin-btn-secondary">
                View Orders
              </Link>
            </div>

            <div className="space-y-4">
              {ordersByDay.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-600">
                      {item.label}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-stone-100">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.max(
                          (item.value / maxOrdersByDay) * 100,
                          item.value > 0 ? 10 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                Revenue Trend (Last 7 Days)
              </h2>
              <Link href="/admin/orders" className="admin-btn-secondary">
                View Revenue
              </Link>
            </div>

            <div className="space-y-4">
              {revenueByDay.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-600">
                      {item.label}
                    </span>
                    <span className="font-semibold text-stone-900">
                      ₦{formatCurrency(item.value)}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-stone-100">
                    <div
                      className="h-3 rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.max(
                          (item.value / maxRevenueByDay) * 100,
                          item.value > 0 ? 10 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                Order Status Distribution
              </h2>
              <Link href="/admin/orders" className="admin-btn-secondary">
                Open Orders
              </Link>
            </div>

            <div className="space-y-4">
              {statusChart.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={`font-semibold ${item.textClassName}`}>
                      {item.label}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-stone-100">
                    <div
                      className={`h-3 rounded-full transition-all ${item.barClassName}`}
                      style={{
                        width: `${Math.max(
                          (item.value / maxStatusValue) * 100,
                          item.value > 0 ? 10 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                Top Selling Products
              </h2>

              <Link href="/admin/products" className="admin-btn-secondary">
                Open Products
              </Link>
            </div>

            {topSellingProducts.length === 0 ? (
              <p className="text-sm text-stone-500">
                No product sales data yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topSellingProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="admin-card-soft flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="text-xs font-medium text-stone-500">
                        #{index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {product.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">
                        {product.quantitySold} sold
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        ₦{formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                Recent Orders
              </h2>

              <Link href="/admin/orders" className="admin-btn-secondary">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-stone-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="admin-card-soft block p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {order.customer_name || "No customer name"}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={getOrderStatusClass(order.status)}>
                          {order.status}
                        </span>
                        <p className="mt-2 text-sm font-bold text-stone-900">
                          ₦{formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card p-6">
            <h2 className="text-xl font-bold text-stone-900">
              Quick Actions
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/products" className="admin-btn-secondary">
                Manage Products
              </Link>

              <Link href="/admin/orders" className="admin-btn-secondary">
                Manage Orders
              </Link>

              <Link
                href="/admin/products/new"
                className="admin-btn-secondary"
              >
                Add New Product
              </Link>

              <Link
                href="/admin/delivery-fees"
                className="admin-btn-secondary"
              >
                Set Delivery Fees
              </Link>

              <Link
                href="/admin/notifications"
                className="admin-btn-secondary"
              >
                Open Notifications
              </Link>
            </div>

            <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-bold text-stone-900">
                Delivery Fee Control
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Set different delivery charges for each customer location instead
                of using a single flat fee. This helps you price delivery more
                accurately and keeps checkout flexible.
              </p>

              <div className="mt-5">
                <Link href="/admin/delivery-fees" className="admin-btn-primary">
                  Open Delivery Fee Manager
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
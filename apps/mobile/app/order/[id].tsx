import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { supabase } from "../../src/lib/supabase";
import { COLORS } from "../../src/constants/colors";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products: {
    name: string;
  }[] | null;
};

type Order = {
  id: string;
  clerk_user_id: string | null;
  status: string;
  delivery_method: string;
  phone: string | null;
  address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  payment_status?: string | null;
};

function formatCurrency(value: number | null | undefined) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function formatOrderDate(value: string | null | undefined) {
  if (!value) return "Unknown date";

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
  }).format(date);
}

function getStatusMeta(status: string) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "completed":
      return {
        label: "Completed",
        bg: "#DCFCE7",
        text: "#166534",
      };
    case "processing":
      return {
        label: "Processing",
        bg: "#DBEAFE",
        text: "#1D4ED8",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        bg: "#FEE2E2",
        text: "#B91C1C",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        bg: "#FEF3C7",
        text: "#B45309",
      };
  }
}

function getPaymentStatusMeta(status: string | null | undefined) {
  const normalized = (status ?? "unpaid").toLowerCase();

  switch (normalized) {
    case "paid":
      return {
        label: "Paid",
        bg: "#DCFCE7",
        text: "#166534",
      };
    case "initiated":
      return {
        label: "Payment Started",
        bg: "#DBEAFE",
        text: "#1D4ED8",
      };
    case "pending":
      return {
        label: "Payment Pending",
        bg: "#FEF3C7",
        text: "#B45309",
      };
    case "failed":
      return {
        label: "Payment Failed",
        bg: "#FEE2E2",
        text: "#B91C1C",
      };
    case "unpaid":
    default:
      return {
        label: "Unpaid",
        bg: "#F3F4F6",
        text: "#374151",
      };
  }
}

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const orderId = useMemo(() => {
    const raw = params.id;

    if (Array.isArray(raw)) {
      return raw[0] ?? null;
    }

    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw;
    }

    return null;
  }, [params.id]);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        if (!orderId) {
          setNotAllowed(true);
          setErrorMessage("Missing order id.");
          return;
        }

        if (!user) {
          setNotAllowed(true);
          setErrorMessage("You need to sign in to view this order.");
          return;
        }

        setLoading(true);
        setErrorMessage(null);
        setNotAllowed(false);

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("clerk_user_id", user.id)
          .single();

        if (orderError || !orderData) {
          setNotAllowed(true);
          setErrorMessage("Order not found or access denied.");
          return;
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            id,
            quantity,
            unit_price,
            line_total,
            products (
              name
            )
          `)
          .eq("order_id", orderId);

        if (itemsError) {
          throw new Error(itemsError.message);
        }

        setOrder(orderData as Order);
        setItems((itemsData ?? []) as OrderItem[]);
      } catch (error) {
        console.error("Failed to load order details:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setLoading(false);
      setNotAllowed(true);
      setErrorMessage("You need to sign in to view this order.");
      return;
    }

    loadOrderDetails();
  }, [orderId, isLoaded, isSignedIn, user]);

  const statusMeta = useMemo(() => {
    return getStatusMeta(order?.status ?? "pending");
  }, [order?.status]);

  const paymentStatusMeta = useMemo(() => {
    return getPaymentStatusMeta(order?.payment_status ?? "unpaid");
  }, [order?.payment_status]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text
            style={{
              marginTop: 12,
              fontSize: 15,
              color: COLORS.textSecondary,
            }}
          >
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notAllowed || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: COLORS.textPrimary,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Order not found
          </Text>

          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 22,
            }}
          >
            {errorMessage ?? "You can only view your own orders."}
          </Text>

          <Pressable
            onPress={() => router.replace("/orders" as any)}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 20,
              paddingVertical: 13,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              Back to Orders
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Pressable
            onPress={() => router.replace("/orders" as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                color: COLORS.textPrimary,
                fontWeight: "700",
                marginTop: -2,
              }}
            >
              ‹
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              marginLeft: 12,
              color: COLORS.textPrimary,
            }}
          >
            Order Details
          </Text>
        </View>

        <View
          style={{
            backgroundColor: COLORS.surface,
            padding: 18,
            borderRadius: 18,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  marginBottom: 4,
                }}
              >
                Order #{order.id.slice(0, 8).toUpperCase()}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                }}
              >
                Placed on {formatOrderDate(order.created_at)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end", gap: 8 }}>
              <View
                style={{
                  backgroundColor: statusMeta.bg,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: statusMeta.text,
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
                  {statusMeta.label}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: paymentStatusMeta.bg,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: paymentStatusMeta.text,
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
                  {paymentStatusMeta.label}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: COLORS.background,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 8,
              }}
            >
              Delivery Method:{" "}
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {order.delivery_method}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: order.delivery_method === "delivery" ? 8 : 0,
              }}
            >
              Phone:{" "}
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontWeight: "700",
                }}
              >
                {order.phone ?? "N/A"}
              </Text>
            </Text>

            {order.delivery_method === "delivery" ? (
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 21,
                }}
              >
                Address:{" "}
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontWeight: "700",
                  }}
                >
                  {order.address ?? "N/A"}
                </Text>
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                }}
              >
                Pickup order
              </Text>
            )}
          </View>
        </View>

        <Text
          style={{
            fontSize: 19,
            fontWeight: "800",
            marginBottom: 10,
            color: COLORS.textPrimary,
          }}
        >
          Items
        </Text>

        {items.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.surface,
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                color: COLORS.textSecondary,
              }}
            >
              No items found for this order.
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View
              key={item.id}
              style={{
                backgroundColor: COLORS.surface,
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontWeight: "800",
                    color: COLORS.textPrimary,
                    fontSize: 16,
                  }}
                >
                  {item.products?.[0]?.name ?? `Product ${index + 1}`}
                </Text>

                <Text
                  style={{
                    color: COLORS.primaryDark,
                    fontWeight: "800",
                    fontSize: 15,
                  }}
                >
                  {formatCurrency(item.line_total)}
                </Text>
              </View>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  marginBottom: 4,
                  fontSize: 14,
                }}
              >
                Quantity:{" "}
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontWeight: "700",
                  }}
                >
                  {item.quantity}
                </Text>
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 14,
                }}
              >
                Unit Price:{" "}
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(item.unit_price)}
                </Text>
              </Text>
            </View>
          ))
        )}

        <View
          style={{
            marginTop: 12,
            padding: 18,
            borderRadius: 18,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: COLORS.textPrimary,
              marginBottom: 14,
            }}
          >
            Payment Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: 15 }}>
              Subtotal
            </Text>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {formatCurrency(order.subtotal)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: 15 }}>
              Delivery Fee
            </Text>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {formatCurrency(order.delivery_fee)}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
              marginBottom: 12,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: COLORS.textPrimary,
              }}
            >
              Total
            </Text>
            <Text
              style={{
                fontSize: 19,
                fontWeight: "900",
                color: COLORS.primaryDark,
              }}
            >
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <Text
            style={{
              marginTop: 12,
              color: "#B91C1C",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {errorMessage}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { MotiView } from "moti";
import { supabase } from "../src/lib/supabase";
import { COLORS } from "../src/constants/colors";
import { createAdminNotification } from "../src/lib/admin-notifications";

type OrderRow = {
  id: string;
  customer_name: string | null;
  phone: string | null;
  address: string | null;
  delivery_method: "delivery" | "pickup";
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type ProductRow = {
  id: string;
  stock: number;
  is_available: boolean;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          phone,
          address,
          delivery_method,
          subtotal,
          delivery_fee,
          total,
          status,
          created_at,
          cancelled_at,
          cancellation_reason
        `)
        .eq("clerk_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setOrders((data ?? []) as OrderRow[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load orders.";
      Alert.alert("Orders", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const restoreStockForCancelledOrder = async (orderId: string) => {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, quantity, unit_price, line_total")
      .eq("order_id", orderId);

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    const typedOrderItems = (orderItems ?? []) as OrderItemRow[];

    for (const item of typedOrderItems) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, stock, is_available")
        .eq("id", item.product_id)
        .single();

      if (productError) {
        throw new Error(productError.message);
      }

      const typedProduct = product as ProductRow;
      const nextStock =
        Number(typedProduct.stock ?? 0) + Number(item.quantity ?? 0);

      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock: nextStock,
          is_available: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }
  };

  const cancelOrder = async (order: OrderRow) => {
    if (!user || !isSignedIn) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }

    if (order.status !== "pending") {
      Alert.alert(
        "Cannot cancel",
        "Only pending orders can be cancelled."
      );
      return;
    }

    Alert.alert(
      "Cancel order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setCancellingId(order.id);

              const { data: latestOrder, error: latestOrderError } = await supabase
                .from("orders")
                .select("id, status, customer_name, total")
                .eq("id", order.id)
                .single();

              if (latestOrderError) {
                throw new Error(latestOrderError.message);
              }

              if (!latestOrder || latestOrder.status !== "pending") {
                throw new Error(
                  "This order can no longer be cancelled."
                );
              }

              await restoreStockForCancelledOrder(order.id);

              const { error: cancelError } = await supabase
                .from("orders")
                .update({
                  status: "cancelled",
                  cancelled_at: new Date().toISOString(),
                  cancellation_reason: "Cancelled by customer",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", order.id);

              if (cancelError) {
                throw new Error(cancelError.message);
              }

              try {
                await createAdminNotification({
                  title: "Order cancelled by customer",
                  message: `${
                    latestOrder.customer_name || "A customer"
                  } cancelled an order worth ₦${Number(
                    latestOrder.total ?? 0
                  ).toLocaleString()}.`,
                  type: "order_cancelled",
                  entityType: "order",
                  entityId: order.id,
                });
              } catch (error) {
                console.log("Admin notification failed:", error);
              }

              setOrders((current) =>
                current.map((item) =>
                  item.id === order.id
                    ? {
                        ...item,
                        status: "cancelled",
                        cancelled_at: new Date().toISOString(),
                        cancellation_reason: "Cancelled by customer",
                      }
                    : item
                )
              );

              Alert.alert("Cancelled", "Your order has been cancelled.");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to cancel order.";
              Alert.alert("Cancellation failed", message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text
            style={{
              marginTop: 12,
              color: COLORS.textSecondary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            padding: 20,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 22,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 8,
              }}
            >
              Sign in required
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              You need to sign in before viewing your orders.
            </Text>

            <Pressable
              onPress={() => router.push("/sign-in" as any)}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 16,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 6,
              }}
            >
              My Orders
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
              }}
            >
              Track and manage your orders
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={COLORS.textPrimary}
            />
          </Pressable>
        </MotiView>

        {orders.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="cube-outline"
              size={46}
              color={COLORS.textSecondary}
            />

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              No orders yet
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              Your placed orders will appear here.
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)" as any)}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 13,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontWeight: "700",
                }}
              >
                Start Shopping
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {orders.map((order, index) => {
              const isPending = order.status === "pending";
              const isCancelling = cancellingId === order.id;

              return (
                <MotiView
                  key={order.id}
                  from={{ opacity: 0, translateY: 16, scale: 0.98 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  transition={{
                    type: "timing",
                    duration: 320,
                    delay: index * 60,
                  }}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    padding: 18,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
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
                        {new Date(order.created_at).toLocaleString()}
                      </Text>
                    </View>

                    <StatusBadge status={order.status} />
                  </View>

                  <InfoRow label="Total" value={`₦${Number(order.total).toLocaleString()}`} />
                  <InfoRow
                    label="Delivery"
                    value={order.delivery_method === "pickup" ? "Pickup" : "Delivery"}
                  />
                  <InfoRow
                    label="Address"
                    value={order.address || "No address provided"}
                  />

                  {order.status === "cancelled" && order.cancellation_reason ? (
                    <View
                      style={{
                        marginTop: 10,
                        backgroundColor: "#FEF2F2",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#991B1B",
                          fontWeight: "600",
                        }}
                      >
                        {order.cancellation_reason}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <Pressable
                      onPress={() => router.push(`/order/${order.id}` as any)}
                      style={{
                        flex: 1,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        paddingVertical: 13,
                        alignItems: "center",
                        backgroundColor: COLORS.background,
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.textPrimary,
                          fontWeight: "700",
                        }}
                      >
                        View Details
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={!isPending || isCancelling}
                      onPress={() => cancelOrder(order)}
                      style={{
                        flex: 1,
                        borderRadius: 14,
                        paddingVertical: 13,
                        alignItems: "center",
                        backgroundColor:
                          !isPending || isCancelling ? COLORS.border : "#FEE2E2",
                      }}
                    >
                      {isCancelling ? (
                        <ActivityIndicator color="#B91C1C" />
                      ) : (
                        <Text
                          style={{
                            color:
                              !isPending ? COLORS.textSecondary : "#B91C1C",
                            fontWeight: "700",
                          }}
                        >
                          {isPending ? "Cancel Order" : "Cannot Cancel"}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </MotiView>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 14,
          fontWeight: "600",
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "processing" | "completed" | "cancelled";
}) {
  const styles = {
    pending: {
      bg: "#FEF3C7",
      text: "#92400E",
      label: "Pending",
    },
    processing: {
      bg: "#DBEAFE",
      text: "#1D4ED8",
      label: "Processing",
    },
    completed: {
      bg: "#DCFCE7",
      text: "#166534",
      label: "Completed",
    },
    cancelled: {
      bg: "#FEE2E2",
      text: "#B91C1C",
      label: "Cancelled",
    },
  }[status];

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          color: styles.text,
          fontWeight: "700",
          fontSize: 12,
        }}
      >
        {styles.label}
      </Text>
    </View>
  );
}
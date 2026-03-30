import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "../src/lib/supabase";
import { COLORS } from "../src/constants/colors";
import { sendInAppNotification } from "../src/lib/in-app-notifications";
import AnimatedScreen from "../src/components/AnimatedScreen";
import AnimatedCard from "../src/components/AnimatedCard";

type OrderItem = {
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
};

function formatCurrency(value: number) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getStatusColors(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        background: "#DCFCE7",
        text: "#166534",
      };
    case "processing":
      return {
        background: "#DBEAFE",
        text: "#1D4ED8",
      };
    case "cancelled":
      return {
        background: "#FEE2E2",
        text: "#B91C1C",
      };
    case "pending":
    default:
      return {
        background: "#FEF3C7",
        text: "#B45309",
      };
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const lastStatusesRef = useRef<Record<string, string>>({});

  const loadOrders = useCallback(
    async (showLoader = false) => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            clerk_user_id,
            customer_name,
            status,
            delivery_method,
            phone,
            address,
            subtotal,
            delivery_fee,
            total,
            created_at
          `)
          .eq("clerk_user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        const nextOrders = (data ?? []) as OrderItem[];
        setOrders(nextOrders);

        const statusMap: Record<string, string> = {};
        for (const order of nextOrders) {
          statusMap[order.id] = order.status;
        }
        lastStatusesRef.current = statusMap;
      } catch (error) {
        console.log("Failed to load orders:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoaded, isSignedIn, user]
  );

  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const channel = supabase
      .channel(`orders-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `clerk_user_id=eq.${user.id}`,
        },
        async (payload) => {
          const eventType = payload.eventType;

          if (eventType === "UPDATE") {
            const newRow = payload.new as OrderItem;
            const oldStatus = lastStatusesRef.current[newRow.id];
            const newStatus = newRow.status;

            if (oldStatus && oldStatus !== newStatus) {
              sendInAppNotification({
                title: "Order Update",
                body: `Your order #${newRow.id.slice(0, 8)} is now ${newStatus}.`,
              });
            }

            lastStatusesRef.current[newRow.id] = newStatus;
          }

          if (eventType === "INSERT") {
            const newRow = payload.new as OrderItem;
            lastStatusesRef.current[newRow.id] = newRow.status;

            sendInAppNotification({
              title: "New Order",
              body: `A new order #${newRow.id.slice(0, 8)} has been added to your history.`,
            });
          }

          await loadOrders(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoaded, isSignedIn, user, loadOrders]);

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
        <AnimatedScreen>
          <View
            style={{
              flex: 1,
              padding: 20,
              justifyContent: "center",
            }}
          >
            <AnimatedCard
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
                Sign in to view your orders and receive live status updates.
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
            </AnimatedCard>
          </View>
        </AnimatedScreen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AnimatedScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
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

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.textPrimary,
              }}
            >
              My Orders
            </Text>

            <Pressable
              onPress={() => loadOrders(false)}
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
              {refreshing ? (
                <ActivityIndicator size="small" color={COLORS.primaryDark} />
              ) : (
                <MotiView
                  from={{ rotate: "0deg" }}
                  animate={{ rotate: refreshing ? "180deg" : "0deg" }}
                  transition={{ type: "timing", duration: 350 }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={COLORS.textPrimary}
                  />
                </MotiView>
              )}
            </Pressable>
          </MotiView>

          <AnimatedCard
            delay={100}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 18,
              marginBottom: 18,
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
              Your Orders
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: COLORS.textSecondary,
              }}
            >
              This page updates automatically when your order status changes.
            </Text>
          </AnimatedCard>

          {orders.length === 0 ? (
            <AnimatedCard
              delay={160}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 22,
                alignItems: "center",
              }}
            >
              <MotiView
                from={{ scale: 0.9, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 500,
                  loop: true,
                }}
              >
                <Ionicons
                  name="cube-outline"
                  size={42}
                  color={COLORS.textSecondary}
                />
              </MotiView>

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
                }}
              >
                Once you place an order, it will appear here with live updates.
              </Text>
            </AnimatedCard>
          ) : (
            orders.map((order, index) => {
              const statusColors = getStatusColors(order.status);

              return (
                <AnimatedCard
                  key={order.id}
                  delay={180 + index * 70}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    padding: 18,
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: COLORS.textPrimary,
                          marginBottom: 4,
                        }}
                      >
                        Order #{order.id.slice(0, 8)}
                      </Text>

                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.textSecondary,
                          marginBottom: 3,
                        }}
                      >
                        {order.customer_name ?? "Customer"}
                      </Text>

                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.textSecondary,
                        }}
                      >
                        {formatDate(order.created_at)}
                      </Text>
                    </View>

                    <MotiView
                      from={{ scale: 0.92, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "timing", duration: 260 }}
                      style={{
                        backgroundColor: statusColors.background,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color: statusColors.text,
                          fontWeight: "700",
                          fontSize: 12,
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </Text>
                    </MotiView>
                  </View>

                  <View
                    style={{
                      backgroundColor: COLORS.accent,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <InfoRow label="Delivery Method" value={order.delivery_method} />
                    <InfoRow label="Phone" value={order.phone || "Not provided"} />
                    <InfoRow
                      label="Address"
                      value={
                        order.delivery_method === "delivery"
                          ? order.address || "Not provided"
                          : "Customer pickup"
                      }
                      noMargin
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.textSecondary,
                      }}
                    >
                      Total
                    </Text>

                    <MotiView
                      from={{ opacity: 0.7, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "timing", duration: 280 }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "800",
                          color: COLORS.primaryDark,
                        }}
                      >
                        {formatCurrency(order.total)}
                      </Text>
                    </MotiView>
                  </View>
                </AnimatedCard>
              );
            })
          )}
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  noMargin,
}: {
  label: string;
  value: string;
  noMargin?: boolean;
}) {
  return (
    <View
      style={{
        marginBottom: noMargin ? 0 : 10,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: COLORS.textSecondary,
          marginBottom: 2,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: COLORS.textPrimary,
          textTransform:
            label === "Delivery Method" ? "capitalize" : "none",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
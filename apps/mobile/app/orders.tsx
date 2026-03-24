import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { fetchOrders, type OrderHistoryItem } from "../src/lib/products";
import { COLORS } from "../src/constants/colors";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return { bg: "#DCFCE7", text: "#166534" };
    case "processing":
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    case "cancelled":
      return { bg: "#FEE2E2", text: "#991B1B" };
    case "pending":
    default:
      return { bg: "#FEF3C7", text: "#B45309" };
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      if (!user) return;
      setLoading(true);
      setError(null);
      const result = await fetchOrders(user.id);
      setOrders(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load orders.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadOrders();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 28,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 34, marginBottom: 16 }}>🔐</Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Sign in to view orders
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              Your order history is tied to your account.
            </Text>

            <Pressable
              onPress={() => router.push("/sign-in" as any)}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 22,
                paddingVertical: 13,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontWeight: "700",
                  fontSize: 15,
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
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View
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
            <Text style={{ fontSize: 20, color: COLORS.textPrimary }}>‹</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.textPrimary,
            }}
          >
            Order History
          </Text>

          <View style={{ width: 42 }} />
        </View>

        <Text
          style={{
            fontSize: 30,
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
            marginBottom: 20,
          }}
        >
          Track your recent furniture orders
        </Text>

        {loading ? (
          <View
            style={{
              paddingVertical: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primaryDark} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
              Loading orders...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text style={{ color: COLORS.danger, fontWeight: "700" }}>
              Error: {error}
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 28,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 24,
                backgroundColor: COLORS.secondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 34 }}>📦</Text>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No orders yet
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              Orders you place while signed in will appear here.
            </Text>

            <Pressable
              onPress={() => router.replace("/" as any)}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 22,
                paddingVertical: 13,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Start Shopping
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {orders.map((order) => {
              const statusStyles = getStatusStyles(order.status);

              return (
                <Pressable
                  key={order.id}
                  onPress={() =>
                    router.push({
                      pathname: "/order/[id]",
                      params: { id: order.id },
                    } as any)
                  }
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    padding: 16,
                    marginBottom: 14,
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
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
                        }}
                      >
                        {formatDate(order.created_at)}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: statusStyles.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color: statusStyles.text,
                          fontSize: 12,
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: COLORS.accent,
                      borderRadius: 16,
                      padding: 12,
                      marginBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.textSecondary,
                        marginBottom: 6,
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
                        fontSize: 13,
                        color: COLORS.textSecondary,
                        marginBottom: 6,
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
                          fontSize: 13,
                          color: COLORS.textSecondary,
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
                    ) : null}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                      Subtotal
                    </Text>
                    <Text
                      style={{
                        color: COLORS.textPrimary,
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      ₦{Number(order.subtotal).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                      Delivery Fee
                    </Text>
                    <Text
                      style={{
                        color: COLORS.textPrimary,
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      ₦{Number(order.delivery_fee).toLocaleString()}
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
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: COLORS.textPrimary,
                      }}
                    >
                      Total
                    </Text>

                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: COLORS.primaryDark,
                      }}
                    >
                      ₦{Number(order.total).toLocaleString()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
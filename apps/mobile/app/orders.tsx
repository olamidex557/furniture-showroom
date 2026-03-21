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
import { fetchOrders, type OrderHistoryItem } from "../src/lib/products";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function getStatusColors(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return { bg: "#dcfce7", text: "#15803d" };
    case "processing":
      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#b91c1c" };
    case "pending":
    default:
      return { bg: "#fef3c7", text: "#b45309" };
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOrders();
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
    loadOrders();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#e7e5e4",
          }}
        >
          <Text style={{ color: "#1c1917", fontWeight: "600" }}>Back</Text>
        </Pressable>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#1c1917",
            marginBottom: 6,
          }}
        >
          Order History
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#78716c",
            marginBottom: 20,
          }}
        >
          View your recent orders
        </Text>

        {loading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <ActivityIndicator size="large" color="#292524" />
            <Text style={{ marginTop: 12, color: "#57534e" }}>
              Loading orders...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#fecaca",
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#b91c1c",
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Something went wrong
            </Text>
            <Text style={{ color: "#991b1b" }}>{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "#e7e5e4",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1c1917",
                marginBottom: 6,
              }}
            >
              No orders yet
            </Text>
            <Text style={{ color: "#78716c" }}>
              Orders placed from checkout will appear here.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map((order) => {
              const colors = getStatusColors(order.status);

              return (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#e7e5e4",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#1c1917",
                          marginBottom: 4,
                        }}
                      >
                        Order #{order.id.slice(0, 8)}
                      </Text>

                      <Text
                        style={{
                          fontSize: 13,
                          color: "#78716c",
                        }}
                      >
                        {formatDate(order.created_at)}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: colors.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: "#57534e", marginBottom: 4 }}>
                    Delivery Method:{" "}
                    <Text style={{ color: "#1c1917", fontWeight: "600" }}>
                      {order.delivery_method}
                    </Text>
                  </Text>

                  <Text style={{ color: "#57534e", marginBottom: 4 }}>
                    Phone:{" "}
                    <Text style={{ color: "#1c1917", fontWeight: "600" }}>
                      {order.phone ?? "N/A"}
                    </Text>
                  </Text>

                  {order.delivery_method === "delivery" ? (
                    <Text style={{ color: "#57534e", marginBottom: 4 }}>
                      Address:{" "}
                      <Text style={{ color: "#1c1917", fontWeight: "600" }}>
                        {order.address ?? "N/A"}
                      </Text>
                    </Text>
                  ) : null}

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e7e5e4",
                      marginVertical: 12,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: "#57534e" }}>Subtotal</Text>
                    <Text style={{ color: "#1c1917", fontWeight: "600" }}>
                      ₦{Number(order.subtotal).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: "#57534e" }}>Delivery Fee</Text>
                    <Text style={{ color: "#1c1917", fontWeight: "600" }}>
                      ₦{Number(order.delivery_fee).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#1c1917",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      Total
                    </Text>
                    <Text
                      style={{
                        color: "#0f172a",
                        fontWeight: "700",
                        fontSize: 18,
                      }}
                    >
                      ₦{Number(order.total).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
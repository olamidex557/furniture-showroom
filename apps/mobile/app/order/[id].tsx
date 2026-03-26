import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "../../src/lib/supabase";
import { COLORS } from "../../src/constants/colors";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products: {
    name: string;
  }[];
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
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        if (!user || !id) return;
        setLoading(true);

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .eq("clerk_user_id", user.id)
          .single();

        if (orderError || !orderData) {
          setNotAllowed(true);
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
          .eq("order_id", id);

        if (itemsError) throw new Error(itemsError.message);

        setOrder(orderData as Order);
        setItems((itemsData ?? []) as OrderItem[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      if (!isSignedIn || !user) {
        setLoading(false);
        setNotAllowed(true);
      } else {
        loadOrderDetails();
      }
    }
  }, [id, isLoaded, isSignedIn, user]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={{ marginTop: 10 }}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notAllowed || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Order not found
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            You can only view your own orders.
          </Text>
          <Pressable
            onPress={() => router.replace("/orders" as any)}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "700" }}>
              Back to Orders
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: 20 }}>‹</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginLeft: 10,
              color: COLORS.textPrimary,
            }}
          >
            Order Details
          </Text>
        </View>

        <View
          style={{
            backgroundColor: COLORS.surface,
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              color: COLORS.textPrimary,
            }}
          >
            Order ID: {order.id.slice(0, 8)}
          </Text>

          <Text style={{ color: COLORS.textSecondary, marginBottom: 4 }}>
            Status:{" "}
            <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>
              {order.status}
            </Text>
          </Text>

          <Text style={{ color: COLORS.textSecondary, marginBottom: 4 }}>
            Method:{" "}
            <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>
              {order.delivery_method}
            </Text>
          </Text>

          <Text style={{ color: COLORS.textSecondary, marginBottom: 4 }}>
            Phone:{" "}
            <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>
              {order.phone ?? "N/A"}
            </Text>
          </Text>

          {order.delivery_method === "delivery" ? (
            <Text style={{ color: COLORS.textSecondary }}>
              Address:{" "}
              <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>
                {order.address ?? "N/A"}
              </Text>
            </Text>
          ) : null}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 10,
            color: COLORS.textPrimary,
          }}
        >
          Items
        </Text>

        {items.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: COLORS.surface,
              padding: 14,
              borderRadius: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              {item.products?.[0]?.name ?? "Product"}
            </Text>

            <Text style={{ color: COLORS.textSecondary }}>
              Qty: {item.quantity}
            </Text>

            <Text style={{ color: COLORS.textSecondary }}>
              Unit Price: ₦{Number(item.unit_price).toLocaleString()}
            </Text>

            <Text
              style={{
                fontWeight: "700",
                marginTop: 6,
                color: COLORS.primaryDark,
              }}
            >
              ₦{Number(item.line_total).toLocaleString()}
            </Text>
          </View>
        ))}

        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={{ color: COLORS.textSecondary, marginBottom: 4 }}>
            Subtotal: ₦{Number(order.subtotal).toLocaleString()}
          </Text>

          <Text style={{ color: COLORS.textSecondary, marginBottom: 4 }}>
            Delivery: ₦{Number(order.delivery_fee).toLocaleString()}
          </Text>

          <Text
            style={{
              marginTop: 10,
              fontWeight: "800",
              fontSize: 18,
              color: COLORS.textPrimary,
            }}
          >
            Total: ₦{Number(order.total).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
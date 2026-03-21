import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../src/context/CartContext";
import { fetchAppSettings } from "../src/lib/products";
import { supabase } from "../src/lib/supabase";

type DeliveryMethod = "delivery" | "pickup";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [pickupEnabled, setPickupEnabled] = useState(true);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        const settings = await fetchAppSettings();

        if (settings) {
          setDeliveryFee(Number(settings.delivery_fee ?? 0));
          setPickupEnabled(Boolean(settings.pickup_enabled));

          if (!settings.pickup_enabled) {
            setDeliveryMethod("delivery");
          }
        }
      } catch (error) {
        console.error("Failed to load app settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const finalDeliveryFee = useMemo(() => {
    return deliveryMethod === "delivery" ? deliveryFee : 0;
  }, [deliveryMethod, deliveryFee]);

  const total = useMemo(() => {
    return subtotal + finalDeliveryFee;
  }, [subtotal, finalDeliveryFee]);

  const placeOrder = async () => {
    try {
      if (items.length === 0) {
        Alert.alert("Cart is empty", "Add products before checking out.");
        return;
      }

      if (!phone.trim()) {
        Alert.alert("Missing phone number", "Please enter your phone number.");
        return;
      }

      if (deliveryMethod === "delivery" && !address.trim()) {
        Alert.alert("Missing address", "Please enter your delivery address.");
        return;
      }

      setPlacingOrder(true);

      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: null,
          subtotal,
          delivery_method: deliveryMethod,
          delivery_fee: finalDeliveryFee,
          total,
          status: "pending",
          address: deliveryMethod === "delivery" ? address.trim() : null,
          phone: phone.trim(),
        })
        .select("id")
        .single();

      if (orderError || !insertedOrder) {
        throw new Error(orderError?.message || "Failed to create order.");
      }

      const orderItemsPayload = items.map((item) => ({
        order_id: insertedOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (orderItemsError) {
        throw new Error(orderItemsError.message);
      }

      clearCart();

      Alert.alert(
        "Order placed",
        "Your order has been placed successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/" as any),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order.";
      Alert.alert("Checkout failed", message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingSettings) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#292524" />
          <Text style={{ marginTop: 12, color: "#57534e" }}>
            Loading checkout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#1c1917",
            marginBottom: 6,
          }}
        >
          Checkout
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#78716c",
            marginBottom: 20,
          }}
        >
          Complete your order details
        </Text>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#e7e5e4",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1c1917",
              marginBottom: 12,
            }}
          >
            Delivery Method
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => setDeliveryMethod("delivery")}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  deliveryMethod === "delivery" ? "#1c1917" : "#f5f5f4",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    deliveryMethod === "delivery" ? "#ffffff" : "#1c1917",
                  fontWeight: "600",
                }}
              >
                Delivery
              </Text>
            </Pressable>

            {pickupEnabled ? (
              <Pressable
                onPress={() => setDeliveryMethod("pickup")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor:
                    deliveryMethod === "pickup" ? "#1c1917" : "#f5f5f4",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: deliveryMethod === "pickup" ? "#ffffff" : "#1c1917",
                    fontWeight: "600",
                  }}
                >
                  Pickup
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#e7e5e4",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1c1917",
              marginBottom: 12,
            }}
          >
            Contact Details
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: "#d6d3d1",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
              marginBottom: deliveryMethod === "delivery" ? 12 : 0,
              backgroundColor: "#ffffff",
            }}
          />

          {deliveryMethod === "delivery" ? (
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#d6d3d1",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                minHeight: 100,
                backgroundColor: "#ffffff",
                textAlignVertical: "top",
              }}
            />
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#e7e5e4",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1c1917",
              marginBottom: 14,
            }}
          >
            Order Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#57534e" }}>Subtotal</Text>
            <Text style={{ color: "#1c1917", fontWeight: "600" }}>
              ₦{subtotal.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#57534e" }}>Delivery Fee</Text>
            <Text style={{ color: "#1c1917", fontWeight: "600" }}>
              ₦{finalDeliveryFee.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "#e7e5e4",
              marginVertical: 10,
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
              ₦{total.toLocaleString()}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={placeOrder}
          disabled={placingOrder || items.length === 0}
          style={{
            backgroundColor: "#1c1917",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: placingOrder || items.length === 0 ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("");
      setSuccessMessage("");

      if (items.length === 0) {
        setErrorMessage("Your cart is empty. Add products before checkout.");
        return;
      }

      if (!phone.trim()) {
        setErrorMessage("Please enter your phone number.");
        return;
      }

      if (deliveryMethod === "delivery" && !address.trim()) {
        setErrorMessage("Please enter your delivery address.");
        return;
      }

      setPlacingOrder(true);

      // 1. Validate stock before creating order
      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, name, stock, is_available")
          .eq("id", item.productId)
          .single();

        if (productError || !product) {
          throw new Error(
            productError?.message || `Unable to validate stock for ${item.name}.`
          );
        }

        if (!product.is_available) {
          throw new Error(`${product.name} is currently unavailable.`);
        }

        if (Number(product.stock) <= 0) {
          throw new Error(`${product.name} is out of stock.`);
        }

        if (item.quantity > Number(product.stock)) {
          throw new Error(
            `${product.name} quantity exceeds available stock. Only ${product.stock} left.`
          );
        }
      }

      // 2. Create order
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

      // 3. Create order items
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

      // 4. Reduce stock only
      // IMPORTANT: product remains visible even if stock becomes 0
      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, name, stock")
          .eq("id", item.productId)
          .single();

        if (productError || !product) {
          throw new Error(
            productError?.message || `Failed to fetch stock for ${item.name}.`
          );
        }

        const newStock = Number(product.stock) - Number(item.quantity);

        if (newStock < 0) {
          throw new Error(`Insufficient stock for ${product.name}.`);
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.productId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      // 5. Clear cart and show success
      clearCart();
      setSuccessMessage("Order successfully placed.");
      setPhone("");
      setAddress("");

      setTimeout(() => {
        router.replace("/" as any);
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order.";
      setErrorMessage(message);
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

        {!!successMessage && (
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderWidth: 1,
              borderColor: "#86EFAC",
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#166534",
                fontSize: 15,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              {successMessage}
            </Text>
          </View>
        )}

        {!!errorMessage && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderWidth: 1,
              borderColor: "#FCA5A5",
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#991B1B",
                fontSize: 15,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </Text>
          </View>
        )}

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
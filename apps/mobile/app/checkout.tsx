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
import { COLORS } from "../src/constants/colors";

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
      // Product remains visible even if stock becomes 0
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

      // 5. Clear cart and go to success screen
      clearCart();
      setPhone("");
      setAddress("");

      router.replace({
        pathname: "/checkout-success",
        params: { orderId: insertedOrder.id },
      } as any);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
            Loading checkout...
          </Text>
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
            Checkout
          </Text>

          <View style={{ width: 42 }} />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: COLORS.textPrimary,
            marginBottom: 6,
          }}
        >
          Complete Your Order
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            marginBottom: 20,
          }}
        >
          Enter your details to place your order
        </Text>

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
            backgroundColor: COLORS.surface,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.textPrimary,
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
                borderRadius: 14,
                backgroundColor:
                  deliveryMethod === "delivery"
                    ? COLORS.primary
                    : COLORS.accent,
                alignItems: "center",
                borderWidth: 1,
                borderColor:
                  deliveryMethod === "delivery"
                    ? COLORS.primary
                    : COLORS.border,
              }}
            >
              <Text
                style={{
                  color:
                    deliveryMethod === "delivery"
                      ? COLORS.white
                      : COLORS.textPrimary,
                  fontWeight: "700",
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
                  borderRadius: 14,
                  backgroundColor:
                    deliveryMethod === "pickup"
                      ? COLORS.primary
                      : COLORS.accent,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor:
                    deliveryMethod === "pickup"
                      ? COLORS.primary
                      : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color:
                      deliveryMethod === "pickup"
                        ? COLORS.white
                        : COLORS.textPrimary,
                    fontWeight: "700",
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
            backgroundColor: COLORS.surface,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 12,
            }}
          >
            Contact Details
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              marginBottom: deliveryMethod === "delivery" ? 12 : 0,
              backgroundColor: COLORS.background,
              color: COLORS.textPrimary,
            }}
          />

          {deliveryMethod === "delivery" ? (
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                minHeight: 100,
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
                textAlignVertical: "top",
              }}
            />
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.textPrimary,
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
            <Text style={{ color: COLORS.textSecondary }}>Subtotal</Text>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: "700",
              }}
            >
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
            <Text style={{ color: COLORS.textSecondary }}>Delivery Fee</Text>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: "700",
              }}
            >
              ₦{finalDeliveryFee.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
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
                color: COLORS.textPrimary,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Total
            </Text>
            <Text
              style={{
                color: COLORS.primaryDark,
                fontWeight: "800",
                fontSize: 20,
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
            backgroundColor:
              placingOrder || items.length === 0
                ? COLORS.border
                : COLORS.primary,
            borderRadius: 16,
            paddingVertical: 17,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color:
                placingOrder || items.length === 0
                  ? COLORS.textSecondary
                  : COLORS.white,
              fontSize: 16,
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
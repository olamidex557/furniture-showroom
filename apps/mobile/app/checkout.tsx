import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "../src/lib/supabase";
import { useCart } from "../src/context/CartContext";
import type { CartItem } from "../src/types/cart";
import { COLORS } from "../src/constants/colors";
import { sendInAppNotification } from "../src/lib/in-app-notifications";
import { fetchAppSettings } from "../src/lib/products";
import AnimatedScreen from "../src/components/AnimatedScreen";
import AnimatedCard from "../src/components/AnimatedCard";
import {
  createOrderDtoSchema,
  type CreateOrderDto,
} from "@furniture/shared/dto/order/create-order.dto";

type DeliveryMethod = "delivery" | "pickup";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  delivery_address: string | null;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { items, clearCart } = useCart();

  const cartItems: CartItem[] = items ?? [];

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [pickupEnabled, setPickupEnabled] = useState(true);

  const subtotal = useMemo(() => {
    return cartItems.reduce<number>((sum: number, item: CartItem) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);
  }, [cartItems]);

  const finalDeliveryFee = useMemo(() => {
    return deliveryMethod === "delivery" ? deliveryFee : 0;
  }, [deliveryMethod, deliveryFee]);

  const total = useMemo(() => {
    return subtotal + finalDeliveryFee;
  }, [subtotal, finalDeliveryFee]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchAppSettings();

        if (settings) {
          setDeliveryFee(Number(settings.delivery_fee ?? 0));
          setPickupEnabled(Boolean(settings.pickup_enabled));

          if (!settings.pickup_enabled) {
            setDeliveryMethod("delivery");
          }
        }
      } catch (error) {
        console.log("Failed to load app settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, delivery_address")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        const profile = (data as ProfileRow | null) ?? null;

        const fallbackName =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "";

        setCustomerName(profile?.full_name ?? fallbackName);
        setPhone(profile?.phone ?? "");
        setAddress(profile?.delivery_address ?? "");
      } catch (error) {
        console.log("Failed to load profile:", error);

        const fallbackName =
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          user?.username ||
          "";

        setCustomerName(fallbackName);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const buildOrderDto = (): CreateOrderDto => {
    return {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: deliveryMethod === "delivery" ? address.trim() : null,
      deliveryMethod,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    };
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);

      if (!isLoaded || !user || !isSignedIn) {
        Alert.alert("Error", "You must be signed in.");
        return;
      }

      const dtoCandidate = buildOrderDto();
      const parsed = createOrderDtoSchema.safeParse(dtoCandidate);

      if (!parsed.success) {
        const firstIssue =
          parsed.error.issues[0]?.message || "Invalid checkout data.";
        Alert.alert("Validation Error", firstIssue);
        return;
      }

      const dto = parsed.data;

      if (cartItems.length === 0) {
        Alert.alert("Cart empty", "Add items before checkout.");
        return;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          clerk_user_id: user.id,
          customer_name: dto.customerName,
          subtotal,
          delivery_fee: finalDeliveryFee,
          total,
          status: "pending",
          delivery_method: dto.deliveryMethod,
          phone: dto.phone,
          address: dto.deliveryMethod === "delivery" ? dto.address : null,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Failed to create order.");
      }

      for (const item of dto.items) {
        const cartItem = cartItems.find((cart) => cart.productId === item.productId);

        if (!cartItem) {
          throw new Error("Cart item not found during order creation.");
        }

        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: cartItem.price,
          line_total: Number(cartItem.price) * Number(item.quantity),
        });

        if (itemError) {
          throw new Error(itemError.message);
        }
      }

      try {
        await supabase.from("profiles").upsert(
          {
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            full_name: dto.customerName,
            phone: dto.phone,
            delivery_address:
              dto.deliveryMethod === "delivery" ? dto.address : address || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" }
        );
      } catch (error) {
        console.log("Profile save skipped:", error);
      }

      sendInAppNotification({
        title: "Order Placed 🎉",
        body: "Your order has been placed successfully.",
      });

      clearCart();
      router.replace("/checkout-success" as any);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Error", message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isLoaded || loadingProfile || loadingSettings) {
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
            Loading checkout...
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
                You need to sign in before placing an order.
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
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 8,
              }}
            >
              Checkout
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 18,
              }}
            >
              Confirm your details and place your order.
            </Text>
          </MotiView>

          <AnimatedCard
            delay={100}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 18,
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
          </AnimatedCard>

          <AnimatedCard
            delay={160}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 18,
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
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Full name"
              placeholderTextColor={COLORS.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                marginBottom: 12,
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            />

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
          </AnimatedCard>

          <AnimatedCard
            delay={220}
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
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 14,
              }}
            >
              Order Summary
            </Text>

            <Row label="Subtotal" value={`₦${subtotal.toLocaleString()}`} />
            <Row
              label="Delivery Fee"
              value={`₦${finalDeliveryFee.toLocaleString()}`}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.border,
                marginVertical: 10,
              }}
            />
            <Row label="Total" value={`₦${total.toLocaleString()}`} bold />
          </AnimatedCard>

          <MotiView
            from={{ opacity: 0, translateY: 18, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 380, delay: 280 }}
          >
            <Pressable
              onPress={handlePlaceOrder}
              disabled={placingOrder || cartItems.length === 0}
              style={{
                backgroundColor:
                  placingOrder || cartItems.length === 0
                    ? COLORS.border
                    : "#000000",
                borderRadius: 16,
                paddingVertical: 17,
                alignItems: "center",
              }}
            >
              {placingOrder ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color:
                      cartItems.length === 0 ? COLORS.textSecondary : "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Place Order
                </Text>
              )}
            </Pressable>
          </MotiView>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          color: COLORS.textSecondary,
          fontWeight: bold ? "700" : "400",
          fontSize: bold ? 16 : 14,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: COLORS.textPrimary,
          fontWeight: bold ? "800" : "700",
          fontSize: bold ? 18 : 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
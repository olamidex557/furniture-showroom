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
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../src/lib/supabase";
import { useCart } from "../src/context/CartContext";
import { COLORS } from "../src/constants/colors";
import AnimatedScreen from "../src/components/AnimatedScreen";
import AnimatedCard from "../src/components/AnimatedCard";
import {
  createOrderDtoSchema,
  type CreateOrderDto,
} from "@furniture/shared/dto/order/create-order.dto";
import {
  fetchActiveDeliveryZones,
  type DeliveryZone,
} from "../src/lib/delivery-zones";
import { saveDeliveryAddress } from "../src/lib/api/save-delivery-address";
import { initializePayment } from "../src/lib/api/initialize-payment";

type DeliveryMethod = "delivery" | "pickup";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  delivery_zone: string | null;
  street_address: string | null;
  landmark: string | null;
};

type LiveProductStock = {
  id: string;
  name: string;
  stock: number;
  is_available: boolean;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { items, syncStockSnapshot } = useCart();

  const cartItems = items;

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  const [savedZoneName, setSavedZoneName] = useState<string>("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  const pickupEnabled = true;

  const selectedZone = useMemo(() => {
    return deliveryZones.find((zone) => zone.id === selectedZoneId) ?? null;
  }, [deliveryZones, selectedZoneId]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);
  }, [cartItems]);

  const finalDeliveryFee = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    return Number(selectedZone?.fee ?? 0);
  }, [deliveryMethod, selectedZone]);

  const total = useMemo(() => {
    return subtotal + finalDeliveryFee;
  }, [subtotal, finalDeliveryFee]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zones = await fetchActiveDeliveryZones();
        setDeliveryZones(zones);

        if (zones.length > 0) {
          if (savedZoneName) {
            const matchedZone = zones.find(
              (zone) => zone.name.toLowerCase() === savedZoneName.toLowerCase()
            );

            if (matchedZone) {
              setSelectedZoneId(matchedZone.id);
            } else {
              setSelectedZoneId(zones[0].id);
            }
          } else {
            setSelectedZoneId(zones[0].id);
          }
        }
      } catch (error) {
        console.log("Failed to load delivery zones:", error);
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, [savedZoneName]);

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
          .select(
            "full_name, phone, delivery_zone, street_address, landmark"
          )
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
        setStreetAddress(profile?.street_address ?? "");
        setLandmark(profile?.landmark ?? "");
        setSavedZoneName(profile?.delivery_zone ?? "");
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

  const buildDeliveryAddress = () => {
    if (deliveryMethod !== "delivery") return null;

    return [
      selectedZone?.name ?? "",
      streetAddress.trim(),
      landmark.trim() ? `Landmark: ${landmark.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" — ");
  };

  const buildOrderDto = (): CreateOrderDto => {
    return {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: buildDeliveryAddress(),
      deliveryMethod,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    };
  };

  const validateLiveStock = async () => {
    const productIds = cartItems.map((item) => item.productId);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock, is_available")
      .in("id", productIds);

    if (error) {
      throw new Error(error.message);
    }

    const liveProducts = (data ?? []) as LiveProductStock[];

    syncStockSnapshot(liveProducts);

    for (const cartItem of cartItems) {
      const live = liveProducts.find(
        (product) => product.id === cartItem.productId
      );

      if (!live) {
        throw new Error(`${cartItem.name} could not be validated.`);
      }

      if (!live.is_available || Number(live.stock) <= 0) {
        throw new Error(`${live.name} is now out of stock.`);
      }

      if (cartItem.quantity > Number(live.stock)) {
        throw new Error(
          `${live.name} only has ${live.stock} item(s) left in stock.`
        );
      }
    }

    return liveProducts;
  };

  const handlePayNow = async () => {
    try {
      setPlacingOrder(true);

      if (!isLoaded || !user || !isSignedIn) {
        Alert.alert("Error", "You must be signed in.");
        return;
      }

      if (deliveryMethod === "delivery" && deliveryZones.length === 0) {
        Alert.alert(
          "Delivery unavailable",
          "No delivery zones are available at the moment."
        );
        return;
      }

      if (deliveryMethod === "delivery" && !selectedZone) {
        Alert.alert("Select location", "Please choose a delivery location.");
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

      await validateLiveStock();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          clerk_user_id: user.id,
          customer_name: dto.customerName,
          subtotal,
          delivery_fee: finalDeliveryFee,
          total,
          status: "pending",
          payment_status: "unpaid",
          delivery_method: dto.deliveryMethod,
          phone: dto.phone,
          address: dto.address,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Failed to create order.");
      }

      for (const item of dto.items) {
        const cartItem = cartItems.find(
          (cart) => cart.productId === item.productId
        );

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
        if (deliveryMethod === "delivery" && selectedZone) {
          await saveDeliveryAddress({
            clerkUserId: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            fullName: dto.customerName,
            phone: dto.phone,
            deliveryZone: selectedZone.name,
            streetAddress: streetAddress.trim(),
            landmark: landmark.trim() || null,
          });
        }
      } catch (error) {
        console.log("Profile save skipped:", error);
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.");
      }

      const payment = await initializePayment(order.id, token);
      await WebBrowser.openBrowserAsync(payment.authorization_url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Checkout", message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isLoaded || loadingProfile || loadingZones) {
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
                You need to sign in before paying for an order.
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
              Confirm your details and continue to payment.
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

          {deliveryMethod === "delivery" ? (
            <AnimatedCard
              delay={130}
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
                Delivery Location
              </Text>

              {deliveryZones.length === 0 ? (
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                >
                  No delivery zones are available at the moment.
                </Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {deliveryZones.map((zone) => {
                    const active = selectedZoneId === zone.id;

                    return (
                      <Pressable
                        key={zone.id}
                        onPress={() => setSelectedZoneId(zone.id)}
                        style={{
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: active ? COLORS.primary : COLORS.border,
                          backgroundColor: active
                            ? COLORS.accent
                            : COLORS.background,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "700",
                                color: COLORS.textPrimary,
                                marginBottom: 4,
                              }}
                            >
                              {zone.name}
                            </Text>

                            <Text
                              style={{
                                fontSize: 13,
                                color: COLORS.textSecondary,
                              }}
                            >
                              Delivery fee applies automatically
                            </Text>
                          </View>

                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "800",
                              color: COLORS.primaryDark,
                            }}
                          >
                            ₦{Number(zone.fee).toLocaleString()}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </AnimatedCard>
          ) : null}

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
              <>
                <TextInput
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder="Street address"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    minHeight: 90,
                    backgroundColor: COLORS.background,
                    color: COLORS.textPrimary,
                    textAlignVertical: "top",
                    marginBottom: 12,
                  }}
                />

                <TextInput
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="Nearest landmark (optional)"
                  placeholderTextColor={COLORS.textSecondary}
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    backgroundColor: COLORS.background,
                    color: COLORS.textPrimary,
                  }}
                />
              </>
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
              onPress={handlePayNow}
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
                  Pay Now
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
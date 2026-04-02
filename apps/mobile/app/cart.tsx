import { useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useCart } from "../src/context/CartContext";
import { COLORS } from "../src/constants/colors";
import { supabase } from "../src/lib/supabase";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    syncStockSnapshot,
  } = useCart();

  const cartItems = items;

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => {
    return sum + Number(item.quantity);
  }, 0);

  useEffect(() => {
    const syncCartStock = async () => {
      if (cartItems.length === 0) return;

      try {
        const ids = cartItems.map((item) => item.productId);

        const { data, error } = await supabase
          .from("products")
          .select("id, stock, is_available")
          .in("id", ids);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          syncStockSnapshot(data);
        }
      } catch (error) {
        console.log("Failed to sync cart stock:", error);
      }
    };

    syncCartStock();
  }, [cartItems.length, syncStockSnapshot]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          style={{ marginBottom: 18 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: COLORS.textPrimary,
              }}
            >
              My Cart
            </Text>

            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
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
          </View>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
            }}
          >
            {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
          </Text>
        </MotiView>

        {cartItems.length === 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 18, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 420 }}
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
              name="cart-outline"
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
              Your cart is empty
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
              Add products from the home page to start shopping.
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
                Continue Shopping
              </Text>
            </Pressable>
          </MotiView>
        ) : (
          <>
            {cartItems.map((item, index) => {
              const stock = Number(item.maxStock ?? item.stock ?? 0);
              const inStock = Boolean(item.isAvailable) && stock > 0;
              const imageUri = item.image ?? item.imageUrl ?? null;

              return (
                <MotiView
                  key={item.productId}
                  from={{ opacity: 0, translateX: -20, scale: 0.97 }}
                  animate={{ opacity: 1, translateX: 0, scale: 1 }}
                  transition={{
                    type: "timing",
                    duration: 350,
                    delay: index * 70,
                  }}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    padding: 16,
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: 16,
                        backgroundColor: COLORS.accent,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color={COLORS.textSecondary}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: COLORS.textPrimary,
                          marginBottom: 6,
                        }}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: COLORS.primaryDark,
                          marginBottom: 6,
                        }}
                      >
                        ₦{Number(item.price).toLocaleString()}
                      </Text>

                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: inStock ? "#166534" : "#B91C1C",
                          marginBottom: 10,
                        }}
                      >
                        {inStock ? `${stock} in stock` : "Out of stock"}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: COLORS.background,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            overflow: "hidden",
                          }}
                        >
                          <Pressable
                            onPress={() => decreaseQuantity(item.productId)}
                            style={({ pressed }) => ({
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              backgroundColor: pressed
                                ? COLORS.accent
                                : "transparent",
                              transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color={COLORS.textPrimary}
                            />
                          </Pressable>

                          <MotiView
                            key={`${item.productId}-${item.quantity}`}
                            from={{ scale: 0.88, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "timing", duration: 160 }}
                          >
                            <Text
                              style={{
                                minWidth: 36,
                                textAlign: "center",
                                fontWeight: "700",
                                color: COLORS.textPrimary,
                              }}
                            >
                              {item.quantity}
                            </Text>
                          </MotiView>

                          <Pressable
                            onPress={() => {
                              const result = increaseQuantity(item.productId);

                              if (!result.ok) {
                                Alert.alert(
                                  "Stock Limit",
                                  result.reason || "Unable to increase quantity."
                                );
                              }
                            }}
                            style={({ pressed }) => ({
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              backgroundColor: pressed
                                ? COLORS.accent
                                : "transparent",
                              transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={COLORS.textPrimary}
                            />
                          </Pressable>
                        </View>

                        <Pressable
                          onPress={() => removeItem(item.productId)}
                          style={({ pressed }) => ({
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: "#FEE2E2",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            opacity: pressed ? 0.9 : 1,
                          })}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#B91C1C"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </MotiView>
              );
            })}

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 280, type: "timing", duration: 380 }}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 18,
                marginTop: 4,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  Subtotal
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: COLORS.textPrimary,
                  }}
                >
                  ₦{subtotal.toLocaleString()}
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
                    fontSize: 16,
                    fontWeight: "700",
                    color: COLORS.textPrimary,
                  }}
                >
                  Total
                </Text>

                <MotiView
                  key={subtotal}
                  from={{ scale: 0.95, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "timing", duration: 180 }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: COLORS.primaryDark,
                    }}
                  >
                    ₦{subtotal.toLocaleString()}
                  </Text>
                </MotiView>
              </View>
            </MotiView>

            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1.03 }}
              transition={{
                loop: true,
                type: "timing",
                duration: 900,
              }}
            >
              <Pressable
                onPress={() => router.push("/checkout" as any)}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 16,
                  paddingVertical: 17,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Proceed to Checkout
                </Text>
              </Pressable>
            </MotiView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
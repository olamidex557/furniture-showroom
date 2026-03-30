import { Pressable, ScrollView, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useCart } from "../../src/context/CartContext";
import { COLORS } from "../../src/constants/colors";

export default function CartTabScreen() {
  const router = useRouter();
  const cart = useCart() as any;

  const items = cart.items ?? cart.cartItems ?? [];
  const increaseQuantity =
    cart.increaseQuantity ?? cart.incrementQuantity ?? (() => {});
  const decreaseQuantity =
    cart.decreaseQuantity ?? cart.decrementQuantity ?? (() => {});
  const removeItem = cart.removeItem ?? cart.removeFromCart ?? (() => {});

  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

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
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 6,
            }}
          >
            My Cart
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
            }}
          >
            Review your selected items before checkout
          </Text>
        </MotiView>

        {items.length === 0 ? (
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
            {items.map((item: any, index: number) => (
              <MotiView
                key={item.productId ?? item.id ?? index}
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
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
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
                        marginBottom: 12,
                      }}
                    >
                      ₦{Number(item.price).toLocaleString()}
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
                          onPress={() =>
                            decreaseQuantity(item.productId ?? item.id)
                          }
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
                          key={`${item.productId ?? item.id}-${item.quantity}`}
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
                          onPress={() =>
                            increaseQuantity(item.productId ?? item.id)
                          }
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
                        onPress={() => removeItem(item.productId ?? item.id)}
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
            ))}

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
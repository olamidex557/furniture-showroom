import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../src/context/CartContext";
import { COLORS } from "../src/constants/colors";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    subtotal,
    itemCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  const hasInvalidStock = items.some((item) => item.quantity > item.stock || item.stock <= 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: COLORS.primary,
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 22,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingRight: 8,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                ‹ Back
              </Text>
            </Pressable>

            <Text
              style={{
                color: COLORS.white,
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Furniture Store
            </Text>

            <View style={{ width: 56 }} />
          </View>
        </View>

        <View
          style={{
            marginTop: -10,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 30,
            minHeight: 600,
          }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: "700",
              color: COLORS.primaryDark,
              marginBottom: 8,
            }}
          >
            Shopping Cart
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 20,
            }}
          >
            {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
          </Text>

          {items.length === 0 ? (
            <View
              style={{
                marginTop: 20,
                backgroundColor: COLORS.card,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 28,
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 32,
                  backgroundColor: COLORS.chip,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 50 }}>🧺</Text>
              </View>

              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  color: COLORS.primaryDark,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Your Cart is Empty
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                  lineHeight: 24,
                  marginBottom: 22,
                }}
              >
                Add products to your cart to get started.
              </Text>

              <Pressable
                onPress={() => router.replace("/" as any)}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 26,
                  paddingVertical: 14,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Continue Shopping
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {hasInvalidStock && (
                <View
                  style={{
                    backgroundColor: "#FEE2E2",
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                    borderRadius: 18,
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
                    Some cart items exceed available stock or are out of stock.
                    Reduce quantity before checkout.
                  </Text>
                </View>
              )}

              <View style={{ marginBottom: 20 }}>
                {items.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const exceedsStock = item.quantity > item.stock && item.stock > 0;
                  const invalidItem = isOutOfStock || exceedsStock;

                  return (
                    <View
                      key={item.productId}
                      style={{
                        backgroundColor: COLORS.card,
                        borderRadius: 24,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: invalidItem ? "#FCA5A5" : COLORS.border,
                        marginBottom: 14,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 3,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={{
                              width: 96,
                              height: 96,
                              borderRadius: 18,
                              marginRight: 14,
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              width: 96,
                              height: 96,
                              borderRadius: 18,
                              marginRight: 14,
                              backgroundColor: COLORS.chip,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: COLORS.textSecondary }}>No image</Text>
                          </View>
                        )}

                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 17,
                              fontWeight: "700",
                              color: COLORS.primaryDark,
                              marginBottom: 6,
                            }}
                          >
                            {item.name}
                          </Text>

                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: COLORS.primaryDark,
                              marginBottom: 6,
                            }}
                          >
                            ₦{Number(item.price).toLocaleString()}
                          </Text>

                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: isOutOfStock ? "#991B1B" : "#2E7D32",
                              marginBottom: 10,
                            }}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : `In Stock (${item.stock})`}
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
                                backgroundColor: COLORS.surface,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                borderRadius: 14,
                                overflow: "hidden",
                              }}
                            >
                              <Pressable
                                onPress={() => decreaseQuantity(item.productId)}
                                style={{
                                  width: 42,
                                  height: 42,
                                  backgroundColor: COLORS.primary,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color: COLORS.white,
                                    fontSize: 24,
                                    fontWeight: "700",
                                  }}
                                >
                                  −
                                </Text>
                              </Pressable>

                              <Text
                                style={{
                                  minWidth: 42,
                                  textAlign: "center",
                                  fontSize: 18,
                                  fontWeight: "700",
                                  color: COLORS.primaryDark,
                                }}
                              >
                                {item.quantity}
                              </Text>

                              <Pressable
                                onPress={() => {
                                  if (item.quantity >= item.stock) return;
                                  increaseQuantity(item.productId);
                                }}
                                style={{
                                  width: 42,
                                  height: 42,
                                  backgroundColor:
                                    item.quantity >= item.stock
                                      ? COLORS.border
                                      : COLORS.primary,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color:
                                      item.quantity >= item.stock
                                        ? COLORS.textSecondary
                                        : COLORS.white,
                                    fontSize: 22,
                                    fontWeight: "700",
                                  }}
                                >
                                  +
                                </Text>
                              </Pressable>
                            </View>

                            <Pressable
                              onPress={() => removeFromCart(item.productId)}
                              style={{
                                marginLeft: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: COLORS.primaryDark,
                                  fontSize: 18,
                                  fontWeight: "700",
                                }}
                              >
                                🗑️
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {exceedsStock && (
                        <View
                          style={{
                            marginTop: 12,
                            backgroundColor: "#FEE2E2",
                            borderWidth: 1,
                            borderColor: "#FCA5A5",
                            borderRadius: 14,
                            padding: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: "#991B1B",
                              fontSize: 14,
                              fontWeight: "800",
                              textAlign: "center",
                            }}
                          >
                            Selected quantity exceeds available stock. Only {item.stock} left.
                          </Text>
                        </View>
                      )}

                      {isOutOfStock && (
                        <View
                          style={{
                            marginTop: 12,
                            backgroundColor: "#FEE2E2",
                            borderWidth: 1,
                            borderColor: "#FCA5A5",
                            borderRadius: 14,
                            padding: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: "#991B1B",
                              fontSize: 14,
                              fontWeight: "800",
                              textAlign: "center",
                            }}
                          >
                            This item is out of stock and cannot be checked out.
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: 28,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: COLORS.primaryDark,
                    marginBottom: 18,
                  }}
                >
                  Order Summary
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, color: COLORS.textPrimary }}>Subtotal</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: COLORS.primaryDark,
                    }}
                  >
                    ₦{subtotal.toLocaleString()}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, color: COLORS.textPrimary }}>
                    Delivery Fee
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: COLORS.primaryDark,
                    }}
                  >
                    ₦{deliveryFee.toLocaleString()}
                  </Text>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: COLORS.border,
                    marginVertical: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 18,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: COLORS.primaryDark,
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: COLORS.primaryDark,
                    }}
                  >
                    ₦{total.toLocaleString()}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    if (hasInvalidStock) return;
                    router.push("/checkout" as any);
                  }}
                  disabled={hasInvalidStock}
                  style={{
                    backgroundColor: hasInvalidStock
                      ? COLORS.border
                      : COLORS.primary,
                    borderRadius: 999,
                    paddingVertical: 18,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: hasInvalidStock ? COLORS.textSecondary : COLORS.white,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    Proceed to Checkout
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
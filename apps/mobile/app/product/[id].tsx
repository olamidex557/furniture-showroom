import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { fetchProductById } from "../../src/lib/products";
import type { Product } from "../../src/types/product";
import { useCart } from "../../src/context/CartContext";
import { productToCartItem } from "../../src/types/cart";
import { COLORS } from "../../src/constants/colors";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stockWarning, setStockWarning] = useState("");

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("Missing product ID.");
      }

      const result = await fetchProductById(id);

      if (!result) {
        throw new Error("Product not found.");
      }

      setProduct(result);
      setSelectedImageIndex(0);
      setQuantity(1);
      setStockWarning("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load product.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const selectedImage = useMemo(() => {
    if (!product) return null;
    return product.product_images?.[selectedImageIndex]?.image_url ?? null;
  }, [product, selectedImageIndex]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: COLORS.primaryDark,
              marginBottom: 8,
            }}
          >
            Product Details
          </Text>

          <Text style={{ color: COLORS.danger, marginBottom: 16 }}>
            {error ?? "Unable to load product."}
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: COLORS.primaryDark,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "700" }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isInStock = product.stock > 0;
  const images = product.product_images ?? [];

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
    setStockWarning("");
  };

  const increaseQty = () => {
    if (quantity >= product.stock) {
      setStockWarning(
        `Your selected quantity exceeds available stock. Only ${product.stock} item${product.stock === 1 ? "" : "s"} left.`
      );
      return;
    }

    setQuantity((prev) => prev + 1);
    setStockWarning("");
  };

  const handleAddToCart = () => {
    if (!isInStock) return;

    if (quantity > product.stock) {
      setStockWarning(
        `Your selected quantity exceeds available stock. Only ${product.stock} item${product.stock === 1 ? "" : "s"} left.`
      );
      return;
    }

    addToCart(productToCartItem(product), quantity);
    router.push("/cart" as Href);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: COLORS.primary,
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 18,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.14)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: 22,
                fontWeight: "600",
              }}
            >
              ‹
            </Text>
          </Pressable>

          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 28,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 300,
                borderRadius: 28,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: COLORS.white }}>No image</Text>
            </View>
          )}
        </View>

        <View
          style={{
            marginTop: -18,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 30,
            minHeight: 450,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: COLORS.primaryDark,
              marginBottom: 6,
            }}
          >
            {product.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 10,
            }}
          >
            {product.category}
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: COLORS.primaryDark,
              marginBottom: 16,
            }}
          >
            ₦{Number(product.price).toLocaleString()}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              marginBottom: 18,
              backgroundColor: isInStock ? "#E8F5E9" : "#EFE7DF",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: isInStock ? "#2E7D32" : COLORS.textSecondary,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {isInStock ? `In Stock (${product.stock})` : "Out of Stock"}
            </Text>
          </View>

          {images.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 18 }}
            >
              {images.map((image, index) => {
                const active = index === selectedImageIndex;

                return (
                  <Pressable
                    key={image.id}
                    onPress={() => setSelectedImageIndex(index)}
                    style={{
                      marginRight: 10,
                      borderRadius: 16,
                      padding: active ? 2 : 0,
                      backgroundColor: active ? COLORS.primary : "transparent",
                    }}
                  >
                    <Image
                      source={{ uri: image.image_url }}
                      style={{
                        width: 88,
                        height: 72,
                        borderRadius: 14,
                      }}
                      resizeMode="cover"
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: COLORS.primaryDark,
                marginBottom: 8,
              }}
            >
              Description
            </Text>

            <Text
              style={{
                fontSize: 15,
                lineHeight: 24,
                color: COLORS.textPrimary,
              }}
            >
              {product.description?.trim()
                ? product.description
                : "No description added yet."}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: COLORS.primaryDark,
                marginBottom: 8,
              }}
            >
              Dimensions
            </Text>

            <Text
              style={{
                fontSize: 15,
                lineHeight: 24,
                color: COLORS.textPrimary,
              }}
            >
              {product.dimensions?.trim()
                ? product.dimensions
                : "No dimensions provided."}
            </Text>
          </View>

          {!!stockWarning && (
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
                {stockWarning}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 8,
                height: 56,
              }}
            >
              <Pressable
                onPress={decreaseQty}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    color: COLORS.primaryDark,
                    fontWeight: "500",
                  }}
                >
                  −
                </Text>
              </Pressable>

              <Text
                style={{
                  minWidth: 36,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "700",
                  color: COLORS.primaryDark,
                }}
              >
                {quantity}
              </Text>

              <Pressable
                onPress={increaseQty}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: COLORS.primaryDark,
                    fontWeight: "500",
                  }}
                >
                  +
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleAddToCart}
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                borderRadius: 18,
                paddingVertical: 17,
                alignItems: "center",
                justifyContent: "center",
                opacity: isInStock ? 1 : 0.5,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
              }}
              disabled={!isInStock}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Add to Cart
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { fetchProductById } from "../../src/lib/products";
import { useCart } from "../../src/context/CartContext";
import { COLORS } from "../../src/constants/colors";
import type { Product } from "../../src/types/product";
import AnimatedScreen from "../../src/components/AnimatedScreen";
import AnimatedCard from "../../src/components/AnimatedCard";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { addItem, getItemQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        if (!params.id) return;

        const data = await fetchProductById(String(params.id));
        setProduct(data);
      } catch (error) {
        console.log("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  if (loading) {
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
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
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
                padding: 24,
                alignItems: "center",
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={44}
                color={COLORS.textSecondary}
              />

              <Text
                style={{
                  marginTop: 12,
                  fontSize: 22,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 6,
                }}
              >
                Product not found
              </Text>

              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 22,
                  marginBottom: 18,
                }}
              >
                We couldn’t load this product right now.
              </Text>

              <Pressable
                onPress={() => router.back()}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontWeight: "700",
                  }}
                >
                  Go Back
                </Text>
              </Pressable>
            </AnimatedCard>
          </View>
        </AnimatedScreen>
      </SafeAreaView>
    );
  }

  const imageUrl = product.product_images?.[0]?.image_url ?? null;
  const stock = Number(product.stock ?? 0);
  const isAvailable = Boolean(product.is_available ?? true);
  const inStock = isAvailable && stock > 0;
  const cartQty = getItemQuantity(product.id);

  const handleAddToCart = () => {
    const result = addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: imageUrl,
      maxStock: stock,
      isAvailable,
    });

    if (!result.ok) {
      Alert.alert("Stock Limit", result.reason || "Unable to add item.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AnimatedScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 36,
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 450 }}
            style={{
              height: 340,
              backgroundColor: COLORS.accent,
              position: "relative",
            }}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                resizeMode="cover"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={54}
                  color={COLORS.textSecondary}
                />
              </View>
            )}

            <View
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                right: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.92)",
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

              <MotiView
                from={{ opacity: 0.7, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 300, delay: 180 }}
                style={{
                  backgroundColor: inStock ? "#DCFCE7" : "#FEE2E2",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text
                  style={{
                    color: inStock ? "#166534" : "#B91C1C",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {inStock ? `${stock} left` : "Out of Stock"}
                </Text>
              </MotiView>
            </View>
          </MotiView>

          <View style={{ padding: 16 }}>
            <AnimatedCard
              delay={80}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 20,
                marginTop: -36,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  marginBottom: 8,
                }}
              >
                {product.category || "Uncategorized"}
              </Text>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 10,
                }}
              >
                {product.name}
              </Text>

              <MotiView
                from={{ opacity: 0.7, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 280, delay: 180 }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: COLORS.primaryDark,
                    marginBottom: 14,
                  }}
                >
                  ₦{Number(product.price).toLocaleString()}
                </Text>
              </MotiView>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 23,
                }}
              >
                {product.description || "No description available for this product yet."}
              </Text>
            </AnimatedCard>

            <AnimatedCard
              delay={150}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 20,
                marginTop: 16,
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
                Product Details
              </Text>

              <InfoRow label="Stock" value={String(stock)} />
              <InfoRow
                label="Already in cart"
                value={String(cartQty)}
              />
              <InfoRow
                label="Dimensions"
                value={product.dimensions || "Not specified"}
              />
            </AnimatedCard>

            <MotiView
              from={{ opacity: 0, translateY: 20, scale: 0.98 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 380, delay: 220 }}
              style={{ marginTop: 18 }}
            >
              <Pressable
                disabled={!inStock}
                onPress={handleAddToCart}
                style={{
                  backgroundColor: inStock ? COLORS.primary : COLORS.border,
                  borderRadius: 16,
                  paddingVertical: 17,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: inStock ? COLORS.white : COLORS.textSecondary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Text>
              </Pressable>
            </MotiView>
          </View>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: COLORS.textPrimary,
          maxWidth: "58%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
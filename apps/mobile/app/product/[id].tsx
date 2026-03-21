import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Pressable,
} from "react-native";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { fetchProductById } from "../../src/lib/products";
import type { Product } from "../../src/types/product";
import { useCart } from "../../src/context/CartContext";
import { productToCartItem } from "../../src/types/cart";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
        <StatusBar barStyle="dark-content" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#292524" />
          <Text style={{ marginTop: 12, color: "#57534e" }}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1c1917",
              marginBottom: 8,
            }}
          >
            Product Details
          </Text>
          <Text style={{ color: "#b91c1c", marginBottom: 16 }}>
            {error ?? "Unable to load product."}
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: "#1c1917",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = product.product_images?.[0]?.image_url ?? null;
  const isInStock = product.stock > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ padding: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginBottom: 16,
              alignSelf: "flex-start",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e7e5e4",
            }}
          >
            <Text style={{ color: "#1c1917", fontWeight: "600" }}>Back</Text>
          </Pressable>

          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={{
                width: "100%",
                height: 280,
                borderRadius: 20,
                marginBottom: 18,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 280,
                borderRadius: 20,
                marginBottom: 18,
                backgroundColor: "#f5f5f4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#78716c" }}>No image</Text>
            </View>
          )}

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: "#e7e5e4",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#1c1917",
                marginBottom: 6,
              }}
            >
              {product.name}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#78716c",
                marginBottom: 12,
              }}
            >
              {product.category}
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 16,
              }}
            >
              ₦{Number(product.price).toLocaleString()}
            </Text>

            <View
              style={{
                alignSelf: "flex-start",
                marginBottom: 16,
                backgroundColor: isInStock ? "#dcfce7" : "#e7e5e4",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: isInStock ? "#15803d" : "#57534e",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {isInStock ? `In Stock (${product.stock})` : "Out of Stock"}
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1c1917",
                  marginBottom: 6,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22,
                  color: "#44403c",
                }}
              >
                {product.description?.trim()
                  ? product.description
                  : "No description added yet."}
              </Text>
            </View>

            <View style={{ marginBottom: 22 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1c1917",
                  marginBottom: 6,
                }}
              >
                Dimensions
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#44403c",
                }}
              >
                {product.dimensions?.trim()
                  ? product.dimensions
                  : "No dimensions provided."}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                addToCart(productToCartItem(product));
                router.push("/cart" as Href);
              }}
              style={{
                backgroundColor: "#1c1917",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                opacity: isInStock ? 1 : 0.5,
              }}
              disabled={!isInStock}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 15,
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
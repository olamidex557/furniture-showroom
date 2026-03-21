import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { fetchProducts } from "../../src/lib/products";
import { ProductCard } from "../../src/components/ProductCard";
import type { Product } from "../../src/types/product";

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchProducts();
      setProducts(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 12,
            color: "#1c1917",
          }}
        >
          Furniture Store
        </Text>

        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#292524" />
            <Text style={{ marginTop: 12, color: "#57534e" }}>
              Loading products...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#fecaca",
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#b91c1c",
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Something went wrong
            </Text>
            <Text style={{ color: "#991b1b" }}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1c1917",
                marginBottom: 6,
              }}
            >
              No products available
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: "#78716c",
              }}
            >
              Products added from the admin dashboard will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  router.push(`/product/${item.id}` as Href)
                }
              />
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
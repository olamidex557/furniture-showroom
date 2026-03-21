import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchProducts } from "../../src/lib/products";
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
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#1c1917",
            }}
          >
            Furniture Store
          </Text>

          <Pressable
            onPress={() => router.push("/cart" as any)}
            style={{
              backgroundColor: "#1c1917",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Cart</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/orders" as any)}
          style={{
            alignSelf: "flex-start",
            marginBottom: 16,
            backgroundColor: "#292524",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>
            View Order History
          </Text>
        </Pressable>

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#292524" />
            <Text style={{ marginTop: 10, color: "#57534e" }}>
              Loading products...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              padding: 16,
              backgroundColor: "#fef2f2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <Text style={{ color: "#b91c1c", fontWeight: "600" }}>
              Error: {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const firstImage = item.product_images?.[0]?.image_url ?? null;

              return (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: item.id },
                    } as any)
                  }
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    marginBottom: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#e7e5e4",
                  }}
                >
                  {firstImage ? (
                    <Image
                      source={{ uri: firstImage }}
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 12,
                        marginBottom: 10,
                      }}
                      resizeMode="cover"
                    />
                  ) : null}

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#1c1917",
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "#78716c",
                      marginBottom: 6,
                    }}
                  >
                    {item.description ?? "No description available"}
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    ₦{Number(item.price).toLocaleString()}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
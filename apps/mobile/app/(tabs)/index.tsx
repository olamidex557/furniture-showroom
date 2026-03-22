import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchProducts } from "../../src/lib/products";
import type { Product } from "../../src/types/product";
import { COLORS } from "../../src/constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        products
          .map((item) => item.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    );

    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const renderProductCard = ({ item }: { item: Product }) => {
    const firstImage = item.product_images?.[0]?.image_url ?? null;
    const isOutOfStock = item.stock <= 0;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          } as any)
        }
        style={{
          width: "48.5%",
          backgroundColor: COLORS.card,
          borderRadius: 22,
          marginBottom: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: COLORS.border,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}
      >
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={{
              width: "100%",
              height: 150,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 150,
              backgroundColor: COLORS.chip,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: COLORS.textSecondary }}>No image</Text>
          </View>
        )}

        <View style={{ padding: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            {item.category}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: isOutOfStock ? "#FEE2E2" : "#E8F5E9",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: isOutOfStock ? "#991B1B" : "#2E7D32",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {isOutOfStock ? "Out of Stock" : `In Stock (${item.stock})`}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.primaryDark,
            }}
          >
            ₦{Number(item.price).toLocaleString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={loading || error || filteredProducts.length === 0 ? [] : filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 30,
        }}
        ListHeaderComponent={
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: COLORS.primaryDark,
                }}
              >
                Furniture Store
              </Text>

              <Pressable
                onPress={() => router.push("/cart" as any)}
                style={{
                  backgroundColor: COLORS.primaryDark,
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  Cart
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/orders" as any)}
              style={{
                alignSelf: "flex-start",
                marginBottom: 14,
                backgroundColor: COLORS.primary,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                View Order History
              </Text>
            </Pressable>

            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 16,
                paddingVertical: 2,
                marginBottom: 16,
              }}
            >
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products..."
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  height: 52,
                  fontSize: 15,
                  color: COLORS.textPrimary,
                }}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      backgroundColor: isActive
                        ? COLORS.primaryDark
                        : COLORS.chip,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 999,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: isActive
                        ? COLORS.primaryDark
                        : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive
                          ? COLORS.white
                          : COLORS.primaryDark,
                        fontWeight: "600",
                      }}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {loading ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color={COLORS.primaryDark} />
                <Text
                  style={{
                    marginTop: 12,
                    color: COLORS.textSecondary,
                  }}
                >
                  Loading products...
                </Text>
              </View>
            ) : error ? (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: COLORS.danger,
                    fontWeight: "600",
                  }}
                >
                  Error: {error}
                </Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 24,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    backgroundColor: COLORS.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: COLORS.white, fontSize: 28 }}>⌕</Text>
                </View>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: COLORS.primaryDark,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  No products found
                </Text>

                <Text
                  style={{
                    fontSize: 15,
                    color: COLORS.textSecondary,
                    textAlign: "center",
                    lineHeight: 22,
                    marginBottom: 18,
                  }}
                >
                  We couldn’t find any products that match your search.
                </Text>

                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  style={{
                    backgroundColor: COLORS.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 13,
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
                    Clear Filters
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={renderProductCard}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
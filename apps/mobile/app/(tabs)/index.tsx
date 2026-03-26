import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
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

const CATEGORY_META: Record<string, { icon: string }> = {
  Sofa: { icon: "🛋️" },
  Chair: { icon: "🪑" },
  Lamp: { icon: "💡" },
  Cupboard: { icon: "🗄️" },
  Table: { icon: "🪵" },
  Bed: { icon: "🛏️" },
};

type ProductTab = "All" | "Newest" | "Popular";

export default function HomeScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState<ProductTab>("All");

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

    return unique.slice(0, 8);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (query.length > 0) {
      result = result.filter((item) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.description ?? "").toLowerCase().includes(query)
        );
      });
    }

    if (selectedTab === "Newest") {
      result = result.sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });
    }

    if (selectedTab === "Popular") {
      result = result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedTab]);

  const featuredProduct = useMemo(() => {
    return products.find((item) => Number(item.stock) > 0) ?? products[0] ?? null;
  }, [products]);

  const renderProductCard = ({ item }: { item: Product }) => {
    const firstImage = item.product_images?.[0]?.image_url ?? null;
    const isOutOfStock = Number(item.stock) <= 0;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          } as any)
        }
        style={{
          width: "47.5%",
          backgroundColor: COLORS.surface,
          borderRadius: 22,
          marginBottom: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: COLORS.border,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }}
      >
        <View
          style={{
            position: "relative",
            backgroundColor: COLORS.accent,
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
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: COLORS.textSecondary }}>No image</Text>
            </View>
          )}

          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14 }}>♡</Text>
          </View>
        </View>

        <View style={{ padding: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            ₦{Number(item.price).toLocaleString()}
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isOutOfStock ? COLORS.danger : COLORS.success,
            }}
          >
            {isOutOfStock ? "Out of Stock" : `Available (${item.stock})`}
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
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View
              style={{
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 4,
                }}
              >
                Furniture Store
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                }}
              >
                Find the best furniture for your home
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 18,
                gap: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 52,
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>⌕</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Furniture"
                  placeholderTextColor={COLORS.textSecondary}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: COLORS.textPrimary,
                  }}
                />
              </View>

              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedTab("All");
                }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: COLORS.primaryDark,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                padding: 16,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                flexDirection: "row",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: COLORS.textPrimary,
                    marginBottom: 6,
                  }}
                >
                  New Collection
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 20,
                    color: COLORS.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  Discover beautifully crafted furniture for your home.
                </Text>

                <Pressable
                  onPress={() => {
                    if (featuredProduct) {
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: featuredProduct.id },
                      } as any);
                    }
                  }}
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: COLORS.primaryDark,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    Shop Now
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  width: 120,
                  height: 100,
                  borderRadius: 18,
                  overflow: "hidden",
                  backgroundColor: COLORS.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {featuredProduct?.product_images?.[0]?.image_url ? (
                  <Image
                    source={{ uri: featuredProduct.product_images[0].image_url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 38 }}>🪑</Text>
                )}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                }}
              >
                Category
              </Text>

              <Pressable onPress={() => setSelectedCategory("All")}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: COLORS.textSecondary,
                  }}
                >
                  See All
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 18 }}
            >
              <Pressable
                onPress={() => setSelectedCategory("All")}
                style={{
                  alignItems: "center",
                  marginRight: 18,
                  width: 74,
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor:
                      selectedCategory === "All" ? COLORS.primary : COLORS.chip,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      color:
                        selectedCategory === "All"
                          ? COLORS.white
                          : COLORS.primaryDark,
                    }}
                  >
                    🏠
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: COLORS.textPrimary,
                  }}
                >
                  All
                </Text>
              </Pressable>

              {categories.map((category) => {
                const active = selectedCategory === category;
                const icon = CATEGORY_META[category]?.icon ?? "🪑";

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      alignItems: "center",
                      marginRight: 18,
                      width: 74,
                    }}
                  >
                    <View
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 29,
                        backgroundColor: active ? COLORS.primary : COLORS.chip,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          color: active ? COLORS.white : COLORS.primaryDark,
                        }}
                      >
                        {icon}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                      }}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
              }}
            >
              {(["All", "Newest", "Popular"] as ProductTab[]).map((tab) => {
                const active = selectedTab === tab;

                return (
                  <Pressable
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    style={{
                      backgroundColor: active ? COLORS.primary : COLORS.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: active ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? COLORS.white : COLORS.textPrimary,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {loading ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color={COLORS.primaryDark} />
                <Text
                  style={{
                    marginTop: 12,
                    color: COLORS.textSecondary,
                  }}
                >
                  Loading furniture...
                </Text>
              </View>
            ) : error ? (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: COLORS.danger,
                    fontWeight: "700",
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
                  marginBottom: 16,
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
                  <Text style={{ color: COLORS.primaryDark, fontSize: 28 }}>
                    ⌕
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "700",
                    color: COLORS.textPrimary,
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
                    setSelectedTab("All");
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
      />
    </SafeAreaView>
  );
}
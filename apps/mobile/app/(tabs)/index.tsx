import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
import { fetchProducts } from "../../src/lib/products";
import { useCart } from "../../src/context/CartContext";
import { COLORS } from "../../src/constants/colors";
import type { Product } from "../../src/types/product";

function AnimatedProductCard({
  item,
  index,
  onAddToCart,
  onOpen,
}: {
  item: Product;
  index: number;
  onAddToCart: () => void;
  onOpen: () => void;
}) {
  const imageUrl = item.product_images?.[0]?.image_url ?? null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 22, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: "timing",
        duration: 420,
        delay: index * 70,
      }}
      style={{
        marginBottom: 16,
      }}
    >
      <Pressable
        onPress={onOpen}
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 210,
            backgroundColor: COLORS.accent,
            alignItems: "center",
            justifyContent: "center",
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
            <Text
              style={{
                color: COLORS.textSecondary,
                fontWeight: "600",
              }}
            >
              No image
            </Text>
          )}
        </View>

        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 17,
                fontWeight: "700",
                color: COLORS.textPrimary,
              }}
            >
              {item.name}
            </Text>

            <MotiView
              from={{ scale: 0.92, opacity: 0.75 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "timing", duration: 280, delay: 150 + index * 50 }}
              style={{
                backgroundColor: Number(item.stock) > 0 ? "#DCFCE7" : "#FEE2E2",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: Number(item.stock) > 0 ? "#166534" : "#B91C1C",
                  fontWeight: "700",
                  fontSize: 11,
                }}
              >
                {Number(item.stock) > 0 ? "In Stock" : "Out of Stock"}
              </Text>
            </MotiView>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 10,
            }}
          >
            {item.category || "Uncategorized"}
          </Text>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.primaryDark,
              marginBottom: 14,
            }}
          >
            ₦{Number(item.price).toLocaleString()}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <MotiView
              from={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 260, delay: 220 + index * 40 }}
              style={{ flex: 1 }}
            >
              <Pressable
                onPress={onOpen}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  paddingVertical: 13,
                  alignItems: "center",
                  backgroundColor: COLORS.background,
                }}
              >
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontWeight: "700",
                  }}
                >
                  View
                </Text>
              </Pressable>
            </MotiView>

            <MotiView
              from={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 260, delay: 260 + index * 40 }}
              style={{ flex: 1 }}
            >
              <Pressable
                onPress={onAddToCart}
                disabled={Number(item.stock) <= 0}
                style={{
                  borderRadius: 14,
                  paddingVertical: 13,
                  alignItems: "center",
                  backgroundColor:
                    Number(item.stock) > 0 ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color:
                      Number(item.stock) > 0
                        ? COLORS.white
                        : COLORS.textSecondary,
                    fontWeight: "700",
                  }}
                >
                  Add to Cart
                </Text>
              </Pressable>
            </MotiView>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const cart = useCart() as any;

  const addItem =
    cart.addItem ||
    cart.addToCart ||
    ((item: any) => {
      console.log("Add item handler missing", item);
    });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedProductName, setAddedProductName] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.log("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter((value): value is string => Boolean(value))
      )
    );

    return ["All", ...values];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ? true : product.category === activeCategory;

      const q = search.trim().toLowerCase();

      const matchesSearch =
        q.length === 0
          ? true
          : product.name.toLowerCase().includes(q) ||
            (product.category ?? "").toLowerCase().includes(q) ||
            (product.description ?? "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const handleAddToCart = (item: Product) => {
    addItem({
      productId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      image: item.product_images?.[0]?.image_url ?? null,
    });

    setAddedProductName(item.name);

    setTimeout(() => {
      setAddedProductName(null);
    }, 1600);
  };

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
            Loading products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AnimatePresence>
        {addedProductName ? (
          <MotiView
            key={addedProductName}
            from={{ opacity: 0, translateY: 30, scale: 0.94 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: 20, scale: 0.98 }}
            transition={{ type: "timing", duration: 260 }}
            style={{
              position: "absolute",
              bottom: 104,
              left: 16,
              right: 16,
              zIndex: 50,
              backgroundColor: "#111827",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 14,
              shadowColor: "#000",
              shadowOpacity: 0.16,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: 15,
                fontWeight: "800",
                marginBottom: 3,
              }}
            >
              Added to cart
            </Text>
            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 13,
              }}
            >
              {addedProductName}
            </Text>
          </MotiView>
        ) : null}
      </AnimatePresence>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18 }}>
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
                Discover
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                }}
              >
                Explore our latest furniture collection
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 360, delay: 80 }}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={COLORS.textSecondary}
                style={{ marginRight: 10 }}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search products"
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  flex: 1,
                  color: COLORS.textPrimary,
                  fontSize: 14,
                }}
              />
            </MotiView>

            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 10 }}
              renderItem={({ item, index }) => {
                const active = activeCategory === item;

                return (
                  <MotiView
                    from={{ opacity: 0, translateX: 10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{
                      type: "timing",
                      duration: 280,
                      delay: 120 + index * 40,
                    }}
                    style={{ marginRight: 10 }}
                  >
                    <Pressable
                      onPress={() => setActiveCategory(item)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 999,
                        backgroundColor: active ? COLORS.primary : COLORS.surface,
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
                        {item}
                      </Text>
                    </Pressable>
                  </MotiView>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 360 }}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="search-outline"
              size={40}
              color={COLORS.textSecondary}
            />
            <Text
              style={{
                marginTop: 12,
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 6,
              }}
            >
              No matching products
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 22,
              }}
            >
              Try another keyword or category.
            </Text>
          </MotiView>
        }
        renderItem={({ item, index }) => (
          <AnimatedProductCard
            item={item}
            index={index}
            onOpen={() => router.push(`/product/${item.id}` as any)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}
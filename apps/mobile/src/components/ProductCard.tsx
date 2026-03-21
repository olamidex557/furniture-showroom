import { Image, Pressable, Text, View } from "react-native";
import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const firstImage = product.product_images?.[0]?.image_url ?? null;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
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
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 180,
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: "#f5f5f4",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#78716c" }}>No image</Text>
        </View>
      )}

      <Text
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: "#1c1917",
          marginBottom: 4,
        }}
      >
        {product.name}
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: "#78716c",
          marginBottom: 8,
        }}
      >
        {product.category}
      </Text>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#0f172a",
        }}
      >
        ₦{Number(product.price).toLocaleString()}
      </Text>
    </Pressable>
  );
}
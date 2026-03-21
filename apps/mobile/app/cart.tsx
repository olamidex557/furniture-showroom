import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../src/context/CartContext";

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
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

                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: "#1c1917",
                        marginBottom: 6,
                    }}
                >
                    Cart
                </Text>

                <Text
                    style={{
                        fontSize: 14,
                        color: "#78716c",
                        marginBottom: 20,
                    }}
                >
                    {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
                </Text>

                {items.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: "#e7e5e4",
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
                            Your cart is empty
                        </Text>
                        <Text style={{ color: "#78716c" }}>
                            Add products from the store to see them here.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={{ gap: 12 }}>
                            {items.map((item) => (
                                <View
                                    key={item.productId}
                                    style={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: 16,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: "#e7e5e4",
                                    }}
                                >
                                    <View style={{ flexDirection: "row", gap: 12 }}>
                                        {item.imageUrl ? (
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                style={{
                                                    width: 84,
                                                    height: 84,
                                                    borderRadius: 12,
                                                }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 84,
                                                    height: 84,
                                                    borderRadius: 12,
                                                    backgroundColor: "#f5f5f4",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Text style={{ color: "#78716c", fontSize: 12 }}>
                                                    No image
                                                </Text>
                                            </View>
                                        )}

                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "600",
                                                    color: "#1c1917",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {item.name}
                                            </Text>

                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    color: "#78716c",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {item.category}
                                            </Text>

                                            <Text
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: "700",
                                                    color: "#0f172a",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                ₦{Number(item.price).toLocaleString()}
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
                                                        gap: 8,
                                                    }}
                                                >
                                                    <Pressable
                                                        onPress={() => decreaseQuantity(item.productId)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 10,
                                                            backgroundColor: "#f5f5f4",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 18, color: "#1c1917" }}>
                                                            −
                                                        </Text>
                                                    </Pressable>

                                                    <Text
                                                        style={{
                                                            minWidth: 20,
                                                            textAlign: "center",
                                                            fontWeight: "600",
                                                            color: "#1c1917",
                                                        }}
                                                    >
                                                        {item.quantity}
                                                    </Text>

                                                    <Pressable
                                                        onPress={() => increaseQuantity(item.productId)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 10,
                                                            backgroundColor: "#f5f5f4",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 18, color: "#1c1917" }}>
                                                            +
                                                        </Text>
                                                    </Pressable>
                                                </View>

                                                <Pressable onPress={() => removeFromCart(item.productId)}>
                                                    <Text
                                                        style={{
                                                            color: "#b91c1c",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        Remove
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View
                            style={{
                                marginTop: 20,
                                backgroundColor: "#ffffff",
                                borderRadius: 16,
                                padding: 18,
                                borderWidth: 1,
                                borderColor: "#e7e5e4",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "600",
                                        color: "#1c1917",
                                    }}
                                >
                                    Subtotal
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: "700",
                                        color: "#0f172a",
                                    }}
                                >
                                    ₦{subtotal.toLocaleString()}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => router.push("/checkout" as any)}
                                style={{
                                    backgroundColor: "#1c1917",
                                    borderRadius: 14,
                                    paddingVertical: 16,
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#ffffff",
                                        fontSize: 15,
                                        fontWeight: "700",
                                    }}
                                >
                                    Proceed to Checkout
                                </Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
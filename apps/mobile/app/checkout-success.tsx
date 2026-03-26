import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../src/constants/colors";

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flex: 1,
          padding: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 44 }}>✅</Text>
        </View>

        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            color: COLORS.textPrimary,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Order Placed!
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: COLORS.textSecondary,
            textAlign: "center",
            lineHeight: 23,
            marginBottom: 10,
          }}
        >
          Your order has been placed successfully and is now awaiting processing.
        </Text>

        {params.orderId ? (
          <Text
            style={{
              fontSize: 14,
              color: COLORS.primaryDark,
              fontWeight: "700",
              marginBottom: 28,
            }}
          >
            Order ID: {params.orderId}
          </Text>
        ) : (
          <View style={{ height: 28 }} />
        )}

        <Pressable
          onPress={() => router.replace("/orders" as any)}
          style={{
            width: "100%",
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            View My Orders
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/" as any)}
          style={{
            width: "100%",
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Continue Shopping
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
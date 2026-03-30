import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { COLORS } from "../src/constants/colors";
import AnimatedScreen from "../src/components/AnimatedScreen";

export default function CheckoutSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AnimatedScreen>
        <View
          style={{
            flex: 1,
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.7, rotate: "-12deg" }}
            animate={{ opacity: 1, scale: 1, rotate: "0deg" }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 120,
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Ionicons name="checkmark" size={56} color="#166534" />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 380, delay: 160 }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: COLORS.textPrimary,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Order Successful
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 420, delay: 240 }}
          >
            <Text
              style={{
                fontSize: 15,
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 24,
                maxWidth: 320,
                marginBottom: 26,
              }}
            >
              Your order has been placed successfully. You can follow updates in
              your orders page.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 380, delay: 320 }}
            style={{ width: "100%", maxWidth: 320 }}
          >
            <Pressable
              onPress={() => router.replace("/orders" as any)}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 16,
                paddingVertical: 17,
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
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 380, delay: 390 }}
            style={{ width: "100%", maxWidth: 320 }}
          >
            <Pressable
              onPress={() => router.replace("/(tabs)" as any)}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                paddingVertical: 17,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
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
          </MotiView>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
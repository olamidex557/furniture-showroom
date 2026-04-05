import { Stack, router } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import NotificationBanner from "../src/components/NotificationBanner";
import { CartProvider } from "../src/context/CartContext";

function NotificationBootstrap() {
  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {});

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          screen?: string;
          orderId?: string;
        };

        if (data?.screen === "order" && data.orderId) {
          router.push(`/order/${data.orderId}` as any);
        }
      }
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeAreaProvider>
        <CartProvider>
          <NotificationBootstrap />
          <NotificationBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 260,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: "fade",
              }}
            />

            <Stack.Screen
              name="product/[id]"
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="checkout"
              options={{
                animation: "slide_from_bottom",
              }}
            />

            <Stack.Screen
              name="checkout-success"
              options={{
                animation: "fade_from_bottom",
              }}
            />

            <Stack.Screen
              name="sign-in"
              options={{
                animation: "fade_from_bottom",
              }}
            />

            <Stack.Screen
              name="sign-up"
              options={{
                animation: "fade_from_bottom",
              }}
            />

            <Stack.Screen
              name="verify-email"
              options={{
                animation: "fade_from_bottom",
              }}
            />

            <Stack.Screen
              name="settings"
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="notifications"
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="help-support"
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="delivery-address"
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="orders"
              options={{
                animation: "slide_from_right",
              }}
            />
          </Stack>
        </CartProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
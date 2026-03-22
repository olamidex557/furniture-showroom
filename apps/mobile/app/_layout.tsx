import { Stack } from "expo-router";
import { AppClerkProvider } from "../src/providers/AppClerkProvider";
import { CartProvider } from "../src/context/CartContext";

export default function RootLayout() {
  return (
    <AppClerkProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="orders" options={{ headerShown: false }} />
          <Stack.Screen
            name="checkout-success"
            options={{ headerShown: false }}
          />
        </Stack>
      </CartProvider>
    </AppClerkProvider>
  );
}
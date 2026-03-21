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
          <Stack.Screen name="cart" options={{ title: "Cart" }} />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen name="orders" options={{ title: "Order History" }} />
        </Stack>
      </CartProvider>
    </AppClerkProvider>
  );
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "../types/cart";

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CART_STORAGE_KEY = "furniture-showroom-cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[];
          setItems(parsed);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (loading) return;

    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(
      (error) => {
        console.error("Failed to save cart:", error);
      }
    );
  }, [items, loading]);

  const addToCart = (item: CartItem) => {
    setItems((current) => {
      const existing = current.find((x) => x.productId === item.productId);

      if (existing) {
        return current.map((x) =>
          x.productId === item.productId
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }

      return [...current, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((x) => x.productId !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setItems((current) =>
      current.map((x) =>
        x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setItems((current) =>
      current.flatMap((x) => {
        if (x.productId !== productId) return [x];
        if (x.quantity <= 1) return [];
        return [{ ...x, quantity: x.quantity - 1 }];
      })
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return value;
}
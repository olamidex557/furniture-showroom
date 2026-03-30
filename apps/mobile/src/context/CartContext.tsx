"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type {
  AddToCartInput,
  AddToCartResult,
  CartContextValue,
  CartItem,
  StockSnapshotItem,
} from "../types/cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [items]);

  const addItem = (item: AddToCartInput): AddToCartResult => {
    const incomingQty = Math.max(1, Number(item.quantity ?? 1));
    const maxStock = Number(item.maxStock ?? 0);
    const isAvailable = item.isAvailable ?? true;

    if (!isAvailable || maxStock <= 0) {
      return { ok: false, reason: "This product is out of stock." };
    }

    let result: AddToCartResult = { ok: true };

    setItems((current) => {
      const existing = current.find(
        (cartItem) => cartItem.productId === item.productId
      );

      if (!existing) {
        if (incomingQty > maxStock) {
          result = {
            ok: false,
            reason: `Only ${maxStock} item(s) left in stock.`,
          };
          return current;
        }

        return [
          ...current,
          {
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: incomingQty,
            image: item.image ?? null,
            maxStock,
            isAvailable,
          },
        ];
      }

      const resolvedMaxStock = Number(existing.maxStock ?? maxStock);
      const nextQty = existing.quantity + incomingQty;

      if (nextQty > resolvedMaxStock) {
        result = {
          ok: false,
          reason: `You can only add up to ${resolvedMaxStock} item(s) for this product.`,
        };
        return current;
      }

      return current.map((cartItem) =>
        cartItem.productId === item.productId
          ? {
              ...cartItem,
              quantity: nextQty,
              maxStock: resolvedMaxStock,
              isAvailable,
            }
          : cartItem
      );
    });

    return result;
  };

  const increaseQuantity = (productId: string): AddToCartResult => {
    let result: AddToCartResult = { ok: true };

    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productId) return item;

        const maxStock = Number(item.maxStock ?? 0);

        if (!item.isAvailable || maxStock <= 0) {
          result = { ok: false, reason: "This product is out of stock." };
          return item;
        }

        if (item.quantity >= maxStock) {
          result = {
            ok: false,
            reason: `Only ${maxStock} item(s) available in stock.`,
          };
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );

    return result;
  };

  const decreaseQuantity = (productId: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string) => {
    return items.find((item) => item.productId === productId)?.quantity ?? 0;
  };

  const updateItemStock = (
    productId: string,
    stock: number,
    isAvailable = true
  ) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.productId !== productId) return item;

          const nextStock = Math.max(0, Number(stock));

          if (nextStock === 0 || !isAvailable) {
            return {
              ...item,
              maxStock: 0,
              isAvailable: false,
              quantity: 0,
            };
          }

          return {
            ...item,
            maxStock: nextStock,
            isAvailable,
            quantity: Math.min(item.quantity, nextStock),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const syncStockSnapshot = (products: StockSnapshotItem[]) => {
    setItems((current) =>
      current
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return item;

          const nextStock = Math.max(0, Number(product.stock));
          const nextAvailable = product.is_available ?? true;

          if (!nextAvailable || nextStock <= 0) {
            return {
              ...item,
              maxStock: 0,
              isAvailable: false,
              quantity: 0,
            };
          }

          return {
            ...item,
            maxStock: nextStock,
            isAvailable: nextAvailable,
            quantity: Math.min(item.quantity, nextStock),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const value: CartContextValue = {
    items,
    subtotal,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    updateItemStock,
    syncStockSnapshot,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return value;
}
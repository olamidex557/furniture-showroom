import type { Product } from "./product";

export type CartItem = {
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

export function productToCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    imageUrl: product.product_images?.[0]?.image_url ?? null,
    quantity: 1,
  };
}
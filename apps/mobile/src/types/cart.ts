export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  imageUrl?: string | null;
  maxStock?: number;
  stock?: number;

  isAvailable?: boolean;
  id?: string;
  category?: string | null;
};

export type AddToCartInput = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string | null;
  imageUrl?: string | null;
  maxStock?: number;
  stock?: number;
  isAvailable?: boolean;
  id?: string;
  category?: string | null;
};

export type StockSnapshotItem = {
  id: string;
  stock: number;
  is_available?: boolean;
};

export type AddToCartResult = {
  ok: boolean;
  reason?: string;
};

export type CartContextValue = {
  items: CartItem[];
  cartItems: CartItem[];

  subtotal: number;
  itemCount: number;

  addItem: (item: AddToCartInput) => AddToCartResult;
  addToCart: (item: AddToCartInput) => AddToCartResult;

  increaseQuantity: (productId: string) => AddToCartResult;
  incrementQuantity: (productId: string) => AddToCartResult;

  decreaseQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;

  removeItem: (productId: string) => void;
  removeFromCart: (productId: string) => void;

  clearCart: () => void;
  getItemQuantity: (productId: string) => number;

  updateItemStock: (
    productId: string,
    stock: number,
    isAvailable?: boolean
  ) => void;

  syncStockSnapshot: (products: StockSnapshotItem[]) => void;
};
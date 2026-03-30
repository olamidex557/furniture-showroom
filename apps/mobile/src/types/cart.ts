export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  maxStock?: number;
  isAvailable?: boolean;
};

export type AddToCartInput = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string | null;
  maxStock?: number;
  isAvailable?: boolean;
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
  subtotal: number;
  addItem: (item: AddToCartInput) => AddToCartResult;
  increaseQuantity: (productId: string) => AddToCartResult;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  updateItemStock: (
    productId: string,
    stock: number,
    isAvailable?: boolean
  ) => void;
  syncStockSnapshot: (products: StockSnapshotItem[]) => void;
};
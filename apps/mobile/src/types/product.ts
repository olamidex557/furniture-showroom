export type ProductImage = {
  id: string;
  image_url: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  dimensions: string | null;
  stock: number;
  is_available: boolean;
  product_images: ProductImage[];
};
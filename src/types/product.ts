// @/types/product.ts
export interface ProductImage {
  thumbnails: string[];
  previews: string[];
}

export interface Product {
  id: string;
  title: string; 
  reviews: number;
  price: number;
  discountedPrice: number | null;
  imgs: ProductImage; 
}
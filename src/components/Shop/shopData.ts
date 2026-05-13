// @/components/Shop/shopData.ts
import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
function mapBackendToProduct(item: any): Product {
  const previewImages = item.productImages?.map((img: any) => img.imageUrl) || [];
  const thumbnailImages = item.thumbnail ? [item.thumbnail] : [];

  return {
    id: item.id, 
    title: item.name,
    reviews: 0,
    price: parseFloat(item.price),
    discountedPrice: null,
    imgs: {
      thumbnails: thumbnailImages,
      previews: previewImages.length > 0 ? previewImages : thumbnailImages
    }
  };
}
export const getServerSideProducts = async (page: number = 1): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products?page=${page}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.map(mapBackendToProduct); // Map mảng data từ Backend
  } catch (error) {
    console.error("Failed to fetch products for server component:", error);
    return [];
  }
};
export const getClientSideProducts = async (page: number = 1) => {
  try {
    const res = await fetch(`${API_URL}/products?page=${page}`);
    const json = await res.json();
    return {
      data: json.data.map(mapBackendToProduct),
      totalPages: json.totalPages
    };
  } catch (error) {
    return { data: [], totalPages: 0 };
  }
};
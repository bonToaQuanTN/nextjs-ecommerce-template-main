import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Hàm map dữ liệu backend sang frontend
function mapBackendToProduct(item: any): Product {
  const previewImages = item.productImages?.map((img: any) => img.imageUrl) || [];
  const thumbnailImages = item.thumbnail ? [item.thumbnail] : [];

  return {
    id: item.id, 
    title: item.name,
    reviews: 0,
    price: parseFloat(item.price),
    discountedPrice: parseFloat(item.price) - (item.discount ? parseFloat(item.discount) : 0),
    imgs: {
      thumbnails: thumbnailImages,
      previews: previewImages.length > 0 ? previewImages : thumbnailImages
    }
  };
}

export const getClientSideCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) return [];
    
    const json = await res.json();
    console.log("Category API Response:", json);
    let categoriesArray = [];
    if (Array.isArray(json)) {
      categoriesArray = json;
    } else if (json && Array.isArray(json.data)) {
      categoriesArray = json.data; 
    } else if (json && typeof json === 'object') {
      const foundArray = Object.values(json).find(val => Array.isArray(val));
      if (foundArray) categoriesArray = foundArray;
    }

    return categoriesArray.map((cat: any) => ({ 
      id: cat.id, 
      name: cat.name 
    }));

  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

export const getClientSideProducts = async (page: number = 1, categoryId?: string | null) => {
  try {
    const params = new URLSearchParams({ page: String(page) });
    if (categoryId) {
      params.append('categoryId', categoryId);
    }

    const res = await fetch(`${API_URL}/products?${params.toString()}`);
    const json = await res.json();
    
    return {
      data: json.data.map(mapBackendToProduct),
      totalPages: json.totalPages
    };
  } catch (error) {
    return { data: [], totalPages: 0 };
  }
};

export const getServerSideProducts = async (page: number = 1): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products?page=${page}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.map(mapBackendToProduct); 
  } catch (error) {
    console.error("Failed to fetch products for server component:", error);
    return [];
  }
};
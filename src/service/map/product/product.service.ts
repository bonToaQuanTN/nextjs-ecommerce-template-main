import axiosInstance from '../../api-client';
import { Product } from '@/types/product';

export const getProductsFromAPI = async (page: number = 1): Promise<{ data: Product[], totalPages: number }> => {
  try {
    const response = await axiosInstance.get('/products', {
      params: { page }
    });

    const rawProducts = response.data.data;
    const mappedProducts: Product[] = rawProducts.map((item: any) => {
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
    });

    return {
      data: mappedProducts,
      totalPages: response.data.totalPages
    };

  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], totalPages: 0 }; 
  }
};
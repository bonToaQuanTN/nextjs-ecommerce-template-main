import axiosInstance from '../../api-client';

export const getMyCart = async () => {
  const res = await axiosInstance.get('/carts/my-cart');
  return res.data;
};
export const addToCart = async (cartId: string, productId: string, quantity: number) => {
  const res = await axiosInstance.post('/cart-items', { cartId, productId, quantity });
  return res.data;
};
export const processCheckout = async (shippingAddress: string, discountId?: string) => {
  const res = await axiosInstance.post('/orders/checkout', { 
    shippingAddress, 
    discountId
  });
  if (res.data.url) {
    window.location.href = res.data.url;
  }
  
  return res.data;
};
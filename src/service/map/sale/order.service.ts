import axiosInstance from '../../api-client';

export const getMyOrders = async (page: number = 1) => {
  const res = await axiosInstance.get('/orders', { params: { page } });
  return res.data;
};

export const getOrderDetail = async (orderId: string) => {
  const res = await axiosInstance.get(`/orders/${orderId}`);
  return res.data;
};
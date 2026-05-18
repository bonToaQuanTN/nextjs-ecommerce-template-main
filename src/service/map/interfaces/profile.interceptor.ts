import profileApi from '@/service/map/lib/profileApi';

// Lấy thông tin profile
export const getProfile = async () => {
  const response = await profileApi.get('/users/profile');
  return response.data;
};

// Cập nhật thông tin profile
export const updateProfile = async (payload: any) => {
  const response = await profileApi.put('/users/profile', payload);
  return response.data;
};
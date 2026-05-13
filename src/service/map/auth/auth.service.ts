import axiosInstance from '@/service/api-client';

export const login = async (email: string, password: string) => {
  const res = await axiosInstance.post('/user/login', { email, password });
  if (res.data.access_token) {
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
  }
  return res.data;
};

export const logout = async () => {
  try {
    await axiosInstance.post('/user/logout');
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
};
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tạo một instance riêng biệt cho Profile
const profileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
profileApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
profileApi.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.url?.includes('/users/profile') && response.data) {
      window.dispatchEvent(
        new CustomEvent('profile-updated', { 
          detail: response.data 
        })
      );
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default profileApi;
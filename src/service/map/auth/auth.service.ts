import axiosInstance from '@/service/api-client';
import {mapFormToCreateUserDto} from '@/service/map/utils/mapper/auth.mapper';
import { RegisterFormValues } from '@/service/map/interfaces/auth.interface';
import { setUser } from "@/redux/features/auth-slice"
import {store} from "@/redux/store";


export const login = async (email: string, password: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await axiosInstance.post(`${API_URL}/user/login`, { email, password });
    
    const { access_token, refresh_token } = res.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
    }
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    store.dispatch(setUser({ 
      id: payload.id, 
      email: payload.email, 
      role: payload.role 
    }));
    
    return res.data;
  } catch (error) {
    throw error;
  }
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

export const registerUser = async (formData: RegisterFormValues) => {
  try {
    const payload = mapFormToCreateUserDto(formData);
    const response = await axiosInstance.post('/user', payload);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    return response.data; 
  } catch (error) {
    throw error;
  }
};
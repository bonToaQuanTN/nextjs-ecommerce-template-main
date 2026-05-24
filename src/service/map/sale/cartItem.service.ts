// src/api/cartItemApi.ts

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Lấy token từ localStorage (hoặc từ Redux/store tùy cách bạn quản lý auth)
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessoken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CreateCartItemRequest {
  cartId: string;
  productId: string;
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// POST /cart-items
export const addCartItemApi = async (
  data: CreateCartItemRequest
): Promise<CartItemResponse> => {
  const response = await axios.post(`${API_BASE_URL}/cart-items`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// GET /cart-items/:cartId
export const getCartItemsApi = async (
  cartId: string
): Promise<CartItemResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/cart-items/${cartId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// PUT /cart-items/:id
export const updateCartItemApi = async (
  id: string,
  data: { quantity: number }
): Promise<CartItemResponse> => {
  const response = await axios.put(`${API_BASE_URL}/cart-items/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// DELETE /cart-items/:id
export const deleteCartItemApi = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/cart-items/${id}`, {
    headers: getAuthHeaders(),
  });
};
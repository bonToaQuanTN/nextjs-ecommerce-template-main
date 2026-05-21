import { getToken } from '@/service/map/lib/token';

const API_BASE = '/api';

const getAuthHeaders = (json = true) => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`
  };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

export const fetchCartFromDB = async () => {
  const token = getToken();
  if (!token) return []; 

  const res = await fetch(`${API_BASE}/carts/my-cart`, {
    headers: getAuthHeaders(false)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`fetchCart Error (${res.status}):`, errorText);
    throw new Error(`Failed to fetch cart: ${res.status}`);
  }

  const data = await res.json();
  return data.cartItems || [];
};

export const addItemToDB = async (productId: string, quantity: number, price: number) => {
  const token = getToken();
  if (!token) throw new Error('Chưa đăng nhập');
  const cartRes = await fetch(`${API_BASE}/carts/my-cart`, {
    headers: getAuthHeaders(false)
  });

  if (!cartRes.ok) {
    const errorText = await cartRes.text();
    console.error(`getCart Error (${cartRes.status}):`, errorText);
    throw new Error(`Không thể lấy thông tin giỏ hàng: ${cartRes.status}`);
  }

  const cartData = await cartRes.json();
  const realCartId = cartData.id;
  const res = await fetch(`${API_BASE}/cart-items`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      cartId: realCartId,
      productId,
      quantity,
      price
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`addItem Error (${res.status}):`, errorText);
    throw new Error(`Lỗi khi lưu sản phẩm vào giỏ hàng: ${res.status}`);
  }

  return await res.json();
};

export const updateItemInDB = async (cartItemId: string, quantity: number) => {
  const res = await fetch(`${API_BASE}/cart-items/${cartItemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ quantity })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`updateItem Error (${res.status}):`, errorText);
    throw new Error(`Lỗi cập nhật: ${res.status}`);
  }

  return res.json();
};

export const removeItemFromDB = async (cartItemId: string) => {
  const res = await fetch(`${API_BASE}/cart-items/${cartItemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`removeItem Error (${res.status}):`, errorText);
    throw new Error(`Lỗi xóa sản phẩm: ${res.status}`);
  }

  return res;
};
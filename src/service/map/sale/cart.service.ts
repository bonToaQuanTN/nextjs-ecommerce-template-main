
const API_BASE = '/api';
export const fetchCartFromDB = async () => {
  const res = await fetch(`${API_BASE}/carts/my-cart`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error (${res.status}):`, errorText);
    throw new Error(`Failed to fetch cart: ${res.statusText}`);
  }

  if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    return data.cartItems || [];
};

export const addItemToDB = async (productId: string, quantity: number, price: number) => {
  return fetch(`${API_BASE}/cart-items`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({ cartId: 'temp', productId, quantity, price }) 
  });
};

export const updateItemInDB = async (cartItemId: string, quantity: number) => {
  return fetch(`${API_BASE}/cart-items/${cartItemId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({ quantity })
  });
};

export const removeItemFromDB = async (cartItemId: string) => {
  return fetch(`${API_BASE}/cart-items/${cartItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
};
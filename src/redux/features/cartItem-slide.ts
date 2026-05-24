import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";
import { getToken } from "@/service/map/lib/token";

const API_BASE = "/api";

const getAuthHeaders = (json = true) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
};
export type CartItemLocal = Product & {
  quantity: number;
  cartItemId?: string; 
};

interface CartState {
  cartItems: CartItemLocal[];
  cartId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  cartId: null,
  loading: false,
  error: null,
};

export const fetchCartAsync = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const token = getToken();
      if (!token) return { cartItems: [], cartId: null };

      const res = await fetch(`${API_BASE}/carts/my-cart`, {
        headers: getAuthHeaders(false),
      });

      if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);

      const data = await res.json();
      
      // ✅ MAP dữ liệu backend sang CartItemLocal để UI hiển thị
      const mappedItems: CartItemLocal[] = (data.cartItems || []).map((ci: any) => ({
        id: ci.productId, 
        cartItemId: ci.id, 
        title: ci.product?.title || "Sản phẩm",
        price: ci.product?.price || ci.price,
        discountedPrice: ci.product?.discountedPrice || null,
        imgs: ci.product?.imgs || { previews: [] },
        quantity: ci.quantity,
        reviews: ci.product?.reviews || 0,
      }));

      return {
        cartItems: mappedItems,
        cartId: data.id || null,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addItemToCartAsync = createAsyncThunk(
  "cart/addItemToCartAsync",
  async (payload: { item: Product; quantity: number }, thunkAPI) => {
    try {
      const token = getToken();
      if (!token) return thunkAPI.rejectWithValue("Vui lòng đăng nhập");

      let realCartId = null;

      // Bước 1: Lấy cartId từ /carts/my-cart
      const cartRes = await fetch(`${API_BASE}/carts/my-cart`, {
        headers: getAuthHeaders(false),
      });

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        realCartId = cartData?.id || cartData?.data?.id || (Array.isArray(cartData) && cartData[0]?.id);
      } else if (cartRes.status !== 404) {
        const errText = await cartRes.text();
        throw new Error(`Không thể lấy thông tin giỏ hàng (${cartRes.status}): ${errText}`);
      }
      if (!realCartId) {
        const createCartRes = await fetch(`${API_BASE}/carts`, {
          method: "POST",
          headers: getAuthHeaders(true),
        });

        if (!createCartRes.ok) {
          const errText = await createCartRes.text();
          throw new Error(`Không thể tạo giỏ hàng mới: ${createCartRes.status} - ${errText}`);
        }

        const newCartData = await createCartRes.json();
        realCartId = newCartData?.id || newCartData?.data?.id; 
      }

      if (!realCartId) throw new Error("Lỗi hệ thống: Không xác định được ID giỏ hàng.");
      const res = await fetch(`${API_BASE}/cart-items`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          cartId: realCartId,
          productId: payload.item.id,
          quantity: payload.quantity,
          price: payload.item.discountedPrice ?? payload.item.price,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi khi lưu sản phẩm vào giỏ hàng: ${res.status} - ${errorText}`);
      }

      const serverCartItem = await res.json();
      const serverItemData = serverCartItem?.data || serverCartItem; 
      return {
        cartId: realCartId,
        serverCartItem: serverItemData,
        localItem: {
          ...payload.item,
          quantity: payload.quantity,
          cartItemId: serverItemData.id,
        },
      };
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || "Lỗi thêm vào giỏ hàng";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItemAsync",
  async (
    payload: { cartItemId: string; quantity: number },
    thunkAPI
  ) => {
    try {
      const res = await fetch(`${API_BASE}/cart-items/${payload.cartItemId}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ quantity: payload.quantity }),
      });

      if (!res.ok) throw new Error(`Lỗi cập nhật: ${res.status}`);

      const data = await res.json();
      return { cartItemId: payload.cartItemId, quantity: data.quantity };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const removeCartItemAsync = createAsyncThunk("cart/removeCartItemAsync",
  async (cartItemId: string, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE}/cart-items/${cartItemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) throw new Error(`Lỗi xóa sản phẩm: ${res.status}`);

      return cartItemId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItemLocal>) => {
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }
    },
    setCartId: (state, action: PayloadAction<string>) => {
      state.cartId = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId;
        state.cartItems = action.payload.cartItems;
      })
      .addCase(addItemToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.cartId && action.payload.cartId) {
          state.cartId = action.payload.cartId;
        }
        const { localItem } = action.payload;
        const existingItem = state.cartItems.find(
          (item) => item.id === localItem.id
        );
        if (existingItem) {
          existingItem.quantity += localItem.quantity;
        } else {
          state.cartItems.push(localItem);
        }
      })
      .addCase(addItemToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const { cartItemId, quantity } = action.payload;
        const item = state.cartItems.find((i) => i.cartItemId === cartItemId);
        if (item) item.quantity = quantity;
      })

      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(
          (item) => item.cartItemId !== action.payload
        );
      });
  },
});

export const selectTotalPrice = (state: any) => {
  const items = state.cart?.cartItems || state.cart?.items || [];
  
  return items.reduce((total: number, item: CartItemLocal) => {
    const price = item.discountedPrice ?? item.price ?? 0;
    return total + price * item.quantity;
  }, 0);
};



export const { addItemToCart, setCartId, clearCart, clearError } =
  cartSlice.actions;
export default cartSlice.reducer;

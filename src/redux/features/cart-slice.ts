import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { addItemToDB } from "@/service/map/sale/cart.service";

type CartItem = {
  id: string;
  productId?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
};

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ THÊM: Async Thunk — vừa lưu Redux vừa lưu DB
export const addItemToCartAsync = createAsyncThunk(
  'cart/addItemToCartAsync',
  async (item: CartItem, { rejectWithValue }) => {
    try {
      // Gọi API lưu vào database
      const result = await addItemToDB(
        item.productId || item.id,
        item.quantity,
        item.price
      );
      
      // Trả về item kèm cartItemId từ DB để xóa/sửa sau này
      return {
        ...item,
        dbCartItemId: result.id, // ID của cart item trong DB
      };
    } catch (error: any) {
      console.error('addItemToCartAsync error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, discountedPrice, imgs });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          // Lưu lại DB id nếu cần
          if (item.dbCartItemId) {
            (existingItem as any).dbCartItemId = item.dbCartItemId;
          }
        } else {
          state.items.push(item);
        }
      })
      .addCase(addItemToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectCartLoading = (state: RootState) => state.cartReducer.loading;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  setCartItems,
} = cart.actions;

export default cart.reducer;
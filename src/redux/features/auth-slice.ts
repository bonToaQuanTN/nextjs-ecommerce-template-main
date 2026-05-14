
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, 
  isAuthenticated: false, 
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false; 
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
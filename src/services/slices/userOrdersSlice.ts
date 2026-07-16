import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';

export const fetchUserOrders = createAsyncThunk(
  'userOrders/fetch',
  async () => {
    const orders = await getOrdersApi();
    return orders;
  }
);

interface IUserOrdersState {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: IUserOrdersState = {
  orders: [],
  loading: false,
  error: null
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки истории заказов';
      });
  }
});

export default userOrdersSlice.reducer;

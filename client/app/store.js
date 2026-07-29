import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import apiSlice from '../api/apiSlice';

// Import slices so their endpoints are injected into apiSlice before the
// store is created (injectEndpoints runs at module evaluation time).
import '../features/authSlice';
import '../features/userSlice';
import '../features/projectSlice';
import '../features/taskSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect
setupListeners(store.dispatch);

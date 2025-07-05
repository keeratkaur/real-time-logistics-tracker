import { configureStore } from '@reduxjs/toolkit';
import driversReducer from './driversSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    drivers: driversReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['drivers/updateDriverData'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.lastUpdated'],
        // Ignore these paths in the state
        ignoredPaths: ['drivers.lastUpdated'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Driver } from '../types/driver';

interface DriversState {
  drivers: Driver[];
  isConnected: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DriversState = {
  drivers: [],
  isConnected: false,
  error: null,
  lastUpdated: null,
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    updateDriverData: (state, action: PayloadAction<Driver[]>) => {
      state.drivers = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    updateDriverLocation: (state, action: PayloadAction<{ id: number; lat: number; lng: number }>) => {
      const { id, lat, lng } = action.payload;
      const driver = state.drivers.find(d => d.id === id);
      if (driver) {
        driver.lat = lat;
        driver.lng = lng;
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateDriverStatus: (state, action: PayloadAction<{ id: number; status: Driver['status'] }>) => {
      const { id, status } = action.payload;
      const driver = state.drivers.find(d => d.id === id);
      if (driver) {
        driver.status = status;
        state.lastUpdated = new Date().toISOString();
      }
    },
    setConnectionStatus: (state, action: PayloadAction<{ isConnected: boolean; error?: string | null }>) => {
      state.isConnected = action.payload.isConnected;
      state.error = action.payload.error || null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateDriverData,
  updateDriverLocation,
  updateDriverStatus,
  setConnectionStatus,
  clearError,
} = driversSlice.actions;

export default driversSlice.reducer; 
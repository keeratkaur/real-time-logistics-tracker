import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedDriverId: number | null;
  mapCenter: [number, number] | null;
  mapZoom: number;
}

const initialState: UIState = {
  selectedDriverId: null,
  mapCenter: null,
  mapZoom: 12,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectDriver: (state, action: PayloadAction<number | null>) => {
      state.selectedDriverId = action.payload;
    },
    setMapCenter: (state, action: PayloadAction<[number, number]>) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    clearSelection: (state) => {
      state.selectedDriverId = null;
    },
  },
});

export const {
  selectDriver,
  setMapCenter,
  setMapZoom,
  clearSelection,
} = uiSlice.actions;

export default uiSlice.reducer; 
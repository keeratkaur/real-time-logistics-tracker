import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Driver } from '../types/driver';

interface ActionHistoryItem {
  id: string;
  driverId: number;
  driverName: string;
  action: string;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

interface DriversState {
  drivers: Driver[];
  isConnected: boolean;
  error: string | null;
  lastUpdated: string | null;
  pendingActions: { [driverId: number]: { action: string; originalStatus: Driver['status']; retryCount: number } };
  actionHistory: ActionHistoryItem[];
  successMessage: string | null;
}

const initialState: DriversState = {
  drivers: [],
  isConnected: false,
  error: null,
  lastUpdated: null,
  pendingActions: {},
  actionHistory: [],
  successMessage: null,
};

// Simulate API call with random success/failure
const simulateApiCall = async (action: string, driverId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const successRate = 0.8; // 80% success rate
    const delay = Math.random() * 2000 + 500; // 500-2500ms delay
    
    setTimeout(() => {
      if (Math.random() < successRate) {
        console.log(`✅ ${action} successful for driver ${driverId}`);
        resolve();
      } else {
        console.log(`❌ ${action} failed for driver ${driverId}`);
        reject(new Error(`${action} failed for driver ${driverId}`));
      }
    }, delay);
  });
};

// Helper function to generate unique action ID
const generateActionId = () => `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to add action to history
const addToActionHistory = (state: DriversState, actionItem: Omit<ActionHistoryItem, 'id'>) => {
  const newAction: ActionHistoryItem = {
    ...actionItem,
    id: generateActionId(),
  };
  
  // Keep only last 50 actions
  state.actionHistory = [newAction, ...state.actionHistory.slice(0, 49)];
};

// Async thunk for pausing a driver
export const pauseDriver = createAsyncThunk(
  'drivers/pauseDriver',
  async (driverId: number, { rejectWithValue, getState }) => {
    try {
      await simulateApiCall('Pause Driver', driverId);
      return { driverId, newStatus: 'Paused' as const };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to pause driver');
    }
  }
);

// Async thunk for completing delivery
export const completeDelivery = createAsyncThunk(
  'drivers/completeDelivery',
  async (driverId: number, { rejectWithValue }) => {
    try {
      await simulateApiCall('Complete Delivery', driverId);
      return { driverId, newStatus: 'Idle' as const };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to complete delivery');
    }
  }
);

// Async thunk for reassigning driver
export const reassignDriver = createAsyncThunk(
  'drivers/reassignDriver',
  async (driverId: number, { rejectWithValue }) => {
    try {
      await simulateApiCall('Reassign Driver', driverId);
      return { driverId, newStatus: 'Delivering' as const };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reassign driver');
    }
  }
);

// Retry action thunk
export const retryAction = createAsyncThunk(
  'drivers/retryAction',
  async (driverId: number, { dispatch, getState }) => {
    const state = getState() as { drivers: DriversState };
    const pendingAction = state.drivers.pendingActions[driverId];
    
    if (!pendingAction) {
      throw new Error('No pending action found for this driver');
    }
    
    // Remove current pending action
    dispatch(clearPendingAction(driverId));
    
    // Retry the original action
    switch (pendingAction.action) {
      case 'pause':
        return dispatch(pauseDriver(driverId));
      case 'complete':
        return dispatch(completeDelivery(driverId));
      case 'reassign':
        return dispatch(reassignDriver(driverId));
      default:
        throw new Error('Unknown action type');
    }
  }
);

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
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearPendingAction: (state, action: PayloadAction<number>) => {
      delete state.pendingActions[action.payload];
    },
    clearActionHistory: (state) => {
      state.actionHistory = [];
    },
  },
  extraReducers: (builder) => {
    // Pause Driver
    builder
      .addCase(pauseDriver.pending, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        if (driver) {
          // Store original status for potential rollback
          state.pendingActions[driverId] = {
            action: 'pause',
            originalStatus: driver.status,
            retryCount: 0
          };
          // Optimistic update
          driver.status = 'Paused';
          state.error = null;
          
          // Add to action history
          addToActionHistory(state, {
            driverId,
            driverName: driver.name,
            action: 'Pause Driver',
            timestamp: new Date().toISOString(),
            status: 'pending'
          });
        }
      })
      .addCase(pauseDriver.fulfilled, (state, action) => {
        const { driverId } = action.payload;
        const driver = state.drivers.find(d => d.id === driverId);
        
        // Remove pending action tracking
        delete state.pendingActions[driverId];
        state.lastUpdated = new Date().toISOString();
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Pause Driver' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'success';
        }
        
        // Show success message
        if (driver) {
          state.successMessage = `✅ ${driver.name} has been paused successfully`;
        }
      })
      .addCase(pauseDriver.rejected, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        const pendingAction = state.pendingActions[driverId];
        
        if (driver && pendingAction) {
          // Increment retry count
          pendingAction.retryCount += 1;
          
          // If we've retried less than 3 times, keep the optimistic update
          if (pendingAction.retryCount < 3) {
            // Don't rollback, let user retry
            state.error = `Action failed, but you can retry. Attempt ${pendingAction.retryCount}/3`;
          } else {
            // Rollback to original status after 3 failed attempts
            driver.status = pendingAction.originalStatus;
            delete state.pendingActions[driverId];
            state.error = action.payload as string || 'Failed to pause driver after 3 attempts';
          }
        }
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Pause Driver' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'failed';
          historyItem.error = action.payload as string;
        }
      });

    // Complete Delivery
    builder
      .addCase(completeDelivery.pending, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        if (driver) {
          state.pendingActions[driverId] = {
            action: 'complete',
            originalStatus: driver.status,
            retryCount: 0
          };
          driver.status = 'Idle';
          state.error = null;
          
          // Add to action history
          addToActionHistory(state, {
            driverId,
            driverName: driver.name,
            action: 'Complete Delivery',
            timestamp: new Date().toISOString(),
            status: 'pending'
          });
        }
      })
      .addCase(completeDelivery.fulfilled, (state, action) => {
        const { driverId } = action.payload;
        const driver = state.drivers.find(d => d.id === driverId);
        
        delete state.pendingActions[driverId];
        state.lastUpdated = new Date().toISOString();
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Complete Delivery' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'success';
        }
        
        // Show success message
        if (driver) {
          state.successMessage = `✅ ${driver.name}'s delivery has been completed successfully`;
        }
      })
      .addCase(completeDelivery.rejected, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        const pendingAction = state.pendingActions[driverId];
        
        if (driver && pendingAction) {
          pendingAction.retryCount += 1;
          
          if (pendingAction.retryCount < 3) {
            state.error = `Action failed, but you can retry. Attempt ${pendingAction.retryCount}/3`;
          } else {
            driver.status = pendingAction.originalStatus;
            delete state.pendingActions[driverId];
            state.error = action.payload as string || 'Failed to complete delivery after 3 attempts';
          }
        }
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Complete Delivery' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'failed';
          historyItem.error = action.payload as string;
        }
      });

    // Reassign Driver
    builder
      .addCase(reassignDriver.pending, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        if (driver) {
          state.pendingActions[driverId] = {
            action: 'reassign',
            originalStatus: driver.status,
            retryCount: 0
          };
          driver.status = 'Delivering';
          state.error = null;
          
          // Add to action history
          addToActionHistory(state, {
            driverId,
            driverName: driver.name,
            action: 'Reassign Driver',
            timestamp: new Date().toISOString(),
            status: 'pending'
          });
        }
      })
      .addCase(reassignDriver.fulfilled, (state, action) => {
        const { driverId } = action.payload;
        const driver = state.drivers.find(d => d.id === driverId);
        
        delete state.pendingActions[driverId];
        state.lastUpdated = new Date().toISOString();
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Reassign Driver' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'success';
        }
        
        // Show success message
        if (driver) {
          state.successMessage = `✅ ${driver.name} has been reassigned successfully`;
        }
      })
      .addCase(reassignDriver.rejected, (state, action) => {
        const driverId = action.meta.arg;
        const driver = state.drivers.find(d => d.id === driverId);
        const pendingAction = state.pendingActions[driverId];
        
        if (driver && pendingAction) {
          pendingAction.retryCount += 1;
          
          if (pendingAction.retryCount < 3) {
            state.error = `Action failed, but you can retry. Attempt ${pendingAction.retryCount}/3`;
          } else {
            driver.status = pendingAction.originalStatus;
            delete state.pendingActions[driverId];
            state.error = action.payload as string || 'Failed to reassign driver after 3 attempts';
          }
        }
        
        // Update action history
        const historyItem = state.actionHistory.find(item => 
          item.driverId === driverId && item.action === 'Reassign Driver' && item.status === 'pending'
        );
        if (historyItem) {
          historyItem.status = 'failed';
          historyItem.error = action.payload as string;
        }
      });
  },
});

export const {
  updateDriverData,
  updateDriverLocation,
  updateDriverStatus,
  setConnectionStatus,
  clearError,
  clearSuccessMessage,
  clearPendingAction,
  clearActionHistory,
} = driversSlice.actions;

export default driversSlice.reducer; 
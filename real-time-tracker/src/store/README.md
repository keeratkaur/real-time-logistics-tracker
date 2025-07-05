# Redux Store Setup

This directory contains the Redux store configuration for the real-time logistics tracker.

## Structure

- `index.ts` - Main store configuration using `configureStore`
- `driversSlice.ts` - Redux slice for managing driver data
- `hooks.ts` - Typed Redux hooks for better TypeScript support

## Store State

The store contains a single slice for drivers with the following state:

```typescript
interface DriversState {
  drivers: Driver[];
  isConnected: boolean;
  error: string | null;
  lastUpdated: string | null;
}
```

## Actions

The drivers slice provides the following actions:

- `updateDriverData(drivers: Driver[])` - Updates the entire drivers array
- `updateDriverLocation({ id, lat, lng })` - Updates a specific driver's location
- `updateDriverStatus({ id, status })` - Updates a specific driver's status
- `setConnectionStatus({ isConnected, error? })` - Updates connection status
- `clearError()` - Clears any error state

## Usage

### In Components

```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateDriverData } from '../store/driversSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { drivers, isConnected } = useAppSelector(state => state.drivers);
  
  // Dispatch actions
  dispatch(updateDriverData(newDrivers));
}
```

### In Hooks

The `useWebSocket` hook now dispatches Redux actions instead of managing local state.

## Redux DevTools

Redux DevTools are enabled in development mode. You can install the browser extension to inspect state changes and action dispatches.

## TypeScript Support

All Redux hooks and actions are fully typed for better development experience. 
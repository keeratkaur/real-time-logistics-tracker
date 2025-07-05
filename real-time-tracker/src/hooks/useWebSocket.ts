import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateDriverData, setConnectionStatus } from '../store/driversSlice';
import { Driver, WebSocketMessage } from '../types/driver';

interface UseWebSocketReturn {
  drivers: Driver[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useWebSocket = (url: string = 'ws://localhost:8080'): UseWebSocketReturn => {
  const dispatch = useAppDispatch();
  const { drivers, isConnected, error } = useAppSelector(state => state.drivers);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      dispatch(setConnectionStatus({ isConnected: false, error: null }));
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to:', url);
        dispatch(setConnectionStatus({ isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          if (data.type === 'drivers') {
            dispatch(updateDriverData(data.drivers));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          dispatch(setConnectionStatus({ isConnected: false, error: 'Failed to parse message from server' }));
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        dispatch(setConnectionStatus({ isConnected: false }));
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        dispatch(setConnectionStatus({ isConnected: false, error: 'WebSocket connection error' }));
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      dispatch(setConnectionStatus({ isConnected: false, error: 'Failed to create WebSocket connection' }));
    }
  }, [url, dispatch]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    drivers,
    isConnected,
    error,
    reconnect
  };
}; 
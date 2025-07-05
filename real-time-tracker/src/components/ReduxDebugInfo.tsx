import React from 'react';
import { useAppSelector } from '../store/hooks';

export const ReduxDebugInfo: React.FC = () => {
  const { drivers, isConnected, error, lastUpdated } = useAppSelector(state => state.drivers);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Redux Debug Info</h4>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Drivers: {drivers.length}</div>
      <div>Error: {error || 'None'}</div>
      <div>Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</div>
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          Open Redux DevTools to see detailed state
        </div>
      )}
    </div>
  );
}; 
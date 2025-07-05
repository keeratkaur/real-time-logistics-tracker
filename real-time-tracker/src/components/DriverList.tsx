import React from 'react';
import { useAppSelector } from '../store/hooks';
import { DriverListItem } from './DriverListItem';

export const DriverList: React.FC = () => {
  const { drivers, isConnected } = useAppSelector(state => state.drivers);

  if (!isConnected) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔌</div>
        <div>Not connected to server</div>
        <div style={{ fontSize: '14px', marginTop: '4px' }}>
          Please check your connection and try again
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
        <div>No drivers available</div>
        <div style={{ fontSize: '14px', marginTop: '4px' }}>
          Waiting for driver data from server...
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#212529'
        }}>
          Active Drivers
        </h2>
        <div style={{
          backgroundColor: '#e9ecef',
          color: '#495057',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {drivers.length} {drivers.length === 1 ? 'driver' : 'drivers'}
        </div>
      </div>
      
      <div style={{
        maxHeight: '600px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        {drivers.map(driver => (
          <DriverListItem key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
}; 
import React from 'react';
import { useAppSelector } from '../store/hooks';
import { DriverList } from './DriverList';
import { Driver } from '../types/driver';

export const DashboardPanel: React.FC = () => {
  const { isConnected, error, drivers } = useAppSelector(state => state.drivers);
  const selectedDriverId = useAppSelector(state => state.ui.selectedDriverId);
  
  const selectedDriver = selectedDriverId 
    ? drivers.find(d => d.id === selectedDriverId) 
    : null;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      margin: '20px',
      minHeight: '500px',
      border: '1px solid #e9ecef'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e9ecef',
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '700',
          color: '#212529',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>🚛</span>
          Driver Dashboard
        </h1>
        
        {/* Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#28a745' : '#dc3545',
            animation: isConnected ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{
            fontSize: '14px',
            color: isConnected ? '#28a745' : '#dc3545',
            fontWeight: '500'
          }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {error && (
            <span style={{
              fontSize: '12px',
              color: '#dc3545',
              marginLeft: '8px'
            }}>
              ({error})
            </span>
          )}
        </div>
      </div>

      {/* Selected Driver Details */}
      {selectedDriver && (
        <div style={{
          backgroundColor: '#f8f9ff',
          border: '2px solid #007bff',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#007bff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📍</span>
            Selected Driver: {selectedDriver.name}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <strong>Status:</strong>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: selectedDriver.status === 'Delivering' ? '#28a745' : 
                                   selectedDriver.status === 'Paused' ? '#ffc107' : '#6c757d'
                }} />
                {selectedDriver.status}
              </div>
            </div>
            
            <div>
              <strong>Location:</strong>
              <div style={{ marginTop: '4px', fontFamily: 'monospace' }}>
                {selectedDriver.lat.toFixed(6)}, {selectedDriver.lng.toFixed(6)}
              </div>
            </div>
            
            {selectedDriver.eta && (
              <div>
                <strong>ETA:</strong>
                <div style={{ marginTop: '4px' }}>
                  {selectedDriver.eta}
                </div>
              </div>
            )}
            
            <div>
              <strong>Driver ID:</strong>
              <div style={{ marginTop: '4px' }}>
                #{selectedDriver.id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver List */}
      <DriverList />

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#6c757d'
        }}>
          Real-time updates via WebSocket • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}; 
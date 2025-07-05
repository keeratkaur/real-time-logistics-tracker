import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Driver } from '../types/driver';
import { selectDriver } from '../store/uiSlice';
import { RootState } from '../store';

interface DriverListItemProps {
  driver: Driver;
}

export const DriverListItem: React.FC<DriverListItemProps> = ({ driver }) => {
  const dispatch = useDispatch();
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriverId);
  
  const isSelected = selectedDriverId === driver.id;
  
  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'Delivering':
        return '#28a745';
      case 'Paused':
        return '#ffc107';
      case 'Idle':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status: Driver['status']) => {
    switch (status) {
      case 'Delivering':
        return '🚚';
      case 'Paused':
        return '⏸️';
      case 'Idle':
        return '💤';
      default:
        return '❓';
    }
  };

  const handleClick = () => {
    dispatch(selectDriver(isSelected ? null : driver.id));
  };

  return (
    <div
      style={{
        border: isSelected ? '2px solid #007bff' : '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: isSelected ? '#f8f9ff' : 'white',
        boxShadow: isSelected ? '0 4px 12px rgba(0,123,255,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#212529'
          }}>
            {driver.name}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{getStatusIcon(driver.status)}</span>
            <span style={{ 
              color: getStatusColor(driver.status),
              fontWeight: '500',
              fontSize: '14px'
            }}>
              {driver.status}
            </span>
          </div>
          
          {driver.eta && (
            <div style={{ 
              fontSize: '14px', 
              color: '#6c757d',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>🕒</span>
              <span>ETA: {driver.eta}</span>
            </div>
          )}
        </div>
        
        <div style={{ 
          textAlign: 'right',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          <div>ID: {driver.id}</div>
          <div style={{ marginTop: '4px' }}>
            {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}; 
import React from 'react';
import { Driver } from '../types/driver';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

interface DriverCardProps {
  driver: Driver;
}

export const DriverCard: React.FC<DriverCardProps> = ({ driver }) => {
  const { location, loading } = useReverseGeocode(driver.lat, driver.lng);

  return (
    <div className="driver-card">
      <div className="driver-card-header">
        <h3 className="driver-name">{driver.name}</h3>
        <span className={`driver-status ${driver.status.toLowerCase()}`}>{driver.status}</span>
      </div>
      <div className="driver-card-body">
        <div className="driver-info">
          <span className="info-label">ID:</span>
          <span className="info-value">{driver.id}</span>
        </div>
        <div className="driver-info">
          <span className="info-label">Location:</span>
          <span className="info-value">
            {loading ? 'Loading location...' : location || 'Unknown location'}
          </span>
        </div>
        {driver.eta && (
          <div className="driver-info">
            <span className="info-label">ETA:</span>
            <span className="info-value">{driver.eta}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 
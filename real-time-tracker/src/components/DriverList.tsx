import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { DriverListItem } from './DriverListItem';

export const DriverList: React.FC = () => {
  const { drivers, isConnected } = useAppSelector(state => state.drivers);

  // Pagination state
  const DRIVERS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(drivers.length / DRIVERS_PER_PAGE) || 1;
  const paginatedDrivers = drivers.slice((page - 1) * DRIVERS_PER_PAGE, page * DRIVERS_PER_PAGE);

  // Reset page if drivers change and current page is out of range
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [drivers.length, totalPages]);

  if (!isConnected) {
    return (
      <div className="connection-error">
        <div className="error-icon">🔌</div>
        <div className="error-title">Not connected to server</div>
        <div className="error-message">
          Please check your connection and try again
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-title">No drivers available</div>
        <div className="empty-message">
          Waiting for driver data from server...
        </div>
      </div>
    );
  }

  return (
    <div className="driver-list">
      <div className="driver-list-header">
        <h2 className="driver-list-title">
          Active Drivers
        </h2>
        <div className="driver-count">
          {drivers.length} {drivers.length === 1 ? 'driver' : 'drivers'}
        </div>
      </div>
      
      <div className="driver-list-content">
        {paginatedDrivers.map(driver => (
          <DriverListItem key={driver.id} driver={driver} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            ← Previous
          </button>
          <div className="pagination-info">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}; 
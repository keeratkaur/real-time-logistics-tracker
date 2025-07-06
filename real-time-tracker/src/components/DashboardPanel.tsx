import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { DriverList } from './DriverList';
import { clearError } from '../store/driversSlice';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { DriverCard } from './DriverCard';

export const DashboardPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isConnected, drivers, pendingActions } = useAppSelector(state => state.drivers);
  const selectedDriverId = useAppSelector(state => state.ui.selectedDriverId);
  
  const selectedDriver = selectedDriverId 
    ? drivers.find(d => d.id === selectedDriverId) 
    : null;

  // Tab state: 'driver' or 'dispatcher'
  const [activeTab, setActiveTab] = useState<'driver' | 'dispatcher'>('dispatcher');

  // Pagination state for Driver View
  const DRIVERS_PER_PAGE = 6;
  const [page, setPage] = React.useState(1);

  // Dropdown state for Driver View
  const [selectedDriverDropdown, setSelectedDriverDropdown] = React.useState<'all' | number>('all');
  // Filter and sort state
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'Delivering' | 'Paused' | 'Idle'>('all');
  const [sortOption, setSortOption] = React.useState<'id-asc' | 'id-desc' | 'name-asc' | 'name-desc'>('id-asc');
  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter and sort drivers before pagination
  let filteredDrivers = drivers;
  if (statusFilter !== 'all') {
    filteredDrivers = filteredDrivers.filter(d => d.status === statusFilter);
  }
  if (searchQuery.trim() !== '') {
    const query = searchQuery.trim().toLowerCase();
    filteredDrivers = filteredDrivers.filter(d =>
      d.name.toLowerCase().includes(query) || d.id.toString().includes(query)
    );
  }
  if (sortOption === 'id-asc') {
    filteredDrivers = [...filteredDrivers].sort((a, b) => a.id - b.id);
  } else if (sortOption === 'id-desc') {
    filteredDrivers = [...filteredDrivers].sort((a, b) => b.id - a.id);
  } else if (sortOption === 'name-asc') {
    filteredDrivers = [...filteredDrivers].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'name-desc') {
    filteredDrivers = [...filteredDrivers].sort((a, b) => b.name.localeCompare(a.name));
  }

  const totalPages = Math.ceil(filteredDrivers.length / DRIVERS_PER_PAGE) || 1;
  const paginatedDrivers = filteredDrivers.slice((page - 1) * DRIVERS_PER_PAGE, page * DRIVERS_PER_PAGE);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredDrivers.length, totalPages]);

  // For selectedDriver
  const selectedDriverLocation = useReverseGeocode(selectedDriver?.lat, selectedDriver?.lng);

  return (
    <div className="dashboard-panel">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Logistics Dashboard
        </h1>
        
        <div className="dashboard-stats">
          <div className="stat-item">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            <span className={`status-text ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-text">{drivers.length} Drivers</span>
          </div>
          
          {Object.keys(pendingActions).length > 0 && (
            <div className="stat-item">
              <span className="stat-icon pending">⏳</span>
              <span className="stat-text pending">
                {Object.keys(pendingActions).length} Pending Actions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('dispatcher')}
          className={`tab-button ${activeTab === 'dispatcher' ? 'active' : ''}`}
        >
          🎛️ Dispatcher View
        </button>
        
        <button
          onClick={() => setActiveTab('driver')}
          className={`tab-button ${activeTab === 'driver' ? 'active' : ''}`}
        >
          🚛 Driver View
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dispatcher' ? (
        <div className="tab-content">
          <h2 className="tab-title">Dispatcher View</h2>
          
          {/* Driver List */}
          <DriverList />
          
          {/* Selected Driver Details */}
          {selectedDriver && (
            <div className="selected-driver-card">
              <h3 className="selected-driver-title">
                🎯 Selected Driver: {selectedDriver.name}
              </h3>
              
              <div className="driver-details-grid">
                <div className="detail-item">
                  <strong>Status:</strong>
                  <div className="status-display">
                    <span className={`status-dot ${selectedDriver.status.toLowerCase()}`} />
                    <span className="status-text">{selectedDriver.status}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <strong>Location:</strong>
                  <div className="location-text">
                    {selectedDriverLocation.loading
                      ? 'Loading location...'
                      : selectedDriverLocation.location || 'Unknown location'}
                  </div>
                </div>
                {selectedDriver.eta && (
                  <div className="detail-item">
                    <strong>ETA:</strong>
                    <div>{selectedDriver.eta}</div>
                  </div>
                )}
                {selectedDriver.initialDestination && (
                  <div className="detail-item">
                    <strong>From:</strong>
                    <div>{selectedDriver.initialDestination.name}</div>
                  </div>
                )}
                {selectedDriver.finalDestination && (
                  <div className="detail-item">
                    <strong>To:</strong>
                    <div>{selectedDriver.finalDestination.name}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="tab-content">
          <h2 className="tab-title">Driver View</h2>
          
          {/* Controls */}
          <div className="controls-grid">
            {/* Search Bar */}
            <div className="control-item" style={{ minWidth: 200 }}>
              <label className="control-label">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                placeholder="Search by name or ID"
                className="control-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Driver Selection Dropdown */}
            <div className="control-item">
              <label className="control-label">Select Driver:</label>
              <select
                value={selectedDriverDropdown}
                onChange={(e) => setSelectedDriverDropdown(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="control-select"
              >
                <option value="all">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} (ID: {driver.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="control-item">
              <label className="control-label">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="control-select"
              >
                <option value="all">All Statuses</option>
                <option value="Delivering">Delivering</option>
                <option value="Paused">Paused</option>
                <option value="Idle">Idle</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="control-item">
              <label className="control-label">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="control-select"
              >
                <option value="id-asc">ID (Low to High)</option>
                <option value="id-desc">ID (High to Low)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span className="results-text">
              Showing {paginatedDrivers.length} of {filteredDrivers.length} drivers
            </span>
          </div>

          {/* Driver Grid */}
          <div className="driver-grid">
            {paginatedDrivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>

          {/* Pagination */}
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
      )}
      
      {/* Footer */}
      <div className="dashboard-footer">
        <p className="footer-text">
          Real-time updates via WebSocket • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
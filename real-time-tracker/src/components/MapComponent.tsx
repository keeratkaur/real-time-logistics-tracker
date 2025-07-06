import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Driver } from '../types/driver';
import { useAppSelector } from '../store/hooks';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds } from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons for different driver statuses
const createCustomIcon = (status: Driver['status'], isSelected: boolean = false, isPending: boolean = false) => {
  const color = status === 'Delivering' ? 'var(--success-500)' : 
                status === 'Paused' ? 'var(--warning-500)' : 'var(--gray-500)';
  
  const borderColor = isSelected ? 'var(--primary-500)' : isPending ? 'var(--warning-500)' : 'white';
  const borderWidth = isSelected ? '3px' : isPending ? '3px' : '2px';
  const size = isSelected ? '28px' : isPending ? '26px' : '20px';
  
  // Add pulsing animation for pending actions
  const animation = isPending ? 'enhanced-pulse-warning 1.5s infinite' : isSelected ? 'enhanced-pulse 2s infinite' : 'none';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size};
        height: ${size};
        background-color: ${color};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 50%;
        box-shadow: ${isSelected ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 
                     isPending ? '0 0 0 4px rgba(245, 158, 11, 0.4)' : '0 2px 4px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '14px' : isPending ? '12px' : '10px'};
        color: white;
        font-weight: bold;
        animation: ${animation};
        position: relative;
      ">
        🚛
        ${isPending ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: var(--warning-500); border-radius: 50%; border: 1px solid white;"></div>' : ''}
      </div>
    `,
    iconSize: isSelected ? [28, 28] : isPending ? [26, 26] : [20, 20],
    iconAnchor: isSelected ? [14, 14] : isPending ? [13, 13] : [10, 10],
  });
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate land-based route points to avoid crossing water
const generateLandRoute = (startLat: number, startLng: number, endLat: number, endLng: number): [number, number][] => {
  const points: [number, number][] = [];
  
  // Newfoundland and Labrador land boundaries (approximate)
  const nlBounds = {
    north: 60.5, // Northern Labrador
    south: 46.5, // Southern Newfoundland
    east: -52.0, // Eastern Newfoundland
    west: -67.5  // Western Labrador
  };
  
  // Check if both points are within Newfoundland and Labrador
  const isWithinNL = (lat: number, lng: number) => {
    return lat >= nlBounds.south && lat <= nlBounds.north && 
           lng >= nlBounds.west && lng <= nlBounds.east;
  };
  
  if (!isWithinNL(startLat, startLng) || !isWithinNL(endLat, endLng)) {
    // If points are outside NL, use direct route
    return [[startLat, startLng], [endLat, endLng]];
  }
  
  // Major land routes in Newfoundland and Labrador
  const majorRoutes: [number, number][] = [
    // Trans-Canada Highway (TCH) route points
    [47.5615, -52.7126], // St. John's
    [47.5189, -52.8058], // Mount Pearl
    [47.5667, -59.1500], // Channel-Port aux Basques
    [48.1500, -53.9667], // Clarenville
    [48.9500, -54.5500], // Gander
    [48.9500, -55.6500], // Grand Falls-Windsor
    [48.9500, -57.9500], // Corner Brook
    [49.1833, -57.4333], // Deer Lake
    [48.5500, -58.5500], // Stephenville
    [47.1667, -55.1667], // Marystown
    [52.9500, -66.9167], // Labrador City
    [53.3167, -60.3167]  // Happy Valley-Goose Bay
  ];
  
  // Find the closest major route points to start and end
  const findClosestRoutePoint = (lat: number, lng: number) => {
    let closest = majorRoutes[0];
    let minDistance = calculateDistance(lat, lng, closest[0], closest[1]);
    
    for (const routePoint of majorRoutes) {
      const distance = calculateDistance(lat, lng, routePoint[0], routePoint[1]);
      if (distance < minDistance) {
        minDistance = distance;
        closest = routePoint;
      }
    }
    return closest;
  };
  
  const startRoutePoint = findClosestRoutePoint(startLat, startLng);
  const endRoutePoint = findClosestRoutePoint(endLat, endLng);
  
  // Generate route through major highways
  points.push([startLat, startLng]);
  
  // Add intermediate points along major routes
  if (startRoutePoint !== endRoutePoint) {
    // Find route between major points
    const startIndex = majorRoutes.findIndex(p => p[0] === startRoutePoint[0] && p[1] === startRoutePoint[1]);
    const endIndex = majorRoutes.findIndex(p => p[0] === endRoutePoint[0] && p[1] === endRoutePoint[1]);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);
      
      // Add major route points between start and end
      for (let i = minIndex; i <= maxIndex; i++) {
        if (i !== startIndex) { // Don't duplicate start point
          points.push(majorRoutes[i]);
        }
      }
    }
  }
  
  points.push([endLat, endLng]);
  
  return points;
};

// Custom destination marker icons
const createDestinationIcon = (type: 'initial' | 'final') => {
  const color = type === 'initial' ? 'var(--primary-500)' : 'var(--success-500)';
  const icon = type === 'initial' ? '📍' : '🎯';
  
  return L.divIcon({
    className: 'destination-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        ${icon}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const drivers = useAppSelector((state) => state.drivers.drivers);
  const isConnected = useAppSelector((state) => state.drivers.isConnected);
  const selectedDriverId = useAppSelector((state) => state.ui.selectedDriverId);
  const pendingActions = useAppSelector((state) => state.drivers.pendingActions);

  // Minimize/maximize legend state
  const [legendMinimized, setLegendMinimized] = useState(false);
  // Maximize map state
  const [mapMaximized, setMapMaximized] = useState(false);

  // Add state for quick driver selector highlight
  const [hoveredDriverId, setHoveredDriverId] = useState<number | null>(null);

  // Fullscreen API handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === wrapperRef.current;
      setMapMaximized(isFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleMapMaximize = () => {
    if (!mapMaximized && wrapperRef.current) {
      wrapperRef.current.requestFullscreen();
    } else if (mapMaximized && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Calculate center point for the map (average of all driver positions)
  const mapCenter = useMemo(() => {
    if (drivers.length === 0) {
      return [53.23, -59.999167]; // Default to Newfoundland, Canada (central part)
    }
    
    const totalLat = drivers.reduce((sum: number, driver: Driver) => sum + driver.lat, 0);
    const totalLng = drivers.reduce((sum: number, driver: Driver) => sum + driver.lng, 0);
    
    return [totalLat / drivers.length, totalLng / drivers.length];
  }, [drivers]);

  // Fly to selected driver
  useEffect(() => {
    if (selectedDriverId && mapRef.current) {
      const selectedDriver = drivers.find(d => d.id === selectedDriverId);
      if (selectedDriver) {
        mapRef.current.flyTo([selectedDriver.lat, selectedDriver.lng], 15, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }
  }, [selectedDriverId, drivers]);

  // Trigger Leaflet map resize on maximize/minimize
  useEffect(() => {
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
  }, [mapMaximized]);

  // Fit to all drivers handler
  const handleFitToAllDrivers = () => {
    if (mapRef.current && drivers.length > 0) {
      const bounds = new LatLngBounds(
        drivers.map((driver) => [driver.lat, driver.lng] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  };

  return (
    <div ref={wrapperRef} className={`map-wrapper${mapMaximized ? ' maximized' : ''}`} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)', borderRadius: 16, border: '1.5px solid #e5e7eb', position: 'relative' }}>
      {/* Map Controls Overlay */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="map-maximize-btn"
          aria-label={mapMaximized ? 'Minimize map' : 'Maximize map'}
          onClick={handleMapMaximize}
          style={{ marginBottom: 8 }}
        >
          {mapMaximized ? '🗕' : '🗖'}
        </button>
        <button
          className="fit-all-btn"
          aria-label="Fit to all drivers"
          onClick={handleFitToAllDrivers}
          style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '4px 10px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          Fit to All Drivers
        </button>
      </div>
      {/* Connection status indicator - moved to top left below controls */}
      <div style={{ position: 'absolute', top: 70, left: 16, zIndex: 1001, background: 'rgba(255,255,255,0.92)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '4px 14px', fontWeight: 600, fontSize: 14, color: isConnected ? '#16a34a' : '#dc2626', border: isConnected ? '1.5px solid #bbf7d0' : '1.5px solid #fecaca', display: 'inline-block', minWidth: 90, textAlign: 'center' }}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      {/* Quick Driver Selector */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, width: 180, maxHeight: 320, overflowY: 'auto', background: 'rgba(255,255,255,0.97)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: '1px solid #e5e7eb', padding: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Drivers</div>
        {drivers.length === 0 ? (
          <div style={{ color: '#888', fontSize: 13 }}>No drivers</div>
        ) : (
          drivers.map(driver => (
            <div
              key={driver.id}
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.flyTo([driver.lat, driver.lng], 15, { duration: 1.2 });
                }
                // Optionally, dispatch selection
                // dispatch(setSelectedDriverId(driver.id));
              }}
              onMouseEnter={() => setHoveredDriverId(driver.id)}
              onMouseLeave={() => setHoveredDriverId(null)}
              style={{
                padding: '6px 8px',
                borderRadius: 7,
                background: driver.id === selectedDriverId ? 'var(--primary-100, #e0e7ff)' : hoveredDriverId === driver.id ? '#f3f4f6' : 'transparent',
                fontWeight: driver.id === selectedDriverId ? 700 : 500,
                color: driver.id === selectedDriverId ? 'var(--primary-700, #3730a3)' : '#222',
                cursor: 'pointer',
                marginBottom: 2,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: driver.id === selectedDriverId ? '1.5px solid var(--primary-400, #818cf8)' : '1px solid transparent',
                boxShadow: driver.id === selectedDriverId ? '0 1px 4px rgba(59,130,246,0.08)' : 'none',
                transition: 'background 0.15s, border 0.15s',
              }}
            >
              <span style={{ fontSize: 16, marginRight: 4 }}>🚛</span>
              <span>{driver.name} <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>(ID: {driver.id})</span></span>
            </div>
          ))
        )}
      </div>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={12}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {drivers.map((driver) => {
          const isPending = pendingActions[driver.id] !== undefined;
          return (
            <React.Fragment key={driver.id}>
              {/* Driver Marker */}
              <Marker
                position={[driver.lat, driver.lng]}
                icon={createCustomIcon(driver.status, driver.id === selectedDriverId, isPending)}
              >
                <Popup className="map-popup">
                  <div className="popup-content">
                    <h3 className="popup-title">{driver.name}</h3>
                    <div className="popup-info">
                      <p><strong>Status:</strong> {driver.status}</p>
                      {isPending && <p className="pending-info">⏳ Action in progress...</p>}
                      <p><strong>Location:</strong> {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</p>
                      {driver.eta && <p><strong>ETA:</strong> {driver.eta}</p>}
                      {driver.initialDestination && (
                        <p><strong>From:</strong> {driver.initialDestination.name}</p>
                      )}
                      {driver.finalDestination && (
                        <p><strong>To:</strong> {driver.finalDestination.name}</p>
                      )}
                      {driver.initialDestination && driver.finalDestination && (
                        <div className="route-info">
                          <p className="route-distance">
                            <strong>Land Route Distance:</strong> {(() => {
                              const routePoints = generateLandRoute(
                                driver.initialDestination.lat,
                                driver.initialDestination.lng,
                                driver.finalDestination.lat,
                                driver.finalDestination.lng
                              );
                              let totalDistance = 0;
                              for (let i = 1; i < routePoints.length; i++) {
                                totalDistance += calculateDistance(
                                  routePoints[i-1][0], routePoints[i-1][1],
                                  routePoints[i][0], routePoints[i][1]
                                );
                              }
                              return totalDistance.toFixed(1);
                            })()} km
                          </p>
                          <p className="route-progress">
                            <strong>Current Progress:</strong> {(() => {
                              const remainingRoute = generateLandRoute(
                                driver.lat, driver.lng,
                                driver.finalDestination.lat, driver.finalDestination.lng
                              );
                              const totalRoute = generateLandRoute(
                                driver.initialDestination.lat, driver.initialDestination.lng,
                                driver.finalDestination.lat, driver.finalDestination.lng
                              );
                              
                              let remainingDistance = 0;
                              for (let i = 1; i < remainingRoute.length; i++) {
                                remainingDistance += calculateDistance(
                                  remainingRoute[i-1][0], remainingRoute[i-1][1],
                                  remainingRoute[i][0], remainingRoute[i][1]
                                );
                              }
                              
                              let totalDistance = 0;
                              for (let i = 1; i < totalRoute.length; i++) {
                                totalDistance += calculateDistance(
                                  totalRoute[i-1][0], totalRoute[i-1][1],
                                  totalRoute[i][0], totalRoute[i][1]
                                );
                              }
                              
                              return ((totalDistance - remainingDistance) / totalDistance * 100).toFixed(0);
                            })()}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Initial Destination Marker */}
              {driver.initialDestination && (
                <Marker
                  position={[driver.initialDestination.lat, driver.initialDestination.lng]}
                  icon={createDestinationIcon('initial')}
                >
                  <Popup className="map-popup">
                    <div className="popup-content">
                      <h4 className="popup-title">📍 Initial Destination</h4>
                      <div className="popup-info">
                        <p><strong>Location:</strong> {driver.initialDestination.name}</p>
                        <p><strong>Address:</strong> {driver.initialDestination.address}</p>
                        <p><strong>Driver:</strong> {driver.name}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Final Destination Marker */}
              {driver.finalDestination && (
                <Marker
                  position={[driver.finalDestination.lat, driver.finalDestination.lng]}
                  icon={createDestinationIcon('final')}
                >
                  <Popup className="map-popup">
                    <div className="popup-content">
                      <h4 className="popup-title">🎯 Final Destination</h4>
                      <div className="popup-info">
                        <p><strong>Location:</strong> {driver.finalDestination.name}</p>
                        <p><strong>Address:</strong> {driver.finalDestination.address}</p>
                        <p><strong>Driver:</strong> {driver.name}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Route Path */}
              {driver.initialDestination && driver.finalDestination && (
                <>
                  {/* Land-based route from initial to final destination */}
                  <Polyline
                    positions={generateLandRoute(
                      driver.initialDestination.lat,
                      driver.initialDestination.lng,
                      driver.finalDestination.lat,
                      driver.finalDestination.lng
                    )}
                    color={driver.id === selectedDriverId ? 'var(--primary-500)' : 'var(--gray-500)'}
                    weight={driver.id === selectedDriverId ? 4 : 2}
                    opacity={driver.id === selectedDriverId ? 0.8 : 0.5}
                    dashArray={driver.id === selectedDriverId ? '10, 5' : '5, 5'}
                  />
                  
                  {/* Current driver position to final destination */}
                  <Polyline
                    positions={generateLandRoute(
                      driver.lat,
                      driver.lng,
                      driver.finalDestination.lat,
                      driver.finalDestination.lng
                    )}
                    color={driver.id === selectedDriverId ? 'var(--success-500)' : 'var(--gray-500)'}
                    weight={driver.id === selectedDriverId ? 3 : 1}
                    opacity={driver.id === selectedDriverId ? 0.9 : 0.4}
                    dashArray="3, 3"
                  />
                  
                  {/* Direction arrow marker */}
                  <Marker
                    position={[
                      (driver.lat + driver.finalDestination.lat) / 2,
                      (driver.lng + driver.finalDestination.lng) / 2
                    ]}
                    icon={L.divIcon({
                      className: 'direction-arrow',
                      html: `
                        <div style="
                          width: 16px;
                          height: 16px;
                          background-color: ${driver.id === selectedDriverId ? 'var(--primary-500)' : 'var(--gray-500)'};
                          border: 2px solid white;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 8px;
                          color: white;
                          font-weight: bold;
                          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        ">
                          ➜
                        </div>
                      `,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8],
                    })}
                  />
                </>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
      
      {/* Pending Actions Counter */}
      {Object.keys(pendingActions).length > 0 && (
        <div className="pending-actions-counter">
          ⏳ {Object.keys(pendingActions).length} Pending
        </div>
      )}

      {/* Status Legend with minimize/maximize toggle */}
      <div className={`map-legend${legendMinimized ? ' minimized' : ''}`}> 
        <button
          className="legend-toggle-btn"
          aria-label={legendMinimized ? 'Expand legend' : 'Minimize legend'}
          onClick={() => setLegendMinimized((min) => !min)}
        >
          {legendMinimized ? '▶' : '▼'}
        </button>
        {!legendMinimized && (
          <>
            <div className="legend-title">Map Legend</div>
            <div className="legend-section">
              <div className="legend-section-title">Driver Status</div>
              <div className="legend-item">
                <div className="legend-dot delivering"></div>
                <span>Delivering</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot paused"></div>
                <span>Paused</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot idle"></div>
                <span>Idle</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot pending"></div>
                <span>Pending Action</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot selected"></div>
                <span>Selected</span>
              </div>
            </div>
            <div className="legend-section">
              <div className="legend-section-title">Destinations</div>
              <div className="legend-item">
                <div className="legend-dot initial-dest">📍</div>
                <span>Initial Destination</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot final-dest">🎯</div>
                <span>Final Destination</span>
              </div>
            </div>
            <div className="legend-section">
              <div className="legend-section-title">Land Routes</div>
              <div className="legend-item">
                <div className="legend-line full-route"></div>
                <span>Full Route</span>
              </div>
              <div className="legend-item">
                <div className="legend-line selected-route"></div>
                <span>Selected Route</span>
              </div>
              <div className="legend-item">
                <div className="legend-line remaining-path"></div>
                <span>Remaining Path</span>
              </div>
            </div>
          </>
        )}
        {legendMinimized && (
          <div className="legend-minimized-label">Map Legend</div>
        )}
      </div>
    </div>
  );
};

export default MapComponent; 
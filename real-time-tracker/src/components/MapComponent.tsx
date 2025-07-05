import React, { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RootState } from '../store';
import { Driver } from '../types/driver';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons for different driver statuses
const createCustomIcon = (status: Driver['status'], isSelected: boolean = false) => {
  const color = status === 'Delivering' ? '#28a745' : 
                status === 'Paused' ? '#ffc107' : '#6c757d';
  
  const borderColor = isSelected ? '#007bff' : 'white';
  const borderWidth = isSelected ? '3px' : '2px';
  const size = isSelected ? '24px' : '20px';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size};
        height: ${size};
        background-color: ${color};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 50%;
        box-shadow: ${isSelected ? '0 0 0 4px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '12px' : '10px'};
        color: white;
        font-weight: bold;
        animation: ${isSelected ? 'pulse 2s infinite' : 'none'};
      ">
        🚛
      </div>
    `,
    iconSize: isSelected ? [24, 24] : [20, 20],
    iconAnchor: isSelected ? [12, 12] : [10, 10],
  });
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const drivers = useSelector((state: RootState) => state.drivers.drivers);
  const isConnected = useSelector((state: RootState) => state.drivers.isConnected);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriverId);

  // Calculate center point for the map (average of all driver positions)
  const mapCenter = useMemo(() => {
    if (drivers.length === 0) {
      return [53.23, -59.999167]; // Default to Newfoundland, Canada (central part)
    }
    
    const totalLat = drivers.reduce((sum, driver) => sum + driver.lat, 0);
    const totalLng = drivers.reduce((sum, driver) => sum + driver.lng, 0);
    
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

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={createCustomIcon(driver.status, driver.id === selectedDriverId)}
          >
            <Popup>
              <div>
                <h3>{driver.name}</h3>
                <p><strong>Status:</strong> {driver.status}</p>
                <p><strong>Location:</strong> {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</p>
                {driver.eta && <p><strong>ETA:</strong> {driver.eta}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Connection status indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: isConnected ? '#28a745' : '#dc3545',
        color: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000,
      }}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};

export default MapComponent; 
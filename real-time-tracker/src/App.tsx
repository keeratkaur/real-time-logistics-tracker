import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { ReduxDebugInfo } from './components/ReduxDebugInfo';
import { DashboardPanel } from './components/DashboardPanel';
import { NotificationSystem } from './components/NotificationSystem';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const { reconnect } = useWebSocket();

  return (
    <div className="App">
      <ReduxDebugInfo />
      <NotificationSystem />
      
      {/* Modern Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="title-icon">🚛</span>
              Real-Time Logistics Tracker
            </h1>
            <p className="app-subtitle">Live fleet monitoring and dispatch management</p>
          </div>
          
          <div className="header-right">
            <button 
              onClick={reconnect}
              className="reconnect-button"
            >
              <span className="button-icon">🔄</span>
              Reconnect
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Side-by-side full width */}
      <main className="app-main app-main-full">
        <div className="main-split-container">
          {/* Dashboard Section (left) */}
          <section className="dashboard-section split-left">
            <DashboardPanel />
          </section>
          
          {/* Map Section (right) */}
          <section className="map-section split-right">
            <div className="map-header">
              <h2 className="map-title">
                <span className="title-icon">🗺️</span>
                Live Driver Locations
              </h2>
              <p className="map-subtitle">Real-time tracking and route visualization</p>
            </div>
            <div className="map-container">
              <MapComponent />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;

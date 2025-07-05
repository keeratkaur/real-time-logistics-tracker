import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { ReduxDebugInfo } from './components/ReduxDebugInfo';
import { DashboardPanel } from './components/DashboardPanel';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const { reconnect } = useWebSocket();

  return (
    <div className="App">
      <ReduxDebugInfo />
      <header className="App-header">
        <h1>Real-Time Logistics Tracker</h1>
        
        {/* Reconnect Button */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={reconnect}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🔄 Reconnect
          </button>
        </div>

        {/* Dashboard Panel */}
        <DashboardPanel />
        
        {/* Live Map */}
        <div style={{ 
          marginTop: '20px', 
          padding: '0 20px', 
          width: '100%', 
          maxWidth: '1200px' 
        }}>
          <h2>Live Driver Locations</h2>
          <MapComponent />
        </div>
      </header>
    </div>
  );
}

export default App;

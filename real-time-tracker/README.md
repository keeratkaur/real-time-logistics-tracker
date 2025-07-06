# Real-Time Logistics Tracker - Frontend

This is the React frontend application for the Real-Time Logistics Tracker. It provides a comprehensive interface for tracking delivery drivers, managing dispatch operations, and visualizing real-time data.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- The WebSocket server running (see server/README.md)

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

### Testing

```bash
npm test
```

## 🏗️ Architecture

### State Management
- **Redux Toolkit**: Global state management with async thunks
- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **Action History**: Tracks all dispatch operations

### Components Structure
```
src/
├── components/           # React components
│   ├── MapComponent.tsx  # Leaflet map with driver markers
│   ├── DashboardPanel.tsx # Main dashboard with tabs
│   ├── DriverList.tsx    # Driver list with pagination
│   ├── DriverListItem.tsx # Individual driver cards
│   ├── NotificationSystem.tsx # Toast notifications
│   └── ConfirmationDialog.tsx # Action confirmations
├── store/               # Redux store
│   ├── driversSlice.ts  # Driver state management
│   ├── uiSlice.ts       # UI state management
│   └── index.ts         # Store configuration
├── hooks/               # Custom React hooks
│   ├── useWebSocket.ts  # WebSocket connection management
│   └── useReverseGeocode.ts # Address lookup
└── types/               # TypeScript definitions
    └── driver.ts        # Driver interface
```

### Key Features

#### Real-Time Map
- Live driver location tracking
- Custom markers for different statuses
- Route visualization between destinations
- Driver selection and highlighting

#### Driver Management
- Real-time status updates
- Filtering and sorting capabilities
- Pagination for large driver lists
- Detailed driver information

#### Dispatch Operations
- Pause/Resume drivers
- Complete deliveries
- Reassign drivers
- Optimistic UI updates with retry logic

#### User Experience
- Confirmation dialogs for critical actions
- Toast notifications for feedback
- Connection status indicators
- Responsive design for all screen sizes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_MAP_CENTER=47.5615,-52.7126
REACT_APP_UPDATE_INTERVAL=2500
```

### WebSocket Connection
The application connects to a WebSocket server for real-time updates. Make sure the server is running before starting the frontend.

## 🎨 Styling

The application uses modern CSS with:
- CSS Custom Properties for theming
- Flexbox and Grid for layouts
- Responsive design patterns
- Smooth animations and transitions

## 🧪 Testing

The project includes:
- Unit tests for components
- Integration tests for Redux slices
- Custom hook testing
- Mock WebSocket testing

Run tests with:
```bash
npm test
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure the server is running on port 8080
   - Check firewall settings
   - Verify the WebSocket URL in environment variables

2. **Map Not Loading**
   - Check internet connection (map tiles require external access)
   - Verify Leaflet CSS is properly imported
   - Check browser console for errors

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript compilation: `npx tsc --noEmit`

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

For the complete project setup, see the main [README.md](../README.md) in the root directory.

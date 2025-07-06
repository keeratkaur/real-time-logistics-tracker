# Real-Time Logistics Tracker

A comprehensive web application for tracking delivery drivers in real-time, managing delivery statuses, and handling dispatch operations with optimistic UI updates.

## 🚀 Features

### Core Functionality
- **Live Map Visualization**: Real-time tracking of driver locations using Leaflet maps
- **Driver Dashboard**: Comprehensive driver management with filtering and sorting
- **Real-Time Updates**: WebSocket-based live updates for driver positions and status
- **Optimistic UI**: Immediate feedback for dispatch actions with error handling
- **Dual Views**: Dispatcher view for management and Driver view for monitoring

### Advanced Features
- **Confirmation Dialogs**: Prevents accidental critical actions
- **Retry Mechanism**: Automatic retry for failed operations (up to 3 attempts)
- **Action History**: Tracks all dispatch actions with status and timestamps
- **Reverse Geocoding**: Converts coordinates to human-readable addresses
- **Responsive Design**: Works seamlessly across different screen sizes
- **Connection Management**: Auto-reconnect with visual connection status

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Redux Toolkit
- **Maps**: Leaflet with React-Leaflet
- **Styling**: CSS3 with modern design patterns
- **Backend**: Node.js with WebSocket (ws library)
- **State Management**: Redux Toolkit with async thunks
- **Real-time Communication**: WebSocket for live updates

## 📦 Project Structure

```
real-time-logistics-tracker/
├── real-time-tracker/          # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── store/             # Redux store and slices
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── services/          # API and external services
│   └── package.json
├── server/                    # WebSocket server
│   ├── index.js              # Main server file
│   └── package.json
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-logistics-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   cd real-time-tracker
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

1. **Start the WebSocket server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `ws://localhost:8080`

2. **Start the React application**
   ```bash
   cd real-time-tracker
   npm start
   ```
   The application will open at `http://localhost:3000`

## 🏗️ Architecture Decisions

### State Management
- **Redux Toolkit**: Chosen for its simplicity and built-in best practices
- **Async Thunks**: For handling complex async operations with optimistic updates
- **Normalized State**: Efficient state structure for driver data

### Real-time Communication
- **WebSocket**: Provides true real-time bidirectional communication
- **Auto-reconnect**: Ensures continuous connection with exponential backoff
- **Error Handling**: Graceful degradation when connection is lost

### Optimistic UI Pattern
- **Immediate Feedback**: UI updates instantly when actions are triggered
- **Rollback Mechanism**: Reverts changes if server operations fail
- **Retry Logic**: Allows users to retry failed operations
- **Visual Indicators**: Clear feedback for pending, success, and failed states

### Map Integration
- **Leaflet**: Lightweight, mobile-friendly mapping library
- **Custom Markers**: Visual distinction for different driver statuses
- **Route Visualization**: Shows delivery routes between destinations

## 🎨 Design Trade-offs

### Performance vs. Real-time Updates
- **Update Frequency**: 2.5-second intervals balance responsiveness with server load
- **Pagination**: Limits rendered drivers to maintain smooth performance
- **Debounced Updates**: Prevents excessive re-renders during rapid changes

### User Experience vs. Complexity
- **Optimistic Updates**: Immediate feedback at the cost of potential rollbacks
- **Confirmation Dialogs**: Prevents accidents but adds extra clicks
- **Dual Views**: More complex UI but provides different user perspectives

### Scalability Considerations
- **WebSocket Connections**: Current implementation supports multiple clients
- **State Management**: Redux structure allows for easy scaling
- **Component Architecture**: Modular design enables feature additions

## 🔧 Configuration

### Environment Variables
- `REACT_APP_WS_URL`: WebSocket server URL (default: `ws://localhost:8080`)
- `REACT_APP_MAP_CENTER`: Default map center coordinates
- `REACT_APP_UPDATE_INTERVAL`: Update frequency in milliseconds

### Customization
- **Driver Statuses**: Modify `Driver['status']` type in `types/driver.ts`
- **Map Styling**: Update marker icons and colors in `MapComponent.tsx`
- **Update Frequency**: Change interval in `server/index.js`

## 🧪 Testing

```bash
# Run frontend tests
cd real-time-tracker
npm test

# Run with coverage
npm test -- --coverage
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Known Limitations

1. **Offline Mode**: Currently requires active internet connection
2. **Map Tiles**: Depends on external map tile providers
3. **Geocoding**: Requires internet for reverse geocoding
4. **WebSocket**: No fallback to HTTP polling if WebSocket fails
5. **Data Persistence**: No local storage for offline data

## 🔮 Future Enhancements

- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time alerts for critical events
- **Advanced Analytics**: Driver performance metrics and reporting
- **Mobile App**: React Native version for mobile devices
- **Multi-language Support**: Internationalization (i18n)
- **Advanced Routing**: Integration with routing APIs for optimal routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created as a take-home assignment demonstrating modern React development practices, TypeScript implementation, and real-time application architecture.

---

**Note**: This is a demonstration project with mocked data and simulated API calls. In a production environment, you would integrate with real backend services and implement proper authentication and authorization. 
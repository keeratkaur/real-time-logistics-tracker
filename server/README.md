# Real-Time Logistics Tracker - WebSocket Server

This is the WebSocket server that provides real-time updates for the logistics tracking application. It simulates driver movements and status changes, broadcasting updates to connected clients.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will start on `ws://localhost:8080` and begin broadcasting driver updates every 2.5 seconds.

## 🏗️ Architecture

### WebSocket Implementation
- **ws Library**: Lightweight WebSocket server implementation
- **Broadcast Pattern**: Sends updates to all connected clients
- **Auto-reconnect Support**: Clients can reconnect seamlessly
- **Error Handling**: Graceful handling of connection issues

### Mock Data Structure
The server generates realistic driver data for Newfoundland and Labrador:

```javascript
{
  id: number,
  name: string,
  lat: number,
  lng: number,
  status: 'Delivering' | 'Paused' | 'Idle',
  eta: string | null,
  initialDestination: {
    name: string,
    lat: number,
    lng: number,
    address: string
  },
  finalDestination: {
    name: string,
    lat: number,
    lng: number,
    address: string
  }
}
```

### Message Format
All WebSocket messages follow this structure:

```javascript
{
  type: 'drivers',
  drivers: Driver[]
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:

```env
PORT=8080
UPDATE_INTERVAL=2500
DRIVER_COUNT=12
```

### Customization Options

#### Update Frequency
Change the broadcast interval in `index.js`:
```javascript
setInterval(() => {
  updateDrivers();
  broadcastDrivers();
}, 2500); // 2.5 seconds
```

#### Driver Count
Modify the number of simulated drivers:
```javascript
const drivers = Array.from({ length: 12 }, (_, i) => {
  // Driver generation logic
});
```

#### Geographic Area
Update the location data for different regions:
```javascript
const nlLocations = [
  { name: 'St. John\'s', lat: 47.5615, lng: -52.7126 },
  // Add more locations
];
```

## 📊 Driver Simulation

### Location Updates
- Drivers move randomly within Newfoundland and Labrador
- Movement is constrained to realistic geographic boundaries
- Small random deltas prevent unrealistic teleportation

### Status Changes
- 80% chance to maintain current status
- 20% chance to change to a random status
- ETA updates based on current status

### Realistic Data
- Uses actual Newfoundland and Labrador city coordinates
- Generates realistic addresses and destination names
- Maintains geographic consistency

## 🔌 WebSocket Events

### Connection
When a client connects:
1. Server sends initial driver data
2. Client is added to broadcast list
3. Connection is logged

### Message Handling
Currently logs all received messages for debugging:
```javascript
ws.on('message', message => {
  console.log('Received:', message);
});
```

### Disconnection
When a client disconnects:
1. Client is removed from broadcast list
2. Connection is logged
3. Server continues broadcasting to remaining clients

## 🧪 Testing

### Manual Testing
1. Start the server: `npm start`
2. Use a WebSocket client (like wscat or browser dev tools)
3. Connect to `ws://localhost:8080`
4. Observe incoming messages

### WebSocket Client Example
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 8080
   lsof -i :8080
   
   # Kill the process or change port
   ```

2. **No Clients Receiving Updates**
   - Check if server is running: `npm start`
   - Verify WebSocket URL in client
   - Check browser console for connection errors

3. **High CPU Usage**
   - Increase update interval (currently 2.5 seconds)
   - Reduce number of simulated drivers
   - Check for memory leaks in long-running sessions

## 📈 Performance Considerations

### Scalability
- Current implementation supports multiple concurrent clients
- Broadcast pattern may not scale to thousands of clients
- Consider Redis pub/sub for large-scale deployments

### Memory Usage
- Driver data is stored in memory
- No persistence between server restarts
- Consider database integration for production

### Network Usage
- Updates sent every 2.5 seconds
- Message size: ~2-5KB per update
- Bandwidth usage scales with client count

## 🔮 Production Considerations

### Security
- Add authentication and authorization
- Implement rate limiting
- Use WSS (WebSocket Secure) in production

### Monitoring
- Add logging for connection events
- Monitor message frequency and size
- Track client connection duration

### Persistence
- Store driver data in database
- Implement data recovery on restart
- Add historical data tracking

## 📚 Additional Resources

- [ws Library Documentation](https://github.com/websockets/ws)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [Node.js Documentation](https://nodejs.org/)

---

For the complete project setup, see the main [README.md](../README.md) in the root directory. 
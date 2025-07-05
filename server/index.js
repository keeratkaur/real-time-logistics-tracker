const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Mock driver data
// type DriverStatus = 'Delivering' | 'Paused' | 'Idle';
const statuses = ['Delivering', 'Paused', 'Idle'];

function getRandomStatus(current) {
  // 80% chance to keep current, 20% to change
  if (Math.random() < 0.8) return current;
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function randomDelta() {
  return (Math.random() - 0.5) * 0.001; // small movement
}

const drivers = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Driver ${i + 1}`,
  lat: 37.77 + Math.random() * 0.05,
  lng: -122.41 + Math.random() * 0.05,
  status: statuses[Math.floor(Math.random() * statuses.length)],
}));

function updateDrivers() {
  drivers.forEach(driver => {
    driver.lat += randomDelta();
    driver.lng += randomDelta();
    driver.status = getRandomStatus(driver.status);
  });
}

function broadcastDrivers() {
  const data = JSON.stringify({ type: 'drivers', drivers });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
  console.log('Broadcasted:', data);
}

setInterval(() => {
  updateDrivers();
  broadcastDrivers();
}, 2500);

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'drivers', drivers }));
  ws.on('message', message => {
    console.log('Received:', message);
  });
});

console.log('Mock WebSocket server running on ws://localhost:8080'); 
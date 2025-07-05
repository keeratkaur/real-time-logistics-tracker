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

// Newfoundland major areas for more realistic driver distribution
const nlLocations = [
  { name: 'St. John\'s', lat: 47.5615, lng: -52.7126 },
  { name: 'Mount Pearl', lat: 47.5189, lng: -52.8058 },
  { name: 'Corner Brook', lat: 48.9500, lng: -57.9500 },
  { name: 'Grand Falls-Windsor', lat: 48.9500, lng: -55.6500 },
  { name: 'Gander', lat: 48.9500, lng: -54.5500 },
  { name: 'Stephenville', lat: 48.5500, lng: -58.5500 },
  { name: 'Deer Lake', lat: 49.1833, lng: -57.4333 },
  { name: 'Labrador City', lat: 52.9500, lng: -66.9167 },
  { name: 'Happy Valley-Goose Bay', lat: 53.3167, lng: -60.3167 },
  { name: 'Marystown', lat: 47.1667, lng: -55.1667 },
  { name: 'Channel-Port aux Basques', lat: 47.5667, lng: -59.1500 },
  { name: 'Clarenville', lat: 48.1500, lng: -53.9667 }
];

const drivers = Array.from({ length: 12 }, (_, i) => {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  let eta = null;
  
  if (status === 'Delivering') {
    const minutes = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
    eta = `${minutes} min`;
  } else if (status === 'Paused') {
    eta = 'On hold';
  }
  
  // Pick a random Newfoundland location and add some variation
  const location = nlLocations[i % nlLocations.length];
  const variation = 0.01; // Small variation around the city center
  
  return {
    id: i + 1,
    name: `Driver ${i + 1}`,
    lat: location.lat + (Math.random() - 0.5) * variation,
    lng: location.lng + (Math.random() - 0.5) * variation,
    status: status,
    eta: eta,
  };
});

function updateDrivers() {
  drivers.forEach(driver => {
    driver.lat += randomDelta();
    driver.lng += randomDelta();
    driver.status = getRandomStatus(driver.status);
    
    // Update ETA based on status
    if (driver.status === 'Delivering') {
      const minutes = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
      driver.eta = `${minutes} min`;
    } else if (driver.status === 'Paused') {
      driver.eta = 'On hold';
    } else {
      driver.eta = null; // No ETA when idle
    }
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
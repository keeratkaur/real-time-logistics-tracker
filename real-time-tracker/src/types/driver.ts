export interface Driver {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'Delivering' | 'Paused' | 'Idle';
  eta?: string; // Estimated Time of Arrival
}

export interface WebSocketMessage {
  type: 'drivers';
  drivers: Driver[];
} 
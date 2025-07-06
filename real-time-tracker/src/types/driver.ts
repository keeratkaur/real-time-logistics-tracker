export interface Driver {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'Delivering' | 'Paused' | 'Idle';
  eta?: string; // Estimated Time of Arrival
  initialDestination?: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  };
  finalDestination?: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  };
}

export interface WebSocketMessage {
  type: 'drivers';
  drivers: Driver[];
} 

export interface DeviceNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'relay';
  battery: number;
  distance: number; // meters
  x?: number;
  y?: number;
  language: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // "broadcast" or specific ID
  originalText: string;
  translatedText?: string;
  timestamp: number;
  hops: string[]; // List of device IDs it passed through
  isEmergency: boolean;
  language: string;
}

export interface NetworkStats {
  activeNodes: number;
  latency: number;
  coverageRange: number;
  totalHops: number;
}

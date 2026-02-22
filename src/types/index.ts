export interface Station {
  id: string;
  name: string;
  lineId: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: string[];
}

export interface RouteSegment {
  lineColor: string;
  from: string;
  to: string;
  stops: number;
  duration: number;
  interchange: boolean;
}

export interface Route {
  totalTime: number;
  totalStops: number;
  transfers: number;
  segments: RouteSegment[];
}

export interface Booking {
  ref: string;
  from: string;
  to: string;
  route: Route;
  timestamp: number;
  qrCode?: string;
}

export type LineStatus = 'operational' | 'delayed' | 'disrupted';

export interface NetworkLine {
  id: string;
  name: string;
  color: string;
  status: LineStatus;
  message?: string;
}

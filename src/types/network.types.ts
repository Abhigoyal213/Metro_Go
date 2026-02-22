export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}

export interface MetroNetwork {
  lines: MetroLine[];
}

export interface GraphNode {
  node: string;
  line: string;
  distance: number;
}

export interface RouteSegment {
  lineId: string;
  lineName: string;
  lineColor: string;
  stations: Station[];
  from: Station;
  to: Station;
}

export interface ComputedRoute {
  segments: RouteSegment[];
  totalStations: number;
  totalDistance: number;
  interchanges: Station[];
  duration: number;
}

export interface InterchangeStation extends Station {
  lines: string[];
}

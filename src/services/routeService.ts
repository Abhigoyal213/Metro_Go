import { MetroNetwork, GraphNode, RouteSegment, ComputedRoute, Station } from '../types/network.types';
import { getStationById } from './networkService';

interface Graph {
  [stationId: string]: GraphNode[];
}

export function buildGraph(network: MetroNetwork): Graph {
  const graph: Graph = {};
  
  network.lines.forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const current = line.stations[i].id;
      const next = line.stations[i + 1].id;
      
      const distance = calculateDistance(line.stations[i], line.stations[i + 1]);
      
      if (!graph[current]) graph[current] = [];
      if (!graph[next]) graph[next] = [];
      
      graph[current].push({ node: next, line: line.id, distance });
      graph[next].push({ node: current, line: line.id, distance });
    }
  });
  
  return graph;
}

function calculateDistance(station1: Station, station2: Station): number {
  const dx = station2.x - station1.x;
  const dy = station2.y - station1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

interface DijkstraNode {
  stationId: string;
  distance: number;
  lineId: string;
  previous: { stationId: string; lineId: string } | null;
}

export function findShortestPath(
  network: MetroNetwork,
  fromId: string,
  toId: string
): ComputedRoute | null {
  const graph = buildGraph(network);
  
  if (!graph[fromId] || !graph[toId]) {
    return null;
  }
  
  const distances = new Map<string, number>();
  const previous = new Map<string, { stationId: string; lineId: string }>();
  const visited = new Set<string>();
  const queue: DijkstraNode[] = [];
  
  // Initialize
  distances.set(fromId, 0);
  queue.push({ stationId: fromId, distance: 0, lineId: '', previous: null });
  
  while (queue.length > 0) {
    // Get node with minimum distance
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;
    
    if (visited.has(current.stationId)) continue;
    visited.add(current.stationId);
    
    if (current.previous) {
      previous.set(current.stationId, {
        stationId: current.previous.stationId,
        lineId: current.lineId
      });
    }
    
    if (current.stationId === toId) break;
    
    const neighbors = graph[current.stationId] || [];
    
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.node)) continue;
      
      const newDistance = current.distance + neighbor.distance;
      const oldDistance = distances.get(neighbor.node) ?? Infinity;
      
      if (newDistance < oldDistance) {
        distances.set(neighbor.node, newDistance);
        queue.push({
          stationId: neighbor.node,
          distance: newDistance,
          lineId: neighbor.line,
          previous: { stationId: current.stationId, lineId: neighbor.line }
        });
      }
    }
  }
  
  if (!previous.has(toId) && fromId !== toId) {
    return null;
  }
  
  // Reconstruct path
  const path: { stationId: string; lineId: string }[] = [];
  let currentId = toId;
  
  while (currentId !== fromId) {
    const prev = previous.get(currentId);
    if (!prev) break;
    path.unshift({ stationId: currentId, lineId: prev.lineId });
    currentId = prev.stationId;
  }
  path.unshift({ stationId: fromId, lineId: path[0]?.lineId || '' });
  
  // Build segments
  const segments = buildSegments(network, path);
  const interchanges = detectInterchangesInRoute(segments);
  const totalDistance = distances.get(toId) || 0;
  const duration = Math.ceil(totalDistance / 10) + (interchanges.length * 3); // 3 min per interchange
  
  return {
    segments,
    totalStations: path.length,
    totalDistance,
    interchanges,
    duration
  };
}

function buildSegments(
  network: MetroNetwork,
  path: { stationId: string; lineId: string }[]
): RouteSegment[] {
  if (path.length === 0) return [];
  
  const segments: RouteSegment[] = [];
  let currentSegmentStations: Station[] = [];
  let currentLineId = path[0].lineId;
  
  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const station = getStationById(network, step.stationId);
    if (!station) continue;
    
    // Add station to current segment
    currentSegmentStations.push(station);
    
    // Check if this is the last station OR if next station is on a different line
    const isLastStation = i === path.length - 1;
    const nextLineId = !isLastStation ? path[i + 1].lineId : null;
    const isLineChanging = nextLineId && nextLineId !== currentLineId;
    
    if (isLastStation || isLineChanging) {
      // Create segment for current line
      const line = network.lines.find(l => l.id === currentLineId);
      if (line && currentSegmentStations.length >= 2) {
        segments.push({
          lineId: line.id,
          lineName: line.name,
          lineColor: line.color,
          stations: [...currentSegmentStations],
          from: currentSegmentStations[0],
          to: currentSegmentStations[currentSegmentStations.length - 1]
        });
      }
      
      // If line is changing, start new segment with the interchange station
      if (isLineChanging) {
        currentSegmentStations = [station]; // Keep interchange station for next segment
        currentLineId = nextLineId!;
      }
    }
  }
  
  return segments;
}

function detectInterchangesInRoute(segments: RouteSegment[]): Station[] {
  const interchanges: Station[] = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const currentSegment = segments[i];
    const nextSegment = segments[i + 1];
    
    // The last station of current segment is the interchange
    const interchangeStation = currentSegment.to;
    if (interchangeStation.id === nextSegment.from.id) {
      interchanges.push(interchangeStation);
    }
  }
  
  return interchanges;
}

export function calculateFare(route: ComputedRoute): number {
  const basefare = 10; // Base fare in rupees
  const perStationFare = 5; // Per station fare in rupees
  const interchangeFee = 5; // Interchange fee in rupees
  
  return basefare + 
         (route.totalStations * perStationFare) + 
         (route.interchanges.length * interchangeFee);
}

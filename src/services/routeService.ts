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
  const segments: RouteSegment[] = [];
  let currentLineId = path[0].lineId;
  let segmentStations: Station[] = [];
  
  for (const step of path) {
    const station = getStationById(network, step.stationId);
    if (!station) continue;
    
    if (step.lineId !== currentLineId && segmentStations.length > 0) {
      // Line change - create segment
      const line = network.lines.find(l => l.id === currentLineId);
      if (line) {
        segments.push({
          lineId: line.id,
          lineName: line.name,
          lineColor: line.color,
          stations: segmentStations,
          from: segmentStations[0],
          to: segmentStations[segmentStations.length - 1]
        });
      }
      segmentStations = [station];
      currentLineId = step.lineId;
    } else {
      segmentStations.push(station);
    }
  }
  
  // Add final segment
  if (segmentStations.length > 0) {
    const line = network.lines.find(l => l.id === currentLineId);
    if (line) {
      segments.push({
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        stations: segmentStations,
        from: segmentStations[0],
        to: segmentStations[segmentStations.length - 1]
      });
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
  const basefare = 1.5;
  const perStationFare = 0.15;
  const interchangeFee = 0.25;
  
  return basefare + 
         (route.totalStations * perStationFare) + 
         (route.interchanges.length * interchangeFee);
}

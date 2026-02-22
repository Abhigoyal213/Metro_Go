import { MetroNetwork, Station, MetroLine, InterchangeStation } from '../types/network.types';

let cachedNetwork: MetroNetwork | null = null;
const STORAGE_KEY = 'metro-network-data';

export async function loadNetwork(): Promise<MetroNetwork> {
  if (cachedNetwork) return cachedNetwork;
  
  // First, try to load from localStorage (admin changes)
  const savedNetwork = localStorage.getItem(STORAGE_KEY);
  if (savedNetwork) {
    try {
      cachedNetwork = JSON.parse(savedNetwork);
      console.log('Loaded network from localStorage');
      return cachedNetwork;
    } catch (error) {
      console.error('Error parsing saved network:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  
  // If no saved network, load from JSON file
  try {
    const response = await fetch('/mini-metro-network.json');
    if (!response.ok) {
      throw new Error(`Failed to load network: ${response.status} ${response.statusText}`);
    }
    cachedNetwork = await response.json();
    console.log('Loaded network from JSON file');
    return cachedNetwork;
  } catch (error) {
    console.error('Error loading metro network:', error);
    throw error;
  }
}

export function saveNetwork(network: MetroNetwork): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(network));
    cachedNetwork = network;
    console.log('Network saved to localStorage');
  } catch (error) {
    console.error('Error saving network:', error);
    throw error;
  }
}

export function clearCachedNetwork(): void {
  cachedNetwork = null;
}

export function resetNetworkToDefault(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedNetwork = null;
  console.log('Network reset to default');
}

export function getAllStations(network: MetroNetwork): Station[] {
  const stationMap = new Map<string, Station>();
  
  network.lines.forEach(line => {
    line.stations.forEach(station => {
      if (!stationMap.has(station.id)) {
        stationMap.set(station.id, station);
      }
    });
  });
  
  return Array.from(stationMap.values());
}

export function getStationById(network: MetroNetwork, stationId: string): Station | null {
  for (const line of network.lines) {
    const station = line.stations.find(s => s.id === stationId);
    if (station) return station;
  }
  return null;
}

export function getLineByStation(network: MetroNetwork, stationId: string): MetroLine | null {
  return network.lines.find(line => 
    line.stations.some(s => s.id === stationId)
  ) || null;
}

export function detectInterchanges(network: MetroNetwork): InterchangeStation[] {
  const stationLines = new Map<string, { station: Station; lines: string[] }>();
  
  network.lines.forEach(line => {
    line.stations.forEach(station => {
      if (!stationLines.has(station.id)) {
        stationLines.set(station.id, { station, lines: [] });
      }
      stationLines.get(station.id)!.lines.push(line.id);
    });
  });
  
  const interchanges: InterchangeStation[] = [];
  stationLines.forEach(({ station, lines }) => {
    if (lines.length > 1) {
      interchanges.push({ ...station, lines });
    }
  });
  
  return interchanges;
}

export function searchStations(network: MetroNetwork, query: string): Station[] {
  const allStations = getAllStations(network);
  const lowerQuery = query.toLowerCase();
  
  return allStations.filter(station => 
    station.name.toLowerCase().includes(lowerQuery)
  );
}

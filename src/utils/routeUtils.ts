interface RouteSegment {
  line: { color: string };
  from: { name: string };
  to: { name: string };
  stops: string[];
  duration: number;
  interchange?: boolean;
}

interface Route {
  totalTime: number;
  stops: string[];
  transfers: any[];
  segments: RouteSegment[];
}

export function normalizeRoute(route: Route) {
  return {
    totalTime: route.totalTime,
    totalStops: route.stops.length,
    transfers: route.transfers.length,
    segments: route.segments.map(segment => ({
      lineColor: segment.line.color,
      from: segment.from.name,
      to: segment.to.name,
      stops: segment.stops.length,
      duration: segment.duration,
      interchange: segment.interchange ?? false,
    })),
  };
}
import { useEffect, useState, useRef } from 'react';
import { MetroNetwork, Station, ComputedRoute } from '../../types/network.types';
import { detectInterchanges } from '../../services/networkService';
import Icon from '../atoms/Icon';

interface DynamicMetroMapProps {
  network: MetroNetwork | null;
  highlightedRoute?: string[];
  selectedRoute?: ComputedRoute | null;
  onStationClick?: (stationId: string) => void;
  sourceStationId?: string | null;
  destStationId?: string | null;
}

export default function DynamicMetroMap({ 
  network, 
  highlightedRoute = [],
  selectedRoute = null,
  onStationClick,
  sourceStationId = null,
  destStationId = null
}: DynamicMetroMapProps) {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 600, height: 500 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [pathProgress, setPathProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate path drawing when route changes
  useEffect(() => {
    if (selectedRoute && selectedRoute.segments.length > 0) {
      setPathProgress(0);
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = 100 / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setPathProgress((currentStep / steps) * 100);
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setPathProgress(0);
    }
  }, [selectedRoute]);
  
  useEffect(() => {
    if (!network) return;
    
    // Calculate viewBox from station coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    network.lines.forEach(line => {
      line.stations.forEach(station => {
        minX = Math.min(minX, station.x);
        minY = Math.min(minY, station.y);
        maxX = Math.max(maxX, station.x);
        maxY = Math.max(maxY, station.y);
      });
    });
    
    const padding = 80;
    setViewBox({
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    });
  }, [network]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.3, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.3, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // Smart label positioning to avoid path blocking
  const getLabelPosition = (station: Station, lineId: string, stationIndex: number, totalStations: number) => {
    const stationId = station.id;
    
    // For interchange stations, position above to avoid line overlap
    if (isInterchange(stationId)) {
      return { dx: 0, dy: -20, anchor: 'middle' };
    }
    
    // Position based on line direction and station location
    switch (lineId) {
      case 'red': // Horizontal line
        // Alternate above and below for horizontal lines
        return stationIndex % 2 === 0 
          ? { dx: 0, dy: 18, anchor: 'middle' }  // Below
          : { dx: 0, dy: -12, anchor: 'middle' }; // Above
          
      case 'blue': // Vertical line
        // Position to the right for vertical lines
        return { dx: 14, dy: 4, anchor: 'start' };
        
      case 'yellow': // Diagonal line
        // Position based on which side of diagonal
        if (stationIndex < totalStations / 2) {
          return { dx: 14, dy: -8, anchor: 'start' }; // Top-right
        } else {
          return { dx: -14, dy: 12, anchor: 'end' }; // Bottom-left
        }
        
      case 'purple': // Short connector
        return { dx: 0, dy: 18, anchor: 'middle' }; // Below
        
      default:
        return { dx: 14, dy: 4, anchor: 'start' };
    }
  };
  
  if (!network) {
    return (
      <section className="flex-1 relative bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500">Loading network...</div>
      </section>
    );
  }
  
  const interchanges = detectInterchanges(network);
  const isHighlighted = (stationId: string) => highlightedRoute.includes(stationId);
  const isInterchange = (stationId: string) => interchanges.some(i => i.id === stationId);
  const hasActiveRoute = highlightedRoute.length > 0;
  
  // Check if a station is an interchange on the highlighted route
  const isRouteInterchange = (stationId: string) => {
    if (!isHighlighted(stationId) || !isInterchange(stationId)) return false;
    
    // Check if this interchange connects different lines in the route
    const stationIndex = highlightedRoute.indexOf(stationId);
    if (stationIndex === 0 || stationIndex === highlightedRoute.length - 1) return false;
    
    return true;
  };
  
  return (
    <section className="w-full h-full relative bg-slate-200 dark:bg-slate-900 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          aria-label="Zoom in"
        >
          <Icon name="add" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          aria-label="Zoom out"
        >
          <Icon name="remove" />
        </button>
        <button 
          onClick={handleResetView}
          className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mt-2 border border-slate-200 dark:border-slate-700"
          aria-label="Reset view"
        >
          <Icon name="my_location" />
        </button>
        <div className="mt-2 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-md text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10 max-w-[200px]">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Network Lines</h4>
        <div className="space-y-2">
          {network.lines.map(line => (
            <div key={line.id} className="flex items-center gap-2">
              <span 
                className="size-3 rounded-full" 
                style={{ backgroundColor: line.color }}
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {line.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Map */}
      <div 
        ref={containerRef}
        className={`w-full h-full bg-[#eef2f6] dark:bg-[#0f172a] relative overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg 
          ref={svgRef}
          className="w-full h-full absolute inset-0 transition-transform duration-100" 
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          {/* Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                className="text-slate-300/20 dark:text-slate-700/30" 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Draw Lines */}
          {network.lines.map(line => {
            const pathData = line.stations
              .map((station, idx) => `${idx === 0 ? 'M' : 'L'} ${station.x} ${station.y}`)
              .join(' ');
            
            // Check if this line has any highlighted stations
            const lineHasHighlight = line.stations.some(s => isHighlighted(s.id));
            const shouldDim = hasActiveRoute && !lineHasHighlight;
            
            return (
              <g key={line.id}>
                {/* Base line - dimmed if not part of route */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={shouldDim ? "0.15" : "0.4"}
                  className="transition-opacity duration-500"
                />
                
                {/* Highlighted segments with animation */}
                {selectedRoute && selectedRoute.segments.map((segment, segIdx) => {
                  // Only render segments for this line
                  if (segment.lineId !== line.id) return null;
                  
                  // Render each connection in the segment in journey order
                  return segment.stations.map((station, idx) => {
                    if (idx === segment.stations.length - 1) return null;
                    const nextStation = segment.stations[idx + 1];
                    
                    const segmentPath = `M ${station.x} ${station.y} L ${nextStation.x} ${nextStation.y}`;
                    
                    return (
                      <g key={`route-${segIdx}-${station.id}-${nextStation.id}`}>
                        {/* Animated highlight path */}
                        <path
                          d={segmentPath}
                          fill="none"
                          stroke={segment.lineColor}
                          strokeWidth="12"
                          strokeLinecap="round"
                          style={{ 
                            filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4))',
                            strokeDasharray: '1000',
                            strokeDashoffset: `${1000 - (pathProgress * 10)}`,
                            transition: 'stroke-dashoffset 0.05s linear'
                          }}
                        />
                        {/* Flowing animation on top */}
                        <path
                          d={segmentPath}
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          opacity="0.6"
                          className="metro-line-flow"
                          style={{
                            strokeDasharray: '20 30',
                            animation: pathProgress >= 100 ? 'flow 2s linear infinite' : 'none'
                          }}
                        />
                      </g>
                    );
                  });
                })}
              </g>
            );
          })}

          {/* Draw Stations */}
          {network.lines.map(line => 
            line.stations.map((station, stationIndex) => {
              const interchange = isInterchange(station.id);
              const highlighted = isHighlighted(station.id);
              const routeInterchange = isRouteInterchange(station.id);
              const hovered = hoveredStation === station.id;
              const labelPos = getLabelPosition(station, line.id, stationIndex, line.stations.length);
              const shouldDim = hasActiveRoute && !highlighted;
              const isSource = sourceStationId === station.id;
              const isDest = destStationId === station.id;
              
              return (
                <g 
                  key={`${line.id}-${station.id}`}
                  transform={`translate(${station.x}, ${station.y})`}
                  onClick={() => onStationClick?.(station.id)}
                  onMouseEnter={() => setHoveredStation(station.id)}
                  onMouseLeave={() => setHoveredStation(null)}
                  className="cursor-pointer transition-all duration-200"
                  style={{ pointerEvents: 'all' }}
                >
                  {/* Source station indicator */}
                  {isSource && !hasActiveRoute && (
                    <>
                      <circle
                        r="20"
                        fill="#10b981"
                        opacity="0.2"
                        className="animate-pulse"
                        style={{ animationDuration: '2s' }}
                      />
                      <circle
                        r="16"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    </>
                  )}
                  
                  {/* Destination station indicator */}
                  {isDest && !hasActiveRoute && (
                    <>
                      <circle
                        r="20"
                        fill="#ef4444"
                        opacity="0.2"
                        className="animate-pulse"
                        style={{ animationDuration: '2s' }}
                      />
                      <circle
                        r="16"
                        stroke="#ef4444"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    </>
                  )}
                  
                  {/* Pulsing glow for route interchanges */}
                  {routeInterchange && pathProgress >= 100 && (
                    <>
                      <circle
                        r="24"
                        fill={line.color}
                        opacity="0.3"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                      <circle
                        r="18"
                        fill={line.color}
                        opacity="0.2"
                        className="animate-pulse"
                      />
                    </>
                  )}
                  
                  {/* Hover glow effect */}
                  {hovered && !routeInterchange && !isSource && !isDest && (
                    <circle
                      r={interchange ? "20" : "14"}
                      fill={line.color}
                      opacity="0.15"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Station circle */}
                  {interchange ? (
                    <>
                      <circle
                        className="fill-white dark:fill-slate-900 transition-all"
                        r={routeInterchange ? "14" : (hovered ? "14" : "12")}
                        stroke={line.color}
                        strokeWidth={routeInterchange ? "4" : (hovered ? "4" : "3")}
                        opacity={shouldDim ? "0.3" : "1"}
                      />
                      <circle
                        fill="none"
                        r="8"
                        stroke={line.color}
                        strokeWidth="2"
                        opacity={shouldDim ? "0.2" : "0.5"}
                      />
                      {/* Pulsing center for route interchanges */}
                      {routeInterchange && pathProgress >= 100 && (
                        <circle
                          fill={line.color}
                          r="5"
                          className="animate-pulse"
                          style={{ animationDuration: '1.5s' }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <circle
                        className="fill-white dark:fill-slate-900 transition-all"
                        r={hovered ? "8" : "6"}
                        stroke={line.color}
                        strokeWidth={highlighted ? "3" : (hovered ? "3" : "2.5")}
                        opacity={shouldDim ? "0.3" : "1"}
                      />
                      {highlighted && pathProgress >= 100 && (
                        <circle
                          fill={line.color}
                          r="3"
                          className="animate-pulse"
                        />
                      )}
                    </>
                  )}
                  
                  {/* Station label - always visible, small and positioned smartly */}
                  <text
                    className="text-[9px] font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none select-none transition-opacity duration-500"
                    dx={labelPos.dx}
                    dy={labelPos.dy}
                    textAnchor={labelPos.anchor as any}
                    opacity={shouldDim ? "0.4" : "1"}
                    style={{ 
                      fontSize: '9px',
                      fontWeight: highlighted ? 600 : 500,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {station.name}
                  </text>
                  
                  {/* Interchange indicator badge - only on hover or if route interchange */}
                  {interchange && (hovered || routeInterchange) && (
                    <g className="animate-fadeIn">
                      <rect
                        className="fill-orange-500 dark:fill-orange-600"
                        x={-42}
                        y={-32}
                        width={84}
                        height={16}
                        rx="8"
                      />
                      <text
                        className="text-[8px] font-bold fill-white pointer-events-none"
                        x={0}
                        y={-22}
                        textAnchor="middle"
                        style={{ fontSize: '8px', letterSpacing: '0.05em' }}
                      >
                        ⇄ INTERCHANGE
                      </text>
                    </g>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    </section>
  );
}

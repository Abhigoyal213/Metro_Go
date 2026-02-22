import { RouteSegment, Station } from '../../types/network.types';
import Icon from '../atoms/Icon';

interface RouteTimelineProps {
  segments: RouteSegment[];
  interchanges: Station[];
}

export default function RouteTimeline({ segments, interchanges }: RouteTimelineProps) {
  const isInterchange = (stationId: string) => {
    return interchanges.some(i => i.id === stationId);
  };

  return (
    <div className="relative pl-2 py-2">
      {/* Vertical connecting line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
      
      {segments.map((segment, segIdx) => (
        <div key={segIdx} className="relative mb-4 last:mb-0">
          {/* Segment Start Station */}
          <div className="relative flex gap-4 mb-3">
            <div className="z-10 flex flex-col items-center">
              <div 
                className="size-4 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"
                style={{ backgroundColor: segment.lineColor }}
              />
              {segIdx < segments.length - 1 && (
                <div 
                  className="w-1 h-12 mt-1"
                  style={{ backgroundColor: segment.lineColor }}
                />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide"
                  style={{ backgroundColor: segment.lineColor }}
                >
                  {segment.lineName}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {segment.from.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Icon name="radio_button_checked" className="text-[12px]" />
                  {segment.stations.length} stops
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon name="schedule" className="text-[12px]" />
                  ~{Math.ceil(segment.stations.length * 2)} min
                </span>
              </div>
            </div>
          </div>

          {/* Intermediate Stations (collapsed) */}
          {segment.stations.length > 2 && (
            <div className="relative flex gap-4 mb-3 ml-2">
              <div className="z-10 flex flex-col items-center">
                <div className="flex flex-col gap-1">
                  {segment.stations.slice(1, -1).map((station, idx) => (
                    <div 
                      key={station.id}
                      className="size-2 rounded-full"
                      style={{ backgroundColor: segment.lineColor }}
                      title={station.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  via {segment.stations.slice(1, -1).map(s => s.name).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Interchange Station (if not last segment) */}
          {segIdx < segments.length - 1 && (
            <div className="relative flex gap-4 mb-3 ml-2">
              <div className="z-10 flex flex-col items-center">
                <div className="size-7 rounded-full bg-white dark:bg-slate-800 border-2 border-orange-500 dark:border-orange-400 flex items-center justify-center shadow-md">
                  <Icon name="sync_alt" className="text-[16px] text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    Transfer at {segment.to.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[12px]" />
                    ~3 min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Icon name="stairs" className="text-[12px]" />
                    Platform {Math.floor(Math.random() * 4) + 1}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Segment End Station (only for last segment) */}
          {segIdx === segments.length - 1 && (
            <div className="relative flex gap-4">
              <div className="z-10 flex flex-col items-center">
                <div 
                  className="size-5 rounded-full border-4 border-white dark:border-slate-800 shadow-md"
                  style={{ backgroundColor: segment.lineColor }}
                >
                  <div className="size-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Icon name="location_on" className="text-[12px]" style={{ color: segment.lineColor }} />
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {segment.to.name}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arrival
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

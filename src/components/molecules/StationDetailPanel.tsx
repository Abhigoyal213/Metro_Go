import { Station, MetroLine } from '../../types/network.types';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import Card from '../atoms/Card';

interface StationDetailPanelProps {
  station: Station;
  lines: MetroLine[];
  isInterchange: boolean;
  onClose: () => void;
  onBookFrom: () => void;
  onBookTo: () => void;
  hasSourceSelected?: boolean;
  hasDestSelected?: boolean;
  isCurrentSource?: boolean;
  isCurrentDest?: boolean;
}

export default function StationDetailPanel({
  station,
  lines,
  isInterchange,
  onClose,
  onBookFrom,
  onBookTo,
  hasSourceSelected = false,
  hasDestSelected = false,
  isCurrentSource = false,
  isCurrentDest = false
}: StationDetailPanelProps) {
  // Mock facilities data - in real app, this would come from station data
  const facilities = [
    { icon: 'accessible', label: 'Wheelchair Access', available: true },
    { icon: 'local_parking', label: 'Parking', available: true },
    { icon: 'elevator', label: 'Elevator', available: true },
    { icon: 'stairs', label: 'Multiple Exits', available: true },
    { icon: 'wc', label: 'Restrooms', available: false },
    { icon: 'local_cafe', label: 'Cafe', available: false }
  ];

  // Determine button states
  const bookFromDisabled = isCurrentSource || hasSourceSelected;
  const bookToDisabled = isCurrentDest || !hasSourceSelected;
  
  const getBookFromLabel = () => {
    if (isCurrentSource) return 'Current Source';
    if (hasSourceSelected) return 'Source Already Set';
    return 'Book from here';
  };
  
  const getBookToLabel = () => {
    if (isCurrentDest) return 'Current Destination';
    if (!hasSourceSelected) return 'Select Source First';
    return 'Book to here';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 pointer-events-auto animate-slideUp">
        <Card className="p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {station.name}
                </h3>
                {isInterchange && (
                  <Badge variant="warning" className="text-xs">
                    <Icon name="swap_horiz" className="text-sm" />
                    Interchange
                  </Badge>
                )}
              </div>
              
              {/* Lines */}
              <div className="flex flex-wrap gap-2">
                {lines.map(line => (
                  <div 
                    key={line.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: line.color }}
                  >
                    <span 
                      className="size-2 rounded-full bg-white/30"
                    />
                    {line.name}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Close"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant={isCurrentSource ? "secondary" : (hasSourceSelected ? "secondary" : "primary")}
              size="md"
              onClick={onBookFrom}
              disabled={bookFromDisabled}
              className="w-full"
            >
              <Icon name={isCurrentSource ? "check_circle" : (hasSourceSelected ? "block" : "trip_origin")} />
              {getBookFromLabel()}
            </Button>
            <Button
              variant={isCurrentDest ? "secondary" : (hasSourceSelected ? "primary" : "secondary")}
              size="md"
              onClick={onBookTo}
              disabled={bookToDisabled}
              className="w-full"
            >
              <Icon name={isCurrentDest ? "check_circle" : (hasSourceSelected ? "location_on" : "lock")} />
              {getBookToLabel()}
            </Button>
          </div>

          {/* Helper text */}
          {hasSourceSelected && !hasDestSelected && !isCurrentSource && !isCurrentDest && (
            <div className="mb-4 -mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Icon name="info" className="text-sm" />
                Now click "Book to here" to set your destination
              </p>
            </div>
          )}
          
          {!hasSourceSelected && !isCurrentSource && (
            <div className="mb-4 -mt-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                <Icon name="info" className="text-sm" />
                Click "Book from here" to start your journey
              </p>
            </div>
          )}

          {/* Facilities */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Icon name="info" className="text-lg" />
              Station Facilities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {facilities.map((facility, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    facility.available
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <Icon 
                    name={facility.icon} 
                    className={`text-lg ${facility.available ? '' : 'opacity-50'}`}
                  />
                  <span className="text-xs font-medium">
                    {facility.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Icon name="schedule" className="text-sm" />
              <span>Operating Hours: 5:00 AM - 12:00 AM</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

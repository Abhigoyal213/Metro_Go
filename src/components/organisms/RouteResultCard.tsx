import { useState } from 'react';
import { ComputedRoute } from '../../types/network.types';
import { calculateFare } from '../../services/routeService';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import RouteTimeline from '../molecules/RouteTimeline';

interface RouteResultCardProps {
  route: ComputedRoute;
  isRecommended?: boolean;
  onBook: () => void;
  onCancel: () => void;
}

export default function RouteResultCard({ route, isRecommended = false, onBook, onCancel }: RouteResultCardProps) {
  const [showDetails, setShowDetails] = useState(isRecommended);
  const fare = calculateFare(route);

  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all ${
        isRecommended 
          ? 'border-primary/30 ring-2 ring-primary/10 shadow-md' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Route Summary Header */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex justify-between items-start mb-3">
          {/* Time and Fare */}
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {route.duration}
              </span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                minutes
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                ${fare.toFixed(2)}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                {route.totalStations} stations
              </span>
            </div>
          </div>

          {/* Badges and Expand Icon */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {route.interchanges.length > 0 && (
                <Badge variant="warning">
                  <Icon name="sync_alt" className="text-[10px]" />
                  {route.interchanges.length} Transfer{route.interchanges.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Icon 
              name={showDetails ? "expand_less" : "expand_more"} 
              className="text-slate-400 dark:text-slate-500"
            />
          </div>
        </div>

        {/* Line Segments Preview */}
        <div className="flex items-center gap-2 flex-wrap">
          {route.segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <div 
                className="px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wide"
                style={{ backgroundColor: segment.lineColor }}
              >
                {segment.lineName}
              </div>
              {idx < route.segments.length - 1 && (
                <Icon name="arrow_forward" className="text-[12px] text-slate-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <div className="p-5">
            {/* Route Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Icon name="schedule" className="text-[14px]" />
                  Duration
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {route.duration}m
                </div>
              </div>
              <div className="text-center border-x border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Icon name="train" className="text-[14px]" />
                  Stops
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {route.totalStations}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Icon name="payments" className="text-[14px]" />
                  Fare
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  ${fare.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Journey Details
              </h4>
              <RouteTimeline 
                segments={route.segments} 
                interchanges={route.interchanges}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="md" 
                className="flex-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                <Icon name="close" />
                Cancel Search
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
              >
                <Icon name="confirmation_number" />
                Book Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

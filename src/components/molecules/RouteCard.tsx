import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface RouteSegment {
  lineColor: string;
  from: string;
  to: string;
  stops: number;
  duration: number;
  interchange?: boolean;
}

interface RouteCardProps {
  totalTime: number;
  price: number;
  transfers: number;
  segments: RouteSegment[];
  onBook?: () => void;
}

export default function RouteCard({ totalTime, price, transfers, segments, onBook }: RouteCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-primary/20 ring-1 ring-primary/5 hover:shadow-md transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {totalTime} <span className="text-sm font-normal text-slate-500">min</span>
            </span>
            <span className="text-sm font-medium text-slate-400">•</span>
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">₹{price.toFixed(0)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {transfers > 0 && (
            <Badge variant="warning">{transfers} Transfer{transfers > 1 ? 's' : ''}</Badge>
          )}
        </div>
      </div>

      <div className="relative pl-2 py-2">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
        
        {segments.map((segment, idx) => (
          <div key={idx} className="relative flex gap-4 mb-4">
            <div className="z-10 flex flex-col items-center">
              <div 
                className="size-4 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"
                style={{ backgroundColor: segment.lineColor }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{segment.from}</p>
              <p className="text-xs text-slate-500">{segment.stops} stops • {segment.duration} min</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
        <Button variant="secondary" size="md" className="flex-1">
          Details
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onBook}>
          Book Ticket
        </Button>
      </div>
    </div>
  );
}

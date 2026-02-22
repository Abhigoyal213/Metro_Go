import { RecentSearch } from '../../hooks/useRecentSearches';
import Icon from '../atoms/Icon';

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (from: string, to: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
          Recent Searches
        </p>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search.from, search.to)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
          >
            <Icon name="history" className="text-slate-400 dark:text-slate-500 text-[18px]" />
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="truncate">{search.from}</span>
                <Icon name="arrow_forward" className="text-[14px] text-slate-400 flex-shrink-0" />
                <span className="truncate">{search.to}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {formatTime(search.timestamp)}
              </p>
            </div>
            <Icon name="chevron_right" className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

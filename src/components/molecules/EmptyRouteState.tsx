import Icon from '../atoms/Icon';

interface EmptyRouteStateProps {
  type: 'no-selection' | 'no-route' | 'loading';
  sourceStation?: string;
  destStation?: string;
}

export default function EmptyRouteState({ type, sourceStation, destStation }: EmptyRouteStateProps) {
  if (type === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
          Finding best routes...
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Calculating optimal paths
        </p>
      </div>
    );
  }

  if (type === 'no-route') {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
          <Icon name="wrong_location" className="text-4xl" />
        </div>
        <p className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-2">
          No Route Found
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          We couldn't find a route between
        </p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          {sourceStation} → {destStation}
        </p>
        <div className="max-w-sm mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Suggestions:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-[14px] text-primary mt-0.5 flex-shrink-0" />
                <span>Try different stations</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-[14px] text-primary mt-0.5 flex-shrink-0" />
                <span>Check if stations are on connected lines</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-[14px] text-primary mt-0.5 flex-shrink-0" />
                <span>View network map for available routes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // type === 'no-selection'
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
        <Icon name="search" className="text-4xl" />
      </div>
      <p className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-2">
        Start Planning Your Journey
      </p>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Select source and destination stations to find routes
      </p>
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3 text-left">
            <Icon name="lightbulb" className="text-primary text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Quick Tip
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Use the autocomplete to quickly find stations. Interchange stations are marked with a special badge!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

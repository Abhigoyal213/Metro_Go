import { useEffect, useRef } from 'react';
import Icon from '../atoms/Icon';

interface MetroMapProps {
  highlightedRoute?: string[];
}

export default function MetroMap({ highlightedRoute = [] }: MetroMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <section className="flex-1 relative bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Icon name="add" />
        </button>
        <button className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Icon name="remove" />
        </button>
        <button className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mt-2">
          <Icon name="my_location" />
        </button>
      </div>

      <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10 max-w-[200px]">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Network Lines</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-line-red"></span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Line 1 (Central)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-line-green"></span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Line 2 (East)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-line-blue"></span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Line 3 (Airport)</span>
          </div>
        </div>
      </div>

      <div className="w-full h-full cursor-grab active:cursor-grabbing bg-[#eef2f6] dark:bg-[#0f172a] relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full absolute inset-0" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path className="text-slate-300/20 dark:text-slate-700/20" d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <path className="opacity-30" d="M 100 200 L 300 200 L 500 400 L 800 400" fill="none" stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
          <path className="metro-line-animate" d="M 300 200 L 500 400" fill="none" stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
          
          <path className="opacity-30" d="M 200 100 L 200 500 L 400 700" fill="none" stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
          
          <path className="opacity-30" d="M 500 100 L 500 400 L 500 700 L 700 700" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
          <path className="metro-line-animate" d="M 500 400 L 500 700 L 700 700" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />

          <g transform="translate(300, 200)">
            <circle className="dark:fill-slate-900" fill="white" r="12" stroke="#ef4444" strokeWidth="4" />
            <circle fill="#ef4444" r="4" />
          </g>

          <g transform="translate(500, 400)">
            <circle className="dark:fill-slate-900" fill="white" r="16" stroke="#3b82f6" strokeWidth="4" />
            <circle fill="none" r="12" stroke="#ef4444" strokeWidth="4" />
          </g>

          <g transform="translate(700, 700)">
            <circle className="dark:stroke-slate-900 animate-pulse" fill="#3b82f6" r="14" stroke="white" strokeWidth="4" />
          </g>

          <circle className="dark:fill-slate-900" cx="100" cy="200" fill="white" r="8" stroke="#ef4444" strokeWidth="3" />
          <circle className="dark:fill-slate-900" cx="800" cy="400" fill="white" r="8" stroke="#ef4444" strokeWidth="3" />
          <circle className="dark:fill-slate-900" cx="200" cy="100" fill="white" r="8" stroke="#22c55e" strokeWidth="3" />
          <circle className="dark:fill-slate-900" cx="200" cy="500" fill="white" r="8" stroke="#22c55e" strokeWidth="3" />
          <circle className="dark:fill-slate-900" cx="500" cy="100" fill="white" r="8" stroke="#3b82f6" strokeWidth="3" />
        </svg>
      </div>
    </section>
  );
}

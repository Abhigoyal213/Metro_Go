import { useState } from 'react';
import Input from '../atoms/Input';
import Icon from '../atoms/Icon';

interface StationSearchProps {
  source: string;
  destination: string;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSwap: () => void;
  onSearch: () => void;
}

export default function StationSearch({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSwap,
  onSearch,
}: StationSearchProps) {
  return (
    <div className="relative flex flex-col gap-4">
      <Input
        label="From"
        icon="trip_origin"
        placeholder="Station, Landmark or Address"
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
      />

      <button
        onClick={onSwap}
        className="absolute top-[38%] right-6 size-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center text-primary hover:bg-slate-50 dark:hover:bg-slate-600 hover:rotate-180 transition-all duration-300 z-10"
        aria-label="Swap locations"
      >
        <Icon name="swap_vert" />
      </button>

      <Input
        label="To"
        icon="location_on"
        placeholder="Station, Landmark or Address"
        value={destination}
        onChange={(e) => onDestinationChange(e.target.value)}
      />

      <button
        onClick={onSearch}
        className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        <Icon name="search" />
        Find Route
      </button>
    </div>
  );
}

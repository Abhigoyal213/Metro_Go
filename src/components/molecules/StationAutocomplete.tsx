import { useState, useRef, useEffect } from 'react';
import { Station, MetroNetwork } from '../../types/network.types';
import { searchStations, getLineByStation, detectInterchanges } from '../../services/networkService';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

interface StationAutocompleteProps {
  network: MetroNetwork | null;
  value: string;
  placeholder: string;
  label: string;
  icon: string;
  onSelect: (station: Station) => void;
  onChange: (value: string) => void;
  selectedStation: Station | null;
}

export default function StationAutocomplete({
  network,
  value,
  placeholder,
  label,
  icon,
  onSelect,
  onChange,
  selectedStation
}: StationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const interchanges = network ? detectInterchanges(network) : [];

  useEffect(() => {
    if (!network || selectedStation) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!value) {
      // Show all stations when input is empty
      const allStations: Station[] = [];
      network.lines.forEach(line => {
        line.stations.forEach(station => {
          // Avoid duplicates (for interchange stations)
          if (!allStations.find(s => s.id === station.id)) {
            allStations.push(station);
          }
        });
      });
      // Sort alphabetically
      allStations.sort((a, b) => a.name.localeCompare(b.name));
      setSuggestions(allStations);
      return;
    }

    const results = searchStations(network, value);
    setSuggestions(results.slice(0, 8));
    setShowSuggestions(results.length > 0);
    setFocusedIndex(-1);
  }, [value, network, selectedStation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (selectedStation) {
      onSelect(null as any);
    }
  };

  const handleSelectStation = (station: Station) => {
    onSelect(station);
    onChange(station.name);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSelectStation(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const isInterchange = (stationId: string) => {
    return interchanges.some(i => i.id === stationId);
  };

  const getStationLines = (stationId: string) => {
    if (!network) return [];
    return network.lines.filter(line => 
      line.stations.some(s => s.id === stationId)
    );
  };

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined">
          {icon}
        </span>
        <input
          ref={inputRef}
          type="text"
          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (!selectedStation) {
              setShowSuggestions(true);
            }
          }}
          onClick={() => {
            if (!selectedStation) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {selectedStation && (
          <button
            onClick={() => {
              onSelect(null as any);
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear selection"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[100] max-h-80 overflow-y-auto custom-scrollbar"
        >
          {suggestions.map((station, index) => {
            const lines = getStationLines(station.id);
            const interchange = isInterchange(station.id);
            const isFocused = index === focusedIndex;

            return (
              <div
                key={station.id}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  isFocused
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleSelectStation(station)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Line Color Indicators */}
                    <div className="flex gap-1 flex-shrink-0">
                      {lines.map(line => (
                        <div
                          key={line.id}
                          className="size-3 rounded-full border-2 border-white dark:border-slate-800"
                          style={{ backgroundColor: line.color }}
                          title={line.name}
                        />
                      ))}
                    </div>

                    {/* Station Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {station.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {lines.map(l => l.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Interchange Badge */}
                  {interchange && (
                    <Badge variant="warning" size="sm">
                      <Icon name="sync_alt" className="text-[10px]" />
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

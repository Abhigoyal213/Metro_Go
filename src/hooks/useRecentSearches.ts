import { useState, useEffect } from 'react';

export interface RecentSearch {
  from: string;
  to: string;
  timestamp: number;
}

const STORAGE_KEY = 'metro_recent_searches';
const MAX_RECENT = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const searches = JSON.parse(stored) as RecentSearch[];
        setRecentSearches(searches);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const addRecentSearch = (from: string, to: string) => {
    const newSearch: RecentSearch = {
      from,
      to,
      timestamp: Date.now()
    };

    setRecentSearches(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        search => !(search.from === from && search.to === to)
      );

      // Add new search at the beginning
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches:', error);
      }

      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  };
}

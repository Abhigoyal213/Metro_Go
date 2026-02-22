import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/molecules/Header';
import StationAutocomplete from '../components/molecules/StationAutocomplete';
import RecentSearches from '../components/molecules/RecentSearches';
import EmptyRouteState from '../components/molecules/EmptyRouteState';
import RouteResultCard from '../components/organisms/RouteResultCard';
import StationDetailPanel from '../components/molecules/StationDetailPanel';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import DynamicMetroMap from '../components/organisms/DynamicMetroMap';
import { useBookingStore } from '../store/bookingStore';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useAuth } from '../hooks/useAuth';
import { MetroNetwork, ComputedRoute, Station } from '../types/network.types';
import { loadNetwork, getAllStations, getLineByStation, detectInterchanges, clearCachedNetwork } from '../services/networkService';
import { findShortestPath } from '../services/routeService';

export default function PassengerBooking() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setSource, setDestination, setRoute, setBookingRef } = useBookingStore();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  
  const [network, setNetwork] = useState<MetroNetwork | null>(null);
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceStation, setSourceStation] = useState<Station | null>(null);
  const [destStation, setDestStation] = useState<Station | null>(null);
  const [routes, setRoutes] = useState<ComputedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<ComputedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [clickedStation, setClickedStation] = useState<Station | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);

  useEffect(() => {
    // Clear cache and reload network to get latest changes
    clearCachedNetwork();
    loadNetwork().then(net => {
      setNetwork(net);
    });
  }, []);

  const handleSwap = () => {
    setSwapping(true);
    
    // Swap queries and stations
    const tempQuery = sourceQuery;
    const tempStation = sourceStation;
    
    setSourceQuery(destQuery);
    setSourceStation(destStation);
    setDestQuery(tempQuery);
    setDestStation(tempStation);
    
    // Reset animation after delay
    setTimeout(() => setSwapping(false), 300);
  };

  const handleSearch = () => {
    if (!network || !sourceStation || !destStation) return;
    
    setLoading(true);
    
    // Add to recent searches
    addRecentSearch(sourceStation.name, destStation.name);
    
    setTimeout(() => {
      const route = findShortestPath(network, sourceStation.id, destStation.id);
      if (route) {
        setRoutes([route]);
        setSelectedRoute(route);
      } else {
        setRoutes([]);
        setSelectedRoute(null);
      }
      setLoading(false);
    }, 300);
  };

  const handleRecentSearchSelect = (from: string, to: string) => {
    if (!network) return;
    
    // Find stations by name
    const allStations = getAllStations(network);
    const fromStation = allStations.find(s => s.name === from);
    const toStation = allStations.find(s => s.name === to);
    
    if (fromStation && toStation) {
      setSourceStation(fromStation);
      setSourceQuery(from);
      setDestStation(toStation);
      setDestQuery(to);
      
      // Auto-search
      setTimeout(() => {
        const route = findShortestPath(network, fromStation.id, toStation.id);
        if (route) {
          setRoutes([route]);
          setSelectedRoute(route);
        }
      }, 100);
    }
  };

  const handleStationClick = (stationId: string) => {
    if (!network) return;
    const allStations = getAllStations(network);
    const station = allStations.find(s => s.id === stationId);
    if (station) {
      setClickedStation(station);
    }
  };

  const handleBookFromStation = () => {
    if (!clickedStation) return;
    setSourceStation(clickedStation);
    setSourceQuery(clickedStation.name);
    setClickedStation(null);
    
    // If destination is already set, auto-search
    if (destStation && network) {
      setTimeout(() => {
        const route = findShortestPath(network, clickedStation.id, destStation.id);
        if (route) {
          setRoutes([route]);
          setSelectedRoute(route);
        }
      }, 100);
    }
  };

  const handleBookToStation = () => {
    if (!clickedStation || !network) return;
    setDestStation(clickedStation);
    setDestQuery(clickedStation.name);
    setClickedStation(null);
    
    // If source is already set, auto-search
    if (sourceStation) {
      setTimeout(() => {
        const route = findShortestPath(network, sourceStation.id, clickedStation.id);
        if (route) {
          setRoutes([route]);
          setSelectedRoute(route);
          // Add to recent searches
          addRecentSearch(sourceStation.name, clickedStation.name);
        }
      }, 100);
    }
  };

  const handleCancelSearch = () => {
    // Clear all search states
    setSourceStation(null);
    setDestStation(null);
    setSourceQuery('');
    setDestQuery('');
    setRoutes([]);
    setSelectedRoute(null);
  };

  const getStationLines = (stationId: string) => {
    if (!network) return [];
    return network.lines.filter(line => 
      line.stations.some(s => s.id === stationId)
    );
  };

  const isStationInterchange = (stationId: string) => {
    if (!network) return false;
    const interchanges = detectInterchanges(network);
    return interchanges.some(i => i.id === stationId);
  };

  const handleBook = (route: ComputedRoute) => {
    if (!sourceStation || !destStation) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store booking data before redirecting to login
      setSource(sourceStation.name);
      setDestination(destStation.name);
      setRoute(route);
      setBookingRef(`MTR${Date.now()}`);
      navigate('/login');
      return;
    }
    
    setSource(sourceStation.name);
    setDestination(destStation.name);
    setRoute(route);
    setBookingRef(`MTR${Date.now()}`);
    navigate('/confirmation');
  };

  const highlightedStations = selectedRoute 
    ? selectedRoute.segments.flatMap(seg => seg.stations.map(s => s.id))
    : [];

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Collapsible on mobile, fixed on desktop */}
        <aside className="w-full lg:w-[480px] bg-surface-light dark:bg-surface-dark lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl overflow-y-auto custom-scrollbar">
          
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="lg:hidden w-full p-4 bg-primary text-white font-semibold flex items-center justify-between hover:bg-primary/90 transition-colors sticky top-0 z-40 shadow-md"
          >
            <div className="flex items-center gap-3">
              <Icon name="route" />
              <span>Plan Your Journey</span>
            </div>
            <Icon name={isSearchExpanded ? "expand_less" : "expand_more"} />
          </button>

          {/* Collapsible Search Section */}
          <div className={`lg:block ${isSearchExpanded ? 'block' : 'hidden'}`}>
            {/* Search Section - Sticky on desktop */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 lg:sticky lg:top-0 z-30 bg-surface-light dark:bg-surface-dark">
              <h1 className="hidden lg:block text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Plan your journey</h1>
              
              <div className="relative flex flex-col gap-4">
                {/* Source Autocomplete */}
                <div className={`relative transition-all duration-300 ${swapping ? 'translate-y-[120px] z-10' : 'translate-y-0 z-20'}`}>
                  <StationAutocomplete
                    network={network}
                    value={sourceQuery}
                    placeholder="Search station, landmark..."
                    label="From"
                    icon="trip_origin"
                    onSelect={setSourceStation}
                    onChange={setSourceQuery}
                    selectedStation={sourceStation}
                  />
                </div>

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={swapping}
                  className={`absolute top-[38%] right-6 size-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center text-primary hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300 z-30 ${
                    swapping ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                  } hover:rotate-180 hover:scale-110`}
                  aria-label="Swap locations"
                >
                  <Icon name="swap_vert" />
                </button>

                {/* Destination Autocomplete */}
                <div className={`relative transition-all duration-300 ${swapping ? '-translate-y-[120px] z-20' : 'translate-y-0 z-10'}`}>
                  <StationAutocomplete
                    network={network}
                    value={destQuery}
                    placeholder="Search station, landmark..."
                    label="To"
                    icon="location_on"
                    onSelect={setDestStation}
                    onChange={setDestQuery}
                    selectedStation={destStation}
                  />
                </div>

                {/* Search Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handleSearch}
                  disabled={!sourceStation || !destStation || loading}
                >
                  {loading ? (
                    <>
                      <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Finding Routes...
                    </>
                  ) : (
                    <>
                      <Icon name="search" />
                      Find Route
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Recent Searches - Scrollable Area */}
            {recentSearches.length > 0 && (
              <div className="px-6 pt-6 border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark">
                <RecentSearches
                  searches={recentSearches}
                  onSelect={handleRecentSearchSelect}
                  onClear={clearRecentSearches}
                />
              </div>
            )}

            {/* Results Section */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20">
              {loading && (
                <EmptyRouteState type="loading" />
              )}

              {!loading && routes.length > 0 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {routes.length} Route{routes.length > 1 ? 's' : ''} Found
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {sourceStation?.name} → {destStation?.name}
                    </span>
                  </div>
                  
                  {routes.map((route, idx) => (
                    <RouteResultCard
                      key={idx}
                      route={route}
                      isRecommended={idx === 0}
                      onBook={() => handleBook(route)}
                      onCancel={handleCancelSearch}
                    />
                  ))}
                </div>
              )}
              
              {!loading && routes.length === 0 && sourceStation && destStation && (
                <EmptyRouteState 
                  type="no-route" 
                  sourceStation={sourceStation.name}
                  destStation={destStation.name}
                />
              )}

              {!loading && !sourceStation && !destStation && routes.length === 0 && (
                <EmptyRouteState type="no-selection" />
              )}
            </div>
          </div>

          {/* Map Section - Mobile Only (appears after route results in scroll) */}
          <div className="lg:hidden flex-1 min-h-[400px]">
            <DynamicMetroMap 
              network={network} 
              highlightedRoute={highlightedStations}
              selectedRoute={selectedRoute}
              onStationClick={handleStationClick}
              sourceStationId={sourceStation?.id}
              destStationId={destStation?.id}
            />
          </div>
        </aside>

        {/* Map Section - Desktop Only (right side) */}
        <div className="hidden lg:block lg:flex-1 bg-slate-200 dark:bg-slate-900">
          <div className="h-full w-full">
            <DynamicMetroMap 
              network={network} 
              highlightedRoute={highlightedStations}
              selectedRoute={selectedRoute}
              onStationClick={handleStationClick}
              sourceStationId={sourceStation?.id}
              destStationId={destStation?.id}
            />
          </div>
        </div>

        {/* Station Detail Panel */}
        {clickedStation && network && (
          <StationDetailPanel
            station={clickedStation}
            lines={getStationLines(clickedStation.id)}
            isInterchange={isStationInterchange(clickedStation.id)}
            onClose={() => setClickedStation(null)}
            onBookFrom={handleBookFromStation}
            onBookTo={handleBookToStation}
            hasSourceSelected={!!sourceStation}
            hasDestSelected={!!destStation}
            isCurrentSource={sourceStation?.id === clickedStation.id}
            isCurrentDest={destStation?.id === clickedStation.id}
          />
        )}
      </main>
    </div>
  );
}

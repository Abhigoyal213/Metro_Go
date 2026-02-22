import { useState, useEffect } from 'react';
import Header from '../components/molecules/Header';
import DynamicMetroMap from '../components/organisms/DynamicMetroMap';
import Badge from '../components/atoms/Badge';
import Icon from '../components/atoms/Icon';
import { MetroNetwork } from '../types/network.types';
import { loadNetwork, detectInterchanges } from '../services/networkService';

interface LineStatus {
  id: string;
  name: string;
  color: string;
  status: 'operational' | 'delayed' | 'disrupted';
  message?: string;
}

export default function NetworkStatus() {
  const [network, setNetwork] = useState<MetroNetwork | null>(null);
  const [lineStatuses, setLineStatuses] = useState<LineStatus[]>([]);

  useEffect(() => {
    loadNetwork().then(net => {
      setNetwork(net);
      
      // Initialize line statuses from network data
      const statuses: LineStatus[] = net.lines.map(line => ({
        id: line.id,
        name: line.name,
        color: line.color,
        status: 'operational' as const,
        message: undefined
      }));
      
      // Simulate some delays for demo
      if (statuses.length > 1) {
        statuses[1].status = 'delayed';
        statuses[1].message = 'Minor delays due to signal maintenance';
      }
      
      setLineStatuses(statuses);
    });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="success">Operational</Badge>;
      case 'delayed':
        return <Badge variant="warning">Delayed</Badge>;
      case 'disrupted':
        return <Badge variant="warning">Disrupted</Badge>;
      default:
        return <Badge variant="info">Unknown</Badge>;
    }
  };

  const interchanges = network ? detectInterchanges(network) : [];

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Full width on mobile, fixed width on desktop */}
        <aside className="w-full lg:w-[400px] bg-surface-light dark:bg-surface-dark lg:border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Network Status</h1>
            
            {/* Line Status Cards */}
            <div className="space-y-4 mb-8">
              {lineStatuses.map((line) => (
                <div key={line.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="size-4 rounded-full" style={{ backgroundColor: line.color }}></span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{line.name}</h3>
                    </div>
                    {getStatusBadge(line.status)}
                  </div>
                  {line.message && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 ml-7">{line.message}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Interchange Stations */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-8">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Icon name="sync_alt" />
                Interchange Stations
              </h3>
              <div className="space-y-2">
                {interchanges.map(interchange => (
                  <div key={interchange.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{interchange.name}</span>
                    <div className="flex gap-1">
                      {interchange.lines.map(lineId => {
                        const line = network?.lines.find(l => l.id === lineId);
                        return line ? (
                          <span 
                            key={lineId}
                            className="size-3 rounded-full"
                            style={{ backgroundColor: line.color }}
                            title={line.name}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Updates */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-8">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Icon name="info" />
                Service Updates
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p>• All stations are operating normally</p>
                <p>• Total stations: {network ? network.lines.reduce((sum, line) => {
                  const uniqueStations = new Set(line.stations.map(s => s.id));
                  return sum + uniqueStations.size;
                }, 0) : 0}</p>
                <p>• Interchange points: {interchanges.length}</p>
                <p>• Next scheduled maintenance: Sunday 2:00 AM</p>
              </div>
            </div>
          </div>

          {/* Map Section - Mobile Only (appears after status info in scroll) */}
          <div className="lg:hidden h-[500px] border-t border-slate-200 dark:border-slate-800">
            <DynamicMetroMap network={network} />
          </div>
        </aside>

        {/* Map Section - Desktop Only (right side) */}
        <div className="hidden lg:block lg:flex-1 bg-slate-200 dark:bg-slate-900">
          <div className="h-full w-full">
            <DynamicMetroMap network={network} />
          </div>
        </div>
      </main>
    </div>
  );
}

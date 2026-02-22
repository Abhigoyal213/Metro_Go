import { useState, useEffect } from 'react';
import Header from '../components/molecules/Header';
import LineManagementCard from '../components/organisms/LineManagementCard';
import BulkImportModal from '../components/organisms/BulkImportModal';
import VersionCompatibilityMatrix from '../components/organisms/VersionCompatibilityMatrix';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import { MetroNetwork, Station, MetroLine } from '../types/network.types';
import { loadNetwork, getAllStations, detectInterchanges, saveNetwork, resetNetworkToDefault, clearCachedNetwork } from '../services/networkService';

export default function AdminDashboard() {
  const [network, setNetwork] = useState<MetroNetwork | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    loadNetwork().then(net => {
      setNetwork(net);
    });
  }, []);

  const handleUpdateLine = (updatedLine: MetroLine) => {
    if (!network) return;

    const newNetwork = {
      ...network,
      lines: network.lines.map(line =>
        line.id === updatedLine.id ? updatedLine : line
      )
    };

    setNetwork(newNetwork);
    saveNetwork(newNetwork);
    showSuccess('Line updated successfully');
  };

  const handleDeleteStation = (lineId: string, stationId: string) => {
    if (!network) return;

    const newNetwork = {
      ...network,
      lines: network.lines.map(line => {
        if (line.id === lineId) {
          return {
            ...line,
            stations: line.stations.filter(s => s.id !== stationId)
          };
        }
        return line;
      })
    };

    setNetwork(newNetwork);
    saveNetwork(newNetwork);
    showSuccess('Station removed successfully');
  };

  const handleBulkImport = (importedNetwork: MetroNetwork) => {
    setNetwork(importedNetwork);
    saveNetwork(importedNetwork);
    setShowBulkImport(false);
    showSuccess('Network imported successfully!');
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedNetwork: MetroNetwork = JSON.parse(e.target?.result as string);
        
        // Validate structure
        const validationErrors: string[] = [];
        
        if (!uploadedNetwork.lines || !Array.isArray(uploadedNetwork.lines)) {
          validationErrors.push('Invalid network structure: missing lines array');
        } else {
          uploadedNetwork.lines.forEach((line, idx) => {
            if (!line.id || !line.name || !line.color) {
              validationErrors.push(`Line ${idx + 1}: missing required fields (id, name, color)`);
            }
            if (!line.stations || !Array.isArray(line.stations)) {
              validationErrors.push(`Line ${line.name || idx + 1}: missing stations array`);
            } else {
              line.stations.forEach((station, sIdx) => {
                if (!station.id || !station.name || station.x === undefined || station.y === undefined) {
                  validationErrors.push(`Line ${line.name}, Station ${sIdx + 1}: missing required fields`);
                }
              });
            }
          });
        }
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setNetwork(uploadedNetwork);
          saveNetwork(uploadedNetwork);
          setErrors([]);
          showSuccess('Network data uploaded and saved successfully!');
        }
      } catch (err) {
        setErrors(['Invalid JSON format']);
      }
    };
    reader.readAsText(file);
  };

  const handleResetNetwork = () => {
    if (confirm('Are you sure you want to reset the network to default? All changes will be lost.')) {
      resetNetworkToDefault();
      clearCachedNetwork();
      // Reload the page to fetch default network
      window.location.reload();
    }
  };

  const handleExportNetwork = () => {
    if (!network) return;

    const dataStr = JSON.stringify(network, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metro-network-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Network exported successfully');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (!network) {
    return (
      <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading network data...</div>
        </main>
      </div>
    );
  }

  const allStations = getAllStations(network);
  const interchanges = detectInterchanges(network);
  const interchangeStationIds = interchanges.map(i => i.id);

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Metro Network Management
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage lines, stations, and network configuration
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="md" 
                onClick={handleResetNetwork}
                className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <Icon name="refresh" />
                Reset to Default
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setShowBulkImport(true)}
              >
                <Icon name="upload_file" />
                Bulk Import
              </Button>
              <label className="cursor-pointer">
                <input type="file" accept=".json" onChange={handleBulkUpload} className="hidden" />
                <Button variant="secondary" size="md" as="span">
                  <Icon name="upload" />
                  Quick Upload
                </Button>
              </label>
              <Button variant="primary" size="md" onClick={handleExportNetwork}>
                <Icon name="download" />
                Export Network
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 animate-fadeIn">
              <Icon name="check_circle" className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {successMessage}
              </span>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
                <Icon name="error" />
                Validation Errors
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Network Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon name="route" className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {network.lines.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Metro Lines</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Icon name="location_on" className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {allStations.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Stations</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Icon name="swap_horiz" className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {interchanges.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Interchanges</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Icon name="timeline" className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {network.lines.reduce((sum, line) => sum + (line.stations.length - 1), 0)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Connections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Management Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Icon name="list" />
              Metro Lines & Stations
            </h2>
            {network.lines.map(line => (
              <LineManagementCard
                key={line.id}
                line={line}
                allStations={allStations}
                interchangeStationIds={interchangeStationIds}
                onUpdateLine={handleUpdateLine}
                onDeleteStation={handleDeleteStation}
              />
            ))}
          </div>

          {/* Interchange Stations List */}
          {interchanges.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <Icon name="swap_horiz" />
                Interchange Stations
              </h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {interchanges.map(interchange => (
                    <div
                      key={interchange.id}
                      className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        {interchange.name}
                      </div>
                      <div className="flex gap-1">
                        {interchange.lines.map(lineId => {
                          const line = network.lines.find(l => l.id === lineId);
                          return line ? (
                            <div
                              key={lineId}
                              className="px-2 py-1 rounded text-xs font-bold text-white"
                              style={{ backgroundColor: line.color }}
                            >
                              {line.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Version Compatibility Matrix */}
          <div className="mt-6">
            <VersionCompatibilityMatrix />
          </div>
        </div>
      </main>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )}
    </div>
  );
}

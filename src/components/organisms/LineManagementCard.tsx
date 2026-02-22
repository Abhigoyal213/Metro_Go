import { useState } from 'react';
import { MetroLine, Station } from '../../types/network.types';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import Card from '../atoms/Card';

interface LineManagementCardProps {
  line: MetroLine;
  allStations: Station[];
  interchangeStationIds: string[];
  onUpdateLine: (line: MetroLine) => void;
  onDeleteStation: (lineId: string, stationId: string) => void;
}

export default function LineManagementCard({
  line,
  allStations,
  interchangeStationIds,
  onUpdateLine,
  onDeleteStation
}: LineManagementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingStation, setIsAddingStation] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [newStationData, setNewStationData] = useState({
    id: '',
    name: '',
    x: 0,
    y: 0
  });

  const checkForDuplicates = (stationData: { id: string; name: string; x: number; y: number }) => {
    // Check if station ID already exists in this line
    const idExistsInLine = line.stations.some(s => s.id === stationData.id);
    if (idExistsInLine) {
      return `Station ID "${stationData.id}" already exists in ${line.name}`;
    }

    // Check if station with same name exists in other lines (potential interchange)
    const sameNameInOtherLines = allStations.filter(s => 
      s.name.toLowerCase() === stationData.name.toLowerCase() && 
      !line.stations.some(ls => ls.id === s.id)
    );

    // Check if station with same coordinates exists
    const sameCoordinates = allStations.filter(s => 
      s.x === stationData.x && 
      s.y === stationData.y &&
      !line.stations.some(ls => ls.id === s.id)
    );

    if (sameNameInOtherLines.length > 0 && sameCoordinates.length > 0) {
      return `INTERCHANGE: Station "${stationData.name}" at (${stationData.x}, ${stationData.y}) exists in other lines. This will create an interchange station.`;
    }

    if (sameNameInOtherLines.length > 0) {
      return `WARNING: Station name "${stationData.name}" exists in other lines but at different coordinates. Consider using the same coordinates for interchange.`;
    }

    if (sameCoordinates.length > 0) {
      const existingStation = sameCoordinates[0];
      return `WARNING: Coordinates (${stationData.x}, ${stationData.y}) already used by "${existingStation.name}". Stations at same location should have the same name for interchange.`;
    }

    return '';
  };

  const handleStationDataChange = (field: string, value: any) => {
    const updatedData = { ...newStationData, [field]: value };
    setNewStationData(updatedData);
    
    // Check for duplicates when all fields are filled
    if (updatedData.id && updatedData.name && (updatedData.x !== 0 || updatedData.y !== 0)) {
      const warning = checkForDuplicates(updatedData);
      setDuplicateWarning(warning);
    } else {
      setDuplicateWarning('');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStations = [...line.stations];
    const draggedStation = newStations[draggedIndex];
    newStations.splice(draggedIndex, 1);
    newStations.splice(index, 0, draggedStation);

    onUpdateLine({ ...line, stations: newStations });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddStation = () => {
    if (!newStationData.id || !newStationData.name) {
      alert('Please fill in station ID and name');
      return;
    }

    // Check if station ID already exists in this line
    if (line.stations.some(s => s.id === newStationData.id)) {
      alert(`Station ID "${newStationData.id}" already exists in ${line.name}. Please use a different ID.`);
      return;
    }

    const newStation: Station = {
      id: newStationData.id,
      name: newStationData.name,
      x: newStationData.x,
      y: newStationData.y
    };

    onUpdateLine({
      ...line,
      stations: [...line.stations, newStation]
    });

    setNewStationData({ id: '', name: '', x: 0, y: 0 });
    setDuplicateWarning('');
    setIsAddingStation(false);
  };

  const handleDeleteStation = (stationId: string) => {
    if (line.stations.length <= 2) {
      alert('A line must have at least 2 stations');
      return;
    }

    if (confirm(`Remove ${line.stations.find(s => s.id === stationId)?.name} from ${line.name}?`)) {
      onDeleteStation(line.id, stationId);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Line Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="size-4 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {line.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {line.stations.length} stations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {line.stations.filter(s => interchangeStationIds.includes(s.id)).length} Interchanges
            </Badge>
            <Icon
              name={isExpanded ? 'expand_less' : 'expand_more'}
              className="text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="p-4">
            {/* Station List */}
            <div className="space-y-2 mb-4">
              {line.stations.map((station, index) => {
                const isInterchange = interchangeStationIds.includes(station.id);
                
                return (
                  <div
                    key={station.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-move ${
                      draggedIndex === index
                        ? 'border-primary bg-primary/5 scale-105'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="drag_indicator" className="text-slate-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[24px]">
                          {index + 1}.
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {station.name}
                        </span>
                        {isInterchange && (
                          <Badge variant="warning" className="text-xs">
                            <Icon name="swap_horiz" className="text-[10px]" />
                            Interchange
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({station.x}, {station.y})
                      </span>
                      <button
                        onClick={() => handleDeleteStation(station.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Station Form */}
            {isAddingStation ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Add New Station
                </h4>
                
                {/* Duplicate Warning */}
                {duplicateWarning && (
                  <div className={`mb-3 p-3 rounded-lg border ${
                    duplicateWarning.startsWith('INTERCHANGE')
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                      : duplicateWarning.startsWith('WARNING')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Icon 
                        name={duplicateWarning.startsWith('INTERCHANGE') ? 'swap_horiz' : 'warning'} 
                        className={`text-lg mt-0.5 ${
                          duplicateWarning.startsWith('INTERCHANGE')
                            ? 'text-orange-600 dark:text-orange-400'
                            : duplicateWarning.startsWith('WARNING')
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      />
                      <p className={`text-xs font-medium ${
                        duplicateWarning.startsWith('INTERCHANGE')
                          ? 'text-orange-700 dark:text-orange-300'
                          : duplicateWarning.startsWith('WARNING')
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {duplicateWarning}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Station ID (e.g., new_station)"
                    value={newStationData.id}
                    onChange={(e) => handleStationDataChange('id', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Station Name"
                    value={newStationData.name}
                    onChange={(e) => handleStationDataChange('name', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="X Coordinate"
                    value={newStationData.x}
                    onChange={(e) => handleStationDataChange('x', Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Y Coordinate"
                    value={newStationData.y}
                    onChange={(e) => handleStationDataChange('y', Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleAddStation}>
                    <Icon name="add" />
                    {duplicateWarning.startsWith('INTERCHANGE') ? 'Add as Interchange' : 'Add Station'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingStation(false);
                      setDuplicateWarning('');
                      setNewStationData({ id: '', name: '', x: 0, y: 0 });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddingStation(true)}
                className="w-full"
              >
                <Icon name="add" />
                Add Station to {line.name}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

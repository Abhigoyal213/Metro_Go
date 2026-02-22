import { useState } from 'react';
import { MetroNetwork, MetroLine } from '../../types/network.types';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface ValidationError {
  type: 'error' | 'warning';
  lineIndex?: number;
  stationIndex?: number;
  field?: string;
  message: string;
}

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (network: MetroNetwork) => void;
}

export default function BulkImportModal({ onClose, onImport }: BulkImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload');
  const [fileType, setFileType] = useState<'json' | 'csv' | null>(null);
  const [importedNetwork, setImportedNetwork] = useState<MetroNetwork | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [progress, setProgress] = useState(0);

  const validateNetwork = (network: MetroNetwork): ValidationError[] => {
    const errors: ValidationError[] = [];
    const allStationIds = new Set<string>();
    const duplicateIds = new Set<string>();

    if (!network.lines || !Array.isArray(network.lines)) {
      errors.push({ type: 'error', message: 'Invalid network structure: missing or invalid lines array' });
      return errors;
    }

    if (network.lines.length === 0) {
      errors.push({ type: 'error', message: 'Network must have at least one line' });
    }

    network.lines.forEach((line, lineIdx) => {
      if (!line.id) errors.push({ type: 'error', lineIndex: lineIdx, field: 'id', message: `Line ${lineIdx + 1}: Missing line ID` });
      if (!line.name) errors.push({ type: 'error', lineIndex: lineIdx, field: 'name', message: `Line ${lineIdx + 1}: Missing line name` });
      if (!line.color) {
        errors.push({ type: 'error', lineIndex: lineIdx, field: 'color', message: `Line ${lineIdx + 1}: Missing line color` });
      } else if (!/^#[0-9A-Fa-f]{6}$/.test(line.color)) {
        errors.push({ type: 'warning', lineIndex: lineIdx, field: 'color', message: `Line ${lineIdx + 1}: Invalid color format (should be #RRGGBB)` });
      }

      if (!line.stations || !Array.isArray(line.stations)) {
        errors.push({ type: 'error', lineIndex: lineIdx, message: `Line ${line.name || lineIdx + 1}: Missing or invalid stations array` });
        return;
      }

      if (line.stations.length < 2) {
        errors.push({ type: 'error', lineIndex: lineIdx, message: `Line ${line.name || lineIdx + 1}: Must have at least 2 stations` });
      }

      line.stations.forEach((station, stationIdx) => {
        if (!station.id) {
          errors.push({ type: 'error', lineIndex: lineIdx, stationIndex: stationIdx, field: 'id', message: `Line ${line.name}, Station ${stationIdx + 1}: Missing station ID` });
        } else {
          if (allStationIds.has(station.id)) duplicateIds.add(station.id);
          allStationIds.add(station.id);
        }
        if (!station.name) errors.push({ type: 'error', lineIndex: lineIdx, stationIndex: stationIdx, field: 'name', message: `Line ${line.name}, Station ${stationIdx + 1}: Missing station name` });
        if (station.x === undefined || station.x === null) errors.push({ type: 'error', lineIndex: lineIdx, stationIndex: stationIdx, field: 'x', message: `Line ${line.name}, Station ${station.name || stationIdx + 1}: Missing X coordinate` });
        if (station.y === undefined || station.y === null) errors.push({ type: 'error', lineIndex: lineIdx, stationIndex: stationIdx, field: 'y', message: `Line ${line.name}, Station ${station.name || stationIdx + 1}: Missing Y coordinate` });
      });
    });

    if (duplicateIds.size > 0) {
      duplicateIds.forEach(id => {
        errors.push({ type: 'warning', message: `Station ID "${id}" appears in multiple lines - will be treated as interchange` });
      });
    }

    return errors;
  };

  const parseCSV = (csvText: string): MetroNetwork | null => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['line_id', 'line_name', 'line_color', 'station_id', 'station_name', 'x', 'y'];
      
      if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error(`CSV must have headers: ${requiredHeaders.join(', ')}`);
      }

      const linesMap = new Map<string, MetroLine>();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const row: any = {};
        headers.forEach((header, idx) => { row[header] = values[idx]; });

        const lineId = row.line_id;
        if (!linesMap.has(lineId)) {
          linesMap.set(lineId, { id: lineId, name: row.line_name, color: row.line_color, stations: [] });
        }

        linesMap.get(lineId)!.stations.push({
          id: row.station_id,
          name: row.station_name,
          x: parseFloat(row.x),
          y: parseFloat(row.y)
        });
      }

      return { lines: Array.from(linesMap.values()) };
    } catch (error) {
      console.error('CSV parsing error:', error);
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isJSON = file.name.endsWith('.json');
    const isCSV = file.name.endsWith('.csv');

    if (!isJSON && !isCSV) {
      alert('Please upload a JSON or CSV file');
      return;
    }

    setFileType(isJSON ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let network: MetroNetwork | null = null;

        if (isJSON) {
          network = JSON.parse(content);
        } else {
          network = parseCSV(content);
        }

        if (!network) {
          alert('Failed to parse file');
          return;
        }

        const errors = validateNetwork(network);
        setImportedNetwork(network);
        setValidationErrors(errors);
        setStep('preview');
      } catch (error) {
        alert(`Error parsing file: ${error}`);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!importedNetwork) return;

    const hasErrors = validationErrors.some(e => e.type === 'error');
    if (hasErrors) {
      if (!confirm('There are validation errors. Import anyway? This may cause issues.')) {
        return;
      }
    }

    setStep('processing');
    setProgress(0);

    for (let i = 0; i <= 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      setProgress(i);
    }

    onImport(importedNetwork);
  };

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Bulk Import Network Data</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {step === 'upload' && 'Upload JSON or CSV file'}
              {step === 'preview' && 'Review and validate imported data'}
              {step === 'processing' && 'Processing import...'}
            </p>
          </div>
          <button onClick={onClose} disabled={step === 'processing'} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:border-primary transition-colors">
                <Icon name="upload_file" className="text-6xl text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Upload Network File</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Supports JSON and CSV formats</p>
                <label className="cursor-pointer inline-block">
                  <input type="file" accept=".json,.csv" onChange={handleFileUpload} className="hidden" />
                  <div className="px-6 py-4 text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20">
                    <Icon name="folder_open" />
                    Choose File
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                    <Icon name="code" />
                    JSON Format
                  </h4>
                  <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">{`{
  "lines": [{
    "id": "red",
    "name": "Red Line",
    "color": "#E53935",
    "stations": [{
      "id": "station_1",
      "name": "Station 1",
      "x": 100,
      "y": 200
    }]
  }]
}`}</pre>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                    <Icon name="table_chart" />
                    CSV Format
                  </h4>
                  <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">{`line_id,line_name,line_color,station_id,station_name,x,y
red,Red Line,#E53935,station_1,Station 1,100,200
red,Red Line,#E53935,station_2,Station 2,200,200`}</pre>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && importedNetwork && (
            <div className="space-y-6">
              <div className="flex gap-4">
                {errorCount > 0 && (
                  <div className="flex-1 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold mb-2">
                      <Icon name="error" />
                      {errorCount} Error{errorCount > 1 ? 's' : ''}
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">Must be fixed before import</p>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex-1 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 font-bold mb-2">
                      <Icon name="warning" />
                      {warningCount} Warning{warningCount > 1 ? 's' : ''}
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Review recommended</p>
                  </div>
                )}
                {errorCount === 0 && warningCount === 0 && (
                  <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-2">
                      <Icon name="check_circle" />
                      Validation Passed
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">Ready to import</p>
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 max-h-48 overflow-y-auto">
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-3">Validation Issues</h4>
                  <div className="space-y-2">
                    {validationErrors.map((error, idx) => (
                      <div key={idx} className={`flex items-start gap-2 text-sm p-2 rounded ${error.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}>
                        <Icon name={error.type === 'error' ? 'error' : 'warning'} className="text-lg mt-0.5" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-slate-50">
                    Preview: {importedNetwork.lines.length} Lines, {importedNetwork.lines.reduce((sum, line) => sum + line.stations.length, 0)} Stations
                  </h4>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-400">Line</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-400">Station ID</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-400">Station Name</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-400">Coordinates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {importedNetwork.lines.map(line =>
                        line.stations.map((station, idx) => (
                          <tr key={`${line.id}-${station.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full" style={{ backgroundColor: line.color }} />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{line.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">{station.id}</td>
                            <td className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-50">{station.name}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">({station.x}, {station.y})</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Processing Import...</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Please wait while we import your network data</p>
              <div className="w-full max-w-md">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">{Math.round(progress)}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <Button variant="ghost" size="md" onClick={onClose} disabled={step === 'processing'}>
            Cancel
          </Button>
          {step === 'preview' && (
            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep('upload')}>
                <Icon name="arrow_back" />
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleConfirmImport}>
                <Icon name="check" />
                Confirm Import
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Icon from '../atoms/Icon';
import Card from '../atoms/Card';

interface CompatibilityRule {
  from: string;
  to: string;
  status: 'allowed' | 'intermediate' | 'blocked';
  reason: string;
  intermediateVersion?: string;
}

const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0', '3.0.0'];

const compatibilityRules: CompatibilityRule[] = [
  // 1.0.0 upgrades
  { from: '1.0.0', to: '1.1.0', status: 'allowed', reason: 'Direct upgrade supported. Minor version update with backward compatibility.' },
  { from: '1.0.0', to: '1.2.0', status: 'allowed', reason: 'Direct upgrade supported. All 1.x versions are compatible.' },
  { from: '1.0.0', to: '2.0.0', status: 'intermediate', reason: 'Major version jump. Must upgrade to 1.2.0 first to migrate data structures.', intermediateVersion: '1.2.0' },
  { from: '1.0.0', to: '2.1.0', status: 'intermediate', reason: 'Major version jump. Must upgrade to 2.0.0 first.', intermediateVersion: '2.0.0' },
  { from: '1.0.0', to: '3.0.0', status: 'blocked', reason: 'Too many breaking changes. Must upgrade incrementally: 1.0.0 → 1.2.0 → 2.0.0 → 3.0.0' },
  
  // 1.1.0 upgrades
  { from: '1.1.0', to: '1.2.0', status: 'allowed', reason: 'Direct upgrade supported. Minor version update.' },
  { from: '1.1.0', to: '2.0.0', status: 'intermediate', reason: 'Major version jump. Upgrade to 1.2.0 first for data migration.', intermediateVersion: '1.2.0' },
  { from: '1.1.0', to: '2.1.0', status: 'intermediate', reason: 'Major version jump. Must upgrade to 2.0.0 first.', intermediateVersion: '2.0.0' },
  { from: '1.1.0', to: '3.0.0', status: 'blocked', reason: 'Multiple major versions. Requires incremental upgrades.' },
  
  // 1.2.0 upgrades
  { from: '1.2.0', to: '2.0.0', status: 'allowed', reason: 'Direct upgrade supported. Migration scripts available for v2 data structures.' },
  { from: '1.2.0', to: '2.1.0', status: 'allowed', reason: 'Direct upgrade supported. Can skip 2.0.0 as migration is included.' },
  { from: '1.2.0', to: '3.0.0', status: 'intermediate', reason: 'Major version jump. Must upgrade to 2.1.0 first.', intermediateVersion: '2.1.0' },
  
  // 2.0.0 upgrades
  { from: '2.0.0', to: '2.1.0', status: 'allowed', reason: 'Direct upgrade supported. Minor version update with new features.' },
  { from: '2.0.0', to: '3.0.0', status: 'allowed', reason: 'Direct upgrade supported. Major version with breaking API changes but automated migration.' },
  
  // 2.1.0 upgrades
  { from: '2.1.0', to: '3.0.0', status: 'allowed', reason: 'Direct upgrade supported. Latest v2 to v3 migration path.' },
];

export default function VersionCompatibilityMatrix() {
  const [hoveredCell, setHoveredCell] = useState<{ from: string; to: string } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getCompatibility = (from: string, to: string): CompatibilityRule | null => {
    if (from === to) return null;
    
    // Check if downgrade
    const fromIndex = versions.indexOf(from);
    const toIndex = versions.indexOf(to);
    if (toIndex < fromIndex) {
      return {
        from,
        to,
        status: 'blocked',
        reason: 'Downgrade not supported. Rolling back versions may cause data loss.'
      };
    }
    
    return compatibilityRules.find(rule => rule.from === from && rule.to === to) || null;
  };

  const getCellColor = (status: 'allowed' | 'intermediate' | 'blocked' | null) => {
    switch (status) {
      case 'allowed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'intermediate':
        return 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50';
      case 'blocked':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600';
    }
  };

  const getCellIcon = (status: 'allowed' | 'intermediate' | 'blocked' | null) => {
    switch (status) {
      case 'allowed':
        return <Icon name="check_circle" className="text-green-600 dark:text-green-400" />;
      case 'intermediate':
        return <Icon name="warning" className="text-amber-600 dark:text-amber-400" />;
      case 'blocked':
        return <Icon name="block" className="text-red-600 dark:text-red-400" />;
      default:
        return <Icon name="remove" className="text-slate-400" />;
    }
  };

  const handleMouseEnter = (from: string, to: string, event: React.MouseEvent) => {
    setHoveredCell({ from, to });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredCell) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const hoveredRule = hoveredCell 
    ? getCompatibility(hoveredCell.from, hoveredCell.to) 
    : null;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
          <Icon name="grid_on" />
          Version Compatibility Matrix
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Shows upgrade paths between network versions. Hover over cells for details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-green-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Direct Upgrade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-amber-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Requires Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-red-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Same Version</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 p-3 text-left">
                <div className="flex items-center gap-2">
                  <Icon name="arrow_downward" className="text-sm text-slate-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">FROM / TO</span>
                  <Icon name="arrow_forward" className="text-sm text-slate-500" />
                </div>
              </th>
              {versions.map(version => (
                <th key={version} className="bg-slate-100 dark:bg-slate-800 p-3 text-center border-l border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-50">{version}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Target</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {versions.map(fromVersion => (
              <tr key={fromVersion}>
                <td className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 p-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-50">{fromVersion}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Source</div>
                </td>
                {versions.map(toVersion => {
                  const rule = getCompatibility(fromVersion, toVersion);
                  const isSameVersion = fromVersion === toVersion;
                  
                  return (
                    <td
                      key={toVersion}
                      className={`p-3 border-t border-l border-slate-200 dark:border-slate-700 transition-colors cursor-pointer ${
                        getCellColor(rule?.status || null)
                      }`}
                      onMouseEnter={(e) => !isSameVersion && handleMouseEnter(fromVersion, toVersion, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center justify-center">
                        {isSameVersion ? (
                          <Icon name="remove" className="text-slate-400" />
                        ) : rule ? (
                          getCellIcon(rule.status)
                        ) : (
                          <Icon name="help" className="text-slate-400" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {hoveredCell && hoveredRule && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15,
          }}
        >
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-2xl p-4 max-w-sm animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              {getCellIcon(hoveredRule.status)}
              <span className="font-bold text-sm">
                {hoveredCell.from} → {hoveredCell.to}
              </span>
            </div>
            <p className="text-xs mb-2">{hoveredRule.reason}</p>
            {hoveredRule.intermediateVersion && (
              <div className="mt-2 pt-2 border-t border-slate-700 dark:border-slate-300">
                <div className="flex items-center gap-2 text-xs">
                  <Icon name="route" className="text-sm" />
                  <span className="font-medium">Upgrade Path:</span>
                </div>
                <div className="text-xs mt-1 font-mono">
                  {hoveredCell.from} → {hoveredRule.intermediateVersion} → {hoveredCell.to}
                </div>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-slate-700 dark:border-slate-300">
              <div className="text-[10px] text-slate-400 dark:text-slate-600">
                {hoveredRule.status === 'allowed' && '✓ Safe to upgrade directly'}
                {hoveredRule.status === 'intermediate' && '⚠ Requires intermediate step'}
                {hoveredRule.status === 'blocked' && '✗ Upgrade blocked'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="info" className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-bold mb-1">Upgrade Guidelines:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Always backup your network data before upgrading</li>
              <li>Follow intermediate upgrade paths for major version jumps</li>
              <li>Test upgrades in a non-production environment first</li>
              <li>Downgrades are not supported and may cause data loss</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

import React, { useState } from 'react';
import { HazeDataSnapshot, RegionId } from '../types/haze';
import { getCategoryColor, getCategoryFromPSI } from '../services/hazeService';
import { TrendingUp, BarChart2, Calendar, Clock } from 'lucide-react';

interface TrendChartProps {
  data: HazeDataSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  selectedRegion,
  onSelectRegion,
}) => {
  const [metricMode, setMetricMode] = useState<'psi' | 'pm25'>('psi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const history = data.historical24h || [];
  
  // Calculate min, max, average for selected metric
  const values = history.map((pt) => {
    if (metricMode === 'pm25') return pt.pm25;
    if (selectedRegion === 'north') return pt.north;
    if (selectedRegion === 'south') return pt.south;
    if (selectedRegion === 'east') return pt.east;
    if (selectedRegion === 'west') return pt.west;
    if (selectedRegion === 'central') return pt.central;
    return pt.national;
  });

  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 120);
  const avgVal = Math.round(values.reduce((a, b) => a + b, 0) / (values.length || 1));

  // Chart viewport bounds: 0..800 width, 0..260 height
  const chartWidth = 800;
  const chartHeight = 220;
  const paddingY = 24;

  const getY = (val: number) => {
    const range = Math.max(100, maxVal * 1.15);
    return chartHeight - paddingY - (val / range) * (chartHeight - paddingY * 2);
  };

  const getX = (index: number) => {
    const step = chartWidth / (history.length - 1);
    return index * step;
  };

  // Generate SVG path points
  const points = history.map((_, i) => `${getX(i)},${getY(values[i])}`).join(' ');
  const areaPath = `M ${getX(0)},${chartHeight} L ${points} L ${getX(history.length - 1)},${chartHeight} Z`;

  const activePoint = hoverIndex !== null ? history[hoverIndex] : history[history.length - 1];
  const activeValue = hoverIndex !== null ? values[hoverIndex] : values[values.length - 1];
  const activeCat = getCategoryFromPSI(activeValue);
  const activeCol = getCategoryColor(activeCat);

  return (
    <section id="trends-section" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>24-Hour Historical Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Air Quality Dispersion & Trend Curve
          </h2>
        </div>

        {/* Metric Selector Toggle (PSI vs PM2.5) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              onClick={() => setMetricMode('psi')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                metricMode === 'psi'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-Hour PSI
            </button>
            <button
              onClick={() => setMetricMode('pm25')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                metricMode === 'pm25'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Hour PM2.5 (µg/m³)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">24-Hr Peak</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
            {Math.max(...values)}{' '}
            <span className="text-xs font-normal text-slate-400">
              {metricMode === 'psi' ? 'PSI' : 'µg/m³'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">24-Hr Minimum</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
            {Math.min(...values)}{' '}
            <span className="text-xs font-normal text-slate-400">
              {metricMode === 'psi' ? 'PSI' : 'µg/m³'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">24-Hr Average</div>
          <div className="text-lg font-bold font-mono text-sky-400 mt-0.5 tabular-nums">
            {avgVal}{' '}
            <span className="text-xs font-normal text-slate-400">
              {metricMode === 'psi' ? 'PSI' : 'µg/m³'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Active Probe Time</div>
          <div className="text-lg font-bold font-mono text-slate-200 mt-0.5 tabular-nums">
            {activePoint ? activePoint.time : '--:--'}{' '}
            <span className="text-xs font-normal text-slate-400">SGT</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Timeline Chart */}
      <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[300px] rounded-lg bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden">
        {/* Subtle background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Threshold Lines */}
          {metricMode === 'psi' && (
            <>
              {/* Moderate threshold (50) */}
              <line
                x1="0"
                y1={getY(50)}
                x2={chartWidth}
                y2={getY(50)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <text x="8" y={getY(50) - 4} fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">
                50 PSI (GOOD THRESHOLD)
              </text>

              {/* Unhealthy threshold (100) */}
              <line
                x1="0"
                y1={getY(100)}
                x2={chartWidth}
                y2={getY(100)}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <text x="8" y={getY(100) - 4} fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">
                100 PSI (UNHEALTHY THRESHOLD)
              </text>
            </>
          )}

          {/* Fill Area below curve */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Continuous Trend Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Interactive Scrub points */}
          {history.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(values[i]);
            const isHovered = hoverIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              >
                {/* Hit test vertical slice */}
                <rect
                  x={cx - chartWidth / history.length / 2}
                  y={0}
                  width={chartWidth / history.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {isHovered && (
                  <>
                    <line
                      x1={cx}
                      y1={0}
                      x2={cx}
                      y2={chartHeight}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Scrub Floating Monospace HUD */}
        {activePoint && hoverIndex !== null && (
          <div
            className="absolute top-3 pointer-events-none rounded bg-slate-900/95 border border-cyan-500/40 p-2 shadow-xl backdrop-blur-md text-xs font-mono space-y-0.5"
            style={{
              left: `${Math.min(80, Math.max(10, (hoverIndex / (history.length - 1)) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-slate-400 text-[10px]">{activePoint.time} SGT</div>
            <div className="text-cyan-300 font-bold">
              {activeValue} {metricMode === 'psi' ? 'PSI' : 'µg/m³'}
            </div>
            <div className={`text-[10px] ${activeCol.text}`}>
              {activeCat}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
        <span>24 Hours Ago ({history[0]?.time || '00:00'})</span>
        <span>Hourly Synoptic Samples</span>
        <span>Latest Reading ({history[history.length - 1]?.time || '23:00'})</span>
      </div>
    </section>
  );
};

import React from 'react';
import { HazeDataSnapshot, RegionId } from '../types/haze';
import { getCategoryColor, getCategoryFromPSI, getPM25Band, SCENARIO_PRESETS } from '../services/hazeService';
import { ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw, Sparkles, Activity, Wind, Eye } from 'lucide-react';

interface HeroOverviewProps {
  data: HazeDataSnapshot;
  selectedRegion: RegionId;
  currentScenario: string;
  onSelectScenario: (key: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenPrintModal: () => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  data,
  selectedRegion,
  currentScenario,
  onSelectScenario,
  onRefresh,
  isRefreshing,
  onOpenPrintModal,
}) => {
  const currentReading = data.readings[selectedRegion] || data.readings.national;
  const psiCategory = getCategoryFromPSI(currentReading.psi24h);
  const color = getCategoryColor(psiCategory);
  const pm25Band = getPM25Band(currentReading.pm25OneHour);

  // Gauge calculation: 0 - 350 scale
  const psiPercentage = Math.min(100, Math.max(0, (currentReading.psi24h / 300) * 100));

  const getStatusIcon = () => {
    switch (psiCategory) {
      case 'Good':
      case 'Moderate':
        return <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'Unhealthy':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'Very Unhealthy':
      case 'Hazardous':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
    }
  };

  return (
    <section id="overview" className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className={`rounded-xl border ${color.border} ${color.bg} p-4 sm:p-5 backdrop-blur-sm transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 mt-0.5">
              {getStatusIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <span>Official NEA Air Quality Status</span>
                <span>·</span>
                <span className={color.text}>{psiCategory.toUpperCase()} RANGE</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {currentReading.name}: {currentReading.psi24h} PSI ({psiCategory})
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {data.summaryText}
              </p>
            </div>
          </div>

          {/* Quick Scenario Preset Tester & Print Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
              <span className="text-[11px] font-mono text-slate-400 pl-2 pr-1">Scenario:</span>
              <select
                value={currentScenario}
                onChange={(e) => onSelectScenario(e.target.value)}
                className="bg-slate-800 text-xs font-medium text-slate-200 rounded px-2.5 py-1 border-0 focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer"
              >
                {Object.entries(SCENARIO_PRESETS).map(([k, item]) => (
                  <option key={k} value={k}>
                    {item.name} (~{item.psi} PSI)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Export Bulletin
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid: 24-hr PSI + 1-hr PM2.5 + Key Pollutant Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main 24-Hour PSI Gauge Card (7 cols) */}
        <div className="md:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
          {/* Subtle background glow based on status */}
          <div
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: color.hex }}
          />

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">Pollutant Standards Index (24-hr PSI)</span>
              <span className="text-slate-500">Refreshed: {data.timestamp}</span>
            </div>

            {/* Giant Monospace Numeric Display */}
            <div className="mt-4 flex items-baseline gap-4">
              <span className={`text-6xl sm:text-7xl font-bold font-mono tracking-tight tabular-nums ${color.text}`}>
                {currentReading.psi24h}
              </span>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white tracking-wide uppercase">
                  {psiCategory}
                </div>
                <div className="text-xs text-slate-400">
                  {currentReading.name}
                </div>
              </div>
            </div>
          </div>

          {/* Calibrated NEA PSI Gauge Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>0 Good</span>
              <span>50</span>
              <span>100 Moderate</span>
              <span>200 Unhealthy</span>
              <span>300+</span>
            </div>

            <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full w-[16.6%] bg-emerald-500/80" title="Good (0-50)" />
              <div className="h-full w-[16.6%] bg-sky-500/80" title="Moderate (51-100)" />
              <div className="h-full w-[33.3%] bg-amber-500/80" title="Unhealthy (101-200)" />
              <div className="h-full w-[16.6%] bg-orange-500/80" title="Very Unhealthy (201-300)" />
              <div className="h-full w-[16.9%] bg-rose-600/90" title="Hazardous (301+)" />

              {/* Pin cursor indicator */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-500 -translate-x-1/2"
                style={{ left: `${Math.min(99, Math.max(1, psiPercentage))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="font-mono text-[11px]">
                Target: NEA Good Air Quality Standard (&le; 50 PSI)
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {currentReading.psi24h <= 50 ? '● In Compliance' : '▲ Exceeds Standard'}
              </span>
            </div>
          </div>
        </div>

        {/* 1-Hour PM2.5 Instantaneous Indicator Card (5 cols) */}
        <div className="md:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">1-Hour PM2.5 Concentration</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[10px]">
                {pm25Band.band}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className={`text-5xl font-bold font-mono tracking-tight tabular-nums ${pm25Band.color}`}>
                {currentReading.pm25OneHour}
              </span>
              <span className="text-sm font-mono text-slate-400">µg/m³</span>
              <span className="text-sm font-medium text-slate-300">
                ({pm25Band.label})
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              1-hour PM2.5 is the official indicator used in Singapore for immediate personal decisions regarding outdoor plans over the next 1–2 hours.
            </p>
          </div>

          {/* PM2.5 4-Band visual representation */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className={`p-1.5 rounded ${pm25Band.band === 'Band I' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/50 text-slate-500'}`}>
                <div>0-55</div>
                <div>Normal</div>
              </div>
              <div className={`p-1.5 rounded ${pm25Band.band === 'Band II' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800/50 text-slate-500'}`}>
                <div>56-150</div>
                <div>Elevated</div>
              </div>
              <div className={`p-1.5 rounded ${pm25Band.band === 'Band III' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800/50 text-slate-500'}`}>
                <div>151-250</div>
                <div>High</div>
              </div>
              <div className={`p-1.5 rounded ${pm25Band.band === 'Band IV' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800/50 text-slate-500'}`}>
                <div>&gt;250</div>
                <div>Very High</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

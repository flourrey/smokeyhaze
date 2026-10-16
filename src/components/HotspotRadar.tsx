import React from 'react';
import { HotspotTelemetry } from '../types/haze';
import { Flame, Wind, Compass, Satellite, ShieldAlert, AlertTriangle } from 'lucide-react';

interface HotspotRadarProps {
  hotspots: HotspotTelemetry;
}

export const HotspotRadar: React.FC<HotspotRadarProps> = ({ hotspots }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return { text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'Moderate':
        return { text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'High':
        return { text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }
  };

  const riskCol = getRiskColor(hotspots.transboundaryRisk);

  return (
    <section id="hotspot-radar" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>ASMC Regional Meteorological Watch</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Transboundary Hotspot & Synoptic Wind Radar
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Risk Assessment:</span>
          <span className={`px-2.5 py-1 text-xs font-semibold font-mono rounded border ${riskCol.badge}`}>
            {hotspots.transboundaryRisk}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Hotspot Counts */}
        <div className="md:col-span-4 rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>SATELLITE THERMAL HOTSPOTS</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Sumatra (Indonesia)</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
                  {hotspots.sumatraHotspots}{' '}
                  <span className="text-xs font-normal text-slate-400">active fires</span>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Kalimantan (Borneo)</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
                  {hotspots.kalimantanHotspots}{' '}
                  <span className="text-xs font-normal text-slate-400">active fires</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Sensor: {hotspots.lastSatellitePass}
          </div>
        </div>

        {/* Synoptic Wind Compass */}
        <div className="md:col-span-4 rounded-lg bg-slate-950/60 border border-slate-800 p-4 flex flex-col items-center justify-between text-center">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 w-full justify-start">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>PREVAILING MONSOON FLOW</span>
          </div>

          {/* Graphical Compass dial */}
          <div className="relative my-3 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-slate-700/80" />
            <div className="absolute inset-2 rounded-full border border-slate-800 bg-slate-900/90" />
            
            {/* Cardinal marks */}
            <span className="absolute top-1 text-[10px] font-mono font-bold text-slate-400">N</span>
            <span className="absolute bottom-1 text-[10px] font-mono font-bold text-slate-400">S</span>
            <span className="absolute left-1.5 text-[10px] font-mono font-bold text-slate-400">W</span>
            <span className="absolute right-1.5 text-[10px] font-mono font-bold text-slate-400">E</span>

            {/* Rotated Wind Pointer */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-700"
              style={{ transform: `rotate(${hotspots.windDirectionDegrees}deg)` }}
            >
              <div className="w-1.5 h-14 bg-gradient-to-t from-cyan-400 to-transparent rounded-full shadow-[0_0_10px_#06b6d4]" />
              <div className="absolute top-3 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-cyan-300" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-sm font-bold font-mono text-white">
              {hotspots.windDirectionText} ({hotspots.windDirectionDegrees}°)
            </div>
            <div className="text-xs font-mono text-cyan-400">
              Velocity: {hotspots.windSpeedKmh} km/h
            </div>
            <div className="text-[11px] text-slate-400">
              {hotspots.monsoonSeason}
            </div>
          </div>
        </div>

        {/* Advisory Narrative & Trajectory Outlook */}
        <div className="md:col-span-4 rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>HAZE DISPERSION OUTLOOK</span>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              When southerly or south-westerly winds prevail, smoke plumes from peatland fires in central and southern Sumatra can be steered directly towards Singapore and Peninsular Malaysia.
            </p>

            <div className="mt-3 p-3 rounded bg-slate-900/80 border border-slate-800/80 space-y-1">
              <div className="text-xs font-semibold text-slate-200">
                Current Meteorological Scenario:
              </div>
              <div className="text-xs text-slate-400">
                {hotspots.transboundaryRisk === 'Low'
                  ? 'Light surface winds and scattered showers are dispersing localized aerosols effectively.'
                  : 'Sustained south-westerly breeze may transport smoke haze across the Malacca Strait.'}
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Forecast Horizon: 24 - 48 Hours</span>
            <span className="text-cyan-400">ASMC Regional Alert</span>
          </div>
        </div>
      </div>
    </section>
  );
};

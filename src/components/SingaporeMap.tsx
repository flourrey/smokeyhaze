import React, { useState } from 'react';
import { RegionalReading, RegionId } from '../types/haze';
import { getCategoryColor, getCategoryFromPSI, getPM25Band } from '../services/hazeService';
import { Wind, Layers, Compass, Crosshair, Info } from 'lucide-react';

interface SingaporeMapProps {
  readings: Record<RegionId, RegionalReading>;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  windSpeed: number;
  windDirectionText: string;
  windDegrees: number;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  readings,
  selectedRegion,
  onSelectRegion,
  windSpeed,
  windDirectionText,
  windDegrees,
}) => {
  const [showHazeLayer, setShowHazeLayer] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  const activeRegion = hoveredRegion || selectedRegion;
  const currentReading = readings[activeRegion] || readings.national;
  const psiCategory = getCategoryFromPSI(currentReading.psi24h);
  const psiColor = getCategoryColor(psiCategory);
  const pm25Band = getPM25Band(currentReading.pm25OneHour);

  // Station SVG coordinates (normalized 0-800 x 0-460)
  const stations: Array<{
    id: RegionId;
    label: string;
    sublabel: string;
    cx: number;
    cy: number;
    path: string;
  }> = [
    {
      id: 'north',
      label: 'North',
      sublabel: 'Woodlands, Yishun, Sembawang',
      cx: 400,
      cy: 110,
      path: 'M 280,120 C 330,80 470,75 520,110 C 510,160 450,190 380,185 C 310,180 270,160 280,120 Z',
    },
    {
      id: 'west',
      label: 'West',
      sublabel: 'Jurong, Tuas, Clementi, Boon Lay',
      cx: 210,
      cy: 250,
      path: 'M 90,290 C 130,220 220,180 280,210 C 290,270 280,330 200,360 C 120,380 70,340 90,290 Z',
    },
    {
      id: 'central',
      label: 'Central',
      sublabel: 'Bishan, Ang Mo Kio, Orchard, Toa Payoh',
      cx: 410,
      cy: 235,
      path: 'M 320,195 C 400,185 460,195 480,240 C 475,295 420,310 350,305 C 300,295 295,240 320,195 Z',
    },
    {
      id: 'east',
      label: 'East',
      sublabel: 'Tampines, Changi, Bedok, Pasir Ris',
      cx: 615,
      cy: 225,
      path: 'M 505,190 C 580,170 690,190 730,240 C 720,290 640,320 520,300 C 480,270 480,210 505,190 Z',
    },
    {
      id: 'south',
      label: 'South',
      sublabel: 'Marina Bay, HarbourFront, Sentosa',
      cx: 415,
      cy: 350,
      path: 'M 320,315 C 430,310 500,310 510,360 C 480,410 360,420 310,385 C 290,360 300,330 320,315 Z',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Singapore Island Geographic Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Real-Time Regional Station Monitor
          </h2>
        </div>

        {/* View toggles & Wind Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wind: {windDirectionText}</span>
            <span className="text-slate-500">·</span>
            <span>{windSpeed} km/h</span>
          </div>

          <button
            onClick={() => setShowHazeLayer(!showHazeLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showHazeLayer
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showHazeLayer ? 'Smoke Overlay On' : 'Smoke Overlay Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative mt-4 w-full aspect-[16/9] min-h-[320px] max-h-[500px] overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800/80">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* SVG Singapore Map */}
        <svg
          viewBox="0 0 800 450"
          className="relative w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Filter for smooth haze smoke */}
            <radialGradient id="smokeGradient" cx="25%" cy="85%" r="75%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Surrounding Straits & Waters indication */}
          <text x="350" y="35" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" opacity="0.6">
            JOHOR STRAITS (MALAYSIA)
          </text>
          <text x="350" y="440" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" opacity="0.6">
            SINGAPORE STRAIT / RIAU ARCHIPELAGO
          </text>

          {/* Simulated Haze Dispersion Plume */}
          {showHazeLayer && (
            <ellipse
              cx="380"
              cy="250"
              rx="370"
              ry="180"
              fill="url(#smokeGradient)"
              className="pointer-events-none transition-opacity duration-700 animate-pulse"
              style={{ animationDuration: '6s' }}
            />
          )}

          {/* Detailed SVG outlines for Singapore Mainland */}
          <g id="singapore-mainland">
            {/* Base landmass shadow */}
            <path
              d="M 90,260 
                 C 110,210 170,170 240,150 
                 C 290,120 370,80 460,85 
                 C 530,90 620,130 680,180 
                 C 740,210 760,240 730,260 
                 C 680,290 600,310 520,320 
                 C 490,370 420,400 340,390 
                 C 260,380 200,370 140,340 
                 C 80,310 70,280 90,260 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Region Interactive Sectors */}
            {stations.map((st) => {
              const reading = readings[st.id];
              const isSelected = selectedRegion === st.id;
              const isHovered = hoveredRegion === st.id;
              const cat = getCategoryFromPSI(reading.psi24h);
              const col = getCategoryColor(cat);

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredRegion(st.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => onSelectRegion(st.id)}
                >
                  {/* Regional boundary polygon */}
                  <path
                    d={st.path}
                    fill={isSelected || isHovered ? col.hex : '#1e293b'}
                    fillOpacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.12}
                    stroke={isSelected ? col.hex : isHovered ? '#94a3b8' : '#334155'}
                    strokeWidth={isSelected ? '2.5' : '1.2'}
                    className="transition-all duration-200"
                  />

                  {/* Pulsing indicator ring */}
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r={isSelected ? 32 : 24}
                    fill={col.hex}
                    fillOpacity={isSelected ? 0.2 : 0.1}
                    stroke={col.hex}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all duration-300"
                  />

                  {/* Inner node pin */}
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r="8"
                    fill={col.hex}
                    stroke="#020617"
                    strokeWidth="2"
                  />

                  {/* Station Tag & Metric Callout */}
                  <g transform={`translate(${st.cx}, ${st.cy})`}>
                    <rect
                      x="-38"
                      y="-44"
                      width="76"
                      height="30"
                      rx="6"
                      fill="#020617"
                      stroke={isSelected ? col.hex : '#334155'}
                      strokeWidth="1.5"
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="-32"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="600"
                    >
                      {st.label.toUpperCase()}
                    </text>
                    <text
                      x="0"
                      y="-19"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="12"
                      fontFamily="JetBrains Mono"
                      fontWeight="700"
                    >
                      {reading.psi24h} <tspan fontSize="8" fill="#64748b">PSI</tspan>
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Southern offshore islands (Jurong Island, Pulau Bukom, Sentosa) */}
            <ellipse cx="260" cy="385" rx="34" ry="12" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <ellipse cx="410" cy="405" rx="28" ry="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <ellipse cx="640" cy="320" rx="20" ry="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="260" y="388" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">JURONG ISL</text>
            <text x="410" y="408" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">SENTOSA</text>
          </g>

          {/* Wind Stream Vector Indicator */}
          <g transform={`translate(700, 70) rotate(${windDegrees})`}>
            <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="16" x2="0" y2="-16" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            <polygon points="0,-18 -5,-10 5,-10" fill="#06b6d4" />
          </g>
          <text x="700" y="110" fill="#06b6d4" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
            {windSpeed} KM/H {windDirectionText}
          </text>
        </svg>

        {/* Floating Quick Region HUD Detail */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm rounded-lg border border-slate-800 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-slate-400">
                {currentReading.name}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono tabular-nums ${psiColor.text}`}>
                  {currentReading.psi24h}
                </span>
                <span className="text-xs font-mono text-slate-400">24-hr PSI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                  {psiCategory}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-slate-400">1-hr PM2.5</div>
              <div className={`text-lg font-bold font-mono tabular-nums ${pm25Band.color}`}>
                {currentReading.pm25OneHour} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">{pm25Band.label}</div>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Info className="w-3 h-3 text-cyan-400" />
              Click any station to lock focus
            </span>
            {selectedRegion !== 'national' && (
              <button
                onClick={() => onSelectRegion('national')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
              >
                Reset to National
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Region Fast Selector Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 mr-1">Select Region:</span>
        {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionId[]).map((rId) => {
          const r = readings[rId];
          const isSelected = selectedRegion === rId;
          const cat = getCategoryFromPSI(r.psi24h);
          const col = getCategoryColor(cat);

          return (
            <button
              key={rId}
              onClick={() => onSelectRegion(rId)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400/80 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: col.hex }}
              />
              <span className="capitalize">{rId === 'national' ? 'National (All)' : rId}</span>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {r.psi24h}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

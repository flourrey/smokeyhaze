import React from 'react';
import { Server, Radio, Sliders } from 'lucide-react';

interface NavbarProps {
  onOpenBackendModal: () => void;
  dataSource: 'open-data' | 'serverless' | 'simulated';
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBackendModal,
  dataSource,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-cyan-400 transition-colors"
          >
            SG HazePulse
          </a>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
            NEA Telemetry Standard
          </span>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#overview"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#map-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Regional Map
          </a>
          <a
            href="#health-advisory"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Health Advisories
          </a>
          <a
            href="#trends-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            24h Trends
          </a>
          <a
            href="#hotspot-radar"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Hotspot & Wind
          </a>
        </nav>

        {/* Zone 3: 1 primary action with source status indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onRefresh}
            title="Refresh air quality readings"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Radio
              className={`w-3.5 h-3.5 text-cyan-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Syncing...' : 'Live Sync'}
            </span>
          </button>

          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
          >
            {dataSource === 'serverless' ? (
              <>
                <Server className="w-3.5 h-3.5 text-slate-900" />
                <span>Serverless: Active</span>
              </>
            ) : (
              <>
                <Sliders className="w-3.5 h-3.5 text-slate-900" />
                <span>Backend API Setup</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

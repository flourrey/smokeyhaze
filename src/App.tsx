import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroOverview } from './components/HeroOverview';
import { SingaporeMap } from './components/SingaporeMap';
import { HealthAdvisories } from './components/HealthAdvisories';
import { TrendChart } from './components/TrendChart';
import { PollutantTable } from './components/PollutantTable';
import { HotspotRadar } from './components/HotspotRadar';
import { ServerlessConfigModal } from './components/ServerlessConfigModal';
import { PrintAdvisoryModal } from './components/PrintAdvisoryModal';
import {
  HazeDataSnapshot,
  RegionId,
  ServerlessBackendConfig,
} from './types/haze';
import {
  createMockSnapshot,
  fetchHazeData,
  loadServerlessConfig,
  saveServerlessConfig,
  LOCAL_STORAGE_SCENARIO_KEY,
} from './services/hazeService';
import { AlertCircle, ShieldCheck, Check } from 'lucide-react';

export default function App() {
  const [serverlessConfig, setServerlessConfig] =
    useState<ServerlessBackendConfig>(loadServerlessConfig());
  const [selectedScenario, setSelectedScenario] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_SCENARIO_KEY) || 'moderate';
  });
  const [hazeData, setHazeData] = useState<HazeDataSnapshot>(() =>
    createMockSnapshot(selectedScenario)
  );
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Fetch logic
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const result = await fetchHazeData(serverlessConfig, selectedScenario);
      setHazeData(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to refresh telemetry.');
    } finally {
      setIsRefreshing(false);
    }
  }, [serverlessConfig, selectedScenario]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic automatic refresh based on interval
  useEffect(() => {
    const intervalSec = serverlessConfig.refreshIntervalSeconds || 60;
    const timer = setInterval(() => {
      loadData();
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [loadData, serverlessConfig.refreshIntervalSeconds]);

  const handleScenarioChange = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    localStorage.setItem(LOCAL_STORAGE_SCENARIO_KEY, scenarioKey);
  };

  const handleSaveConfig = (newConfig: ServerlessBackendConfig) => {
    setServerlessConfig(newConfig);
    saveServerlessConfig(newConfig);
  };

  const currentReading =
    hazeData.readings[selectedRegion] || hazeData.readings.national;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar (3-Zone Contract) */}
      <Navbar
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        dataSource={hazeData.dataSource}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Error notification if serverless fails */}
        {errorMessage && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-400 hover:text-amber-200 font-mono text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Hero Overview with 24-hr PSI and 1-hr PM2.5 */}
        <HeroOverview
          data={hazeData}
          selectedRegion={selectedRegion}
          currentScenario={selectedScenario}
          onSelectScenario={handleScenarioChange}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />

        {/* 2. Interactive Singapore Map Station Visualizer */}
        <div id="map-section">
          <SingaporeMap
            readings={hazeData.readings}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            windSpeed={hazeData.hotspots.windSpeedKmh}
            windDirectionText={hazeData.hotspots.windDirectionText}
            windDegrees={hazeData.hotspots.windDirectionDegrees}
          />
        </div>

        {/* 3. NEA Health Advisories Matrix & Activity Decision Engine */}
        <HealthAdvisories
          psi={currentReading.psi24h}
          pm25={currentReading.pm25OneHour}
        />

        {/* 4. 24-Hour Trend & Historical Dispersion Timeline */}
        <TrendChart
          data={hazeData}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* 5. Complete 6-Pollutant Matrix with WHO Standards */}
        <PollutantTable reading={currentReading} />

        {/* 6. Regional Hotspot & Wind Radar (ASMC Watch) */}
        <HotspotRadar hotspots={hazeData.hotspots} />
      </main>

      {/* Clean Scientific Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SG HazePulse</span>
            <span aria-hidden="true">·</span>
            <span>National Environment Agency (NEA) Standards</span>
            <span aria-hidden="true">·</span>
            <span>ASEAN Specialised Meteorological Centre (ASMC)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>
              Data Source:{' '}
              <strong className="text-slate-400 capitalize">
                {hazeData.dataSource}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Configure Serverless API Key
            </button>
          </div>
        </div>
      </footer>

      {/* Serverless Backend Connection Modal */}
      <ServerlessConfigModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={serverlessConfig}
        onSaveConfig={handleSaveConfig}
        onRefreshData={loadData}
      />

      {/* Printable Bulletin Modal */}
      <PrintAdvisoryModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={hazeData}
        selectedRegion={selectedRegion}
      />
    </div>
  );
}

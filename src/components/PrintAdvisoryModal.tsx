import React from 'react';
import { HazeDataSnapshot, RegionId } from '../types/haze';
import { getCategoryColor, getCategoryFromPSI, getPM25Band } from '../services/hazeService';
import { X, Printer, Shield, FileText } from 'lucide-react';

interface PrintAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HazeDataSnapshot;
  selectedRegion: RegionId;
}

export const PrintAdvisoryModal: React.FC<PrintAdvisoryModalProps> = ({
  isOpen,
  onClose,
  data,
  selectedRegion,
}) => {
  if (!isOpen) return null;

  const reading = data.readings[selectedRegion] || data.readings.national;
  const category = getCategoryFromPSI(reading.psi24h);
  const color = getCategoryColor(category);
  const pm25Band = getPM25Band(reading.pm25OneHour);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Singapore Haze Advisory Bulletin
              </h3>
              <p className="text-xs text-slate-400">
                Printable noticeboard summary for workplace WSH and schools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Bulletin Document Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div
            id="printable-bulletin"
            className="bg-white text-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 space-y-6 print:m-0 print:p-0 print:border-none"
          >
            {/* Bulletin Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-slate-500">
                  National Environment Agency (NEA) Compliance Standard
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
                  OFFICIAL HAZE ACTION ADVISORY
                </h2>
                <div className="text-xs font-mono text-slate-600 mt-1">
                  Issued: {data.timestamp} · Region: {reading.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-900">
                  REF: SG-PSI-{Math.round(reading.psi24h)}
                </div>
                <div className="text-[10px] text-slate-500">WSH SG Directive</div>
              </div>
            </div>

            {/* Current Readings Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">
                  24-Hour Pollutant Standards Index (PSI)
                </div>
                <div className="text-4xl font-extrabold font-mono text-slate-900 mt-1">
                  {reading.psi24h}
                </div>
                <div className="text-sm font-bold text-slate-800 uppercase mt-1">
                  Status: {category}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">
                  1-Hour PM2.5 Concentration
                </div>
                <div className="text-4xl font-extrabold font-mono text-slate-900 mt-1">
                  {reading.pm25OneHour}{' '}
                  <span className="text-lg font-normal text-slate-600">µg/m³</span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {pm25Band.band} ({pm25Band.label})
                </div>
              </div>
            </div>

            {/* Mandatory WSH Guidelines */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-200 pb-1">
                Mandatory Operational Measures
              </h4>
              <ul className="text-xs space-y-2 text-slate-700 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Healthy Workforce:</strong>{' '}
                  {reading.psi24h > 100
                    ? 'Mandate scheduled indoor hydration intervals every 45 minutes for strenuous physical tasks.'
                    : 'Standard operations permitted with regular hydration.'}
                </li>
                <li>
                  <strong>Outdoor Workers & Riggers:</strong>{' '}
                  {reading.psi24h > 100
                    ? 'Issue certified EN149/NIOSH N95 particulate respirators. Verify seal check prior to duty.'
                    : 'Provide adequate shaded rest stations and drinking water.'}
                </li>
                <li>
                  <strong>Sensitive Demographics:</strong> Relocate pregnant staff, elderly workers, and individuals with asthma/COPD to air-conditioned premises with running HEPA filtration.
                </li>
                <li>
                  <strong>Indoor Ventilation:</strong> Keep external windows and ventilation dampers closed to minimize indoor smoke ingress.
                </li>
              </ul>
            </div>

            {/* Verification Sign-off */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500 font-mono">
              <div>
                <div>Verified by Health, Safety & Environment (HSE) Officer</div>
                <div className="mt-6 border-b border-slate-400 w-48"></div>
                <div className="text-[10px] mt-1">Authorized Signature / Stamp</div>
              </div>
              <div className="text-right text-[10px]">
                Valid for 12 hours from timestamp or until next NEA update.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bulletin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { RegionalReading } from '../types/haze';
import { Layers, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface PollutantTableProps {
  reading: RegionalReading;
}

export const PollutantTable: React.FC<PollutantTableProps> = ({ reading }) => {
  const pollutants = [
    {
      name: 'Fine Particulate Matter',
      formula: 'PM2.5',
      value: reading.pm25OneHour,
      unit: 'µg/m³',
      window: '1-Hour Averaging',
      whoStandard: '15 µg/m³ (24h)',
      neaStandard: 'Normal: 0-55 µg/m³',
      status: reading.pm25OneHour <= 55 ? 'Good' : reading.pm25OneHour <= 150 ? 'Moderate' : 'Unhealthy',
      description: 'Microscopic soot, sulfate, and organic particles from peat/forest fires that penetrate deep into alveolar lung tissues.',
    },
    {
      name: 'Respirable Particulate Matter',
      formula: 'PM10',
      value: reading.pm10TwentyFourHour,
      unit: 'µg/m³',
      window: '24-Hour Averaging',
      whoStandard: '45 µg/m³ (24h)',
      neaStandard: '50 µg/m³ target',
      status: reading.pm10TwentyFourHour <= 50 ? 'Good' : 'Moderate',
      description: 'Coarse dust, smoke debris, and pollen that cause nasal irritation, coughing, and conjunctivitis.',
    },
    {
      name: 'Ground-Level Ozone',
      formula: 'O₃',
      value: reading.o3EightHour,
      unit: 'µg/m³',
      window: '8-Hour Max',
      whoStandard: '100 µg/m³ (8h)',
      neaStandard: '100 µg/m³ target',
      status: reading.o3EightHour <= 80 ? 'Good' : 'Moderate',
      description: 'Secondary photochemical pollutant formed by sunlight reacting with volatile organic compounds and nitrogen oxides.',
    },
    {
      name: 'Nitrogen Dioxide',
      formula: 'NO₂',
      value: reading.no2OneHour,
      unit: 'µg/m³',
      window: '1-Hour Max',
      whoStandard: '25 µg/m³ (24h)',
      neaStandard: '200 µg/m³ (1h)',
      status: reading.no2OneHour <= 50 ? 'Good' : 'Moderate',
      description: 'Pungent combustion gas from motor vehicle exhausts, industrial furnaces, and biomass combustion.',
    },
    {
      name: 'Sulphur Dioxide',
      formula: 'SO₂',
      value: reading.so2TwentyFourHour,
      unit: 'µg/m³',
      window: '24-Hour Averaging',
      whoStandard: '40 µg/m³ (24h)',
      neaStandard: '50 µg/m³ target',
      status: reading.so2TwentyFourHour <= 20 ? 'Good' : 'Moderate',
      description: 'Acidic gas produced from burning high-sulfur diesel and coal; triggers bronchospasms in asthmatics.',
    },
    {
      name: 'Carbon Monoxide',
      formula: 'CO',
      value: reading.coEightHour,
      unit: 'mg/m³',
      window: '8-Hour Max',
      whoStandard: '4.0 mg/m³ (24h)',
      neaStandard: '9.0 mg/m³ (8h)',
      status: reading.coEightHour <= 2.0 ? 'Good' : 'Moderate',
      description: 'Colorless, odorless gas generated from incomplete combustion of agricultural slash-and-burn materials.',
    },
  ];

  return (
    <section id="pollutants" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Singapore Ambient Air Quality Standards</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Comprehensive 6-Pollutant Matrix ({reading.name})
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400">
          WHO Guideline Benchmark Comparison
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Pollutant</th>
              <th className="py-3 px-3">Current Reading</th>
              <th className="py-3 px-3">Averaging Window</th>
              <th className="py-3 px-3 hidden md:table-cell">Singapore NEA Target</th>
              <th className="py-3 px-3 hidden lg:table-cell">WHO 2021 Benchmark</th>
              <th className="py-3 px-3 text-right">Air Quality Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {pollutants.map((p) => {
              const isGood = p.status === 'Good';
              const isMod = p.status === 'Moderate';

              return (
                <tr key={p.formula} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-white text-base">
                        {p.formula}
                      </span>
                      <div>
                        <div className="font-medium text-slate-200 text-xs sm:text-sm">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 hidden sm:block max-w-xs line-clamp-1">
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-mono font-bold text-slate-100 tabular-nums text-base">
                      {p.value}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        {p.unit}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                    {p.window}
                  </td>

                  <td className="py-3.5 px-3 text-xs font-mono text-slate-300 hidden md:table-cell whitespace-nowrap">
                    {p.neaStandard}
                  </td>

                  <td className="py-3.5 px-3 text-xs font-mono text-slate-400 hidden lg:table-cell whitespace-nowrap">
                    {p.whoStandard}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium font-mono ${
                        isGood
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isMod
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isGood ? 'bg-emerald-400' : isMod ? 'bg-sky-400' : 'bg-amber-400'
                        }`}
                      />
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

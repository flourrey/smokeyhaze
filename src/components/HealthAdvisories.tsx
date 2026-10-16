import React, { useState } from 'react';
import { HEALTH_ADVISORY_GROUPS, QUICK_ACTIVITIES, getCategoryFromPSI } from '../services/hazeService';
import { Activity, Heart, ShieldAlert, HardHat, CheckCircle2, AlertTriangle, XCircle, Info, ChevronRight, Check } from 'lucide-react';

interface HealthAdvisoriesProps {
  psi: number;
  pm25: number;
}

export const HealthAdvisories: React.FC<HealthAdvisoriesProps> = ({ psi, pm25 }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('running');
  const [showMaskGuide, setShowMaskGuide] = useState<boolean>(false);
  const psiCategory = getCategoryFromPSI(psi);

  // Group icons mapping
  const renderGroupIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'HardHat':
        return <HardHat className="w-5 h-5 text-emerald-400" />;
      default:
        return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  const activeActivity = QUICK_ACTIVITIES.find((a) => a.id === selectedActivityId) || QUICK_ACTIVITIES[0];
  const activityAdvice = activeActivity.guidance(psi);

  return (
    <section id="health-advisory" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>NEA Singapore Health Advisory Framework</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Activity Guidelines by Population Demographic
          </h2>
        </div>

        <button
          onClick={() => setShowMaskGuide(!showMaskGuide)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showMaskGuide ? 'Hide N95 Mask Protocol' : 'N95 Respirator & Mask Guide'}</span>
        </button>
      </div>

      {/* Expandable N95 Mask Protocol Accordion/Card */}
      {showMaskGuide && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-4 backdrop-blur-sm transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-cyan-300">
                Singapore MOH / NEA N95 Respirator Guidance
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                PM2.5 particles are microscopic (&le; 2.5 microns) and bypass ordinary surgical masks. Understanding the difference is vital during haze episodes.
              </p>
            </div>
            <button
              onClick={() => setShowMaskGuide(false)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-200"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-400">N95 RESPIRATOR</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filters &ge; 95% of airborne particles down to 0.3 microns. Essential when outdoor PSI exceeds 200 or for prolonged outdoor physical labor.
              </p>
              <div className="text-[11px] font-mono text-emerald-400/90 pt-1">
                ✓ Validated against fine PM2.5
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-amber-400">SURGICAL MASK</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Designed to catch large respiratory droplets. Does not provide a facial seal; fine PM2.5 smoke particles easily enter through the edges.
              </p>
              <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                ⚠ Limited PM2.5 protection
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-400">FIT CHECK PROCEDURE</span>
                <Info className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Cup respirator over mouth & nose. 2. Pull straps over crown and nape. 3. Mold metallic nose clip firmly with both fingers. 4. Inhale sharply; mask should collapse slightly.
              </p>
              <div className="text-[11px] font-mono text-cyan-400/90 pt-1">
                ℹ Not suitable for young children
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Demographic Advisory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HEALTH_ADVISORY_GROUPS.map((group) => {
          let adviceText = '';
          switch (psiCategory) {
            case 'Good':
              adviceText = group.rules.good;
              break;
            case 'Moderate':
              adviceText = group.rules.moderate;
              break;
            case 'Unhealthy':
              adviceText = group.rules.unhealthy;
              break;
            case 'Very Unhealthy':
              adviceText = group.rules.veryUnhealthy;
              break;
            case 'Hazardous':
              adviceText = group.rules.hazardous;
              break;
          }

          return (
            <div
              key={group.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between backdrop-blur-sm transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                    {renderGroupIcon(group.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {group.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Advisory at Current PSI ({psi})</span>
                    <span className="font-semibold text-slate-300">{psiCategory}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {adviceText}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>NEA Public Health Code</span>
                <span className="text-cyan-400">WSH SG Compliance</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Activity Planner & Decision Support */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instant Outdoor Activity Decision Engine</span>
        </div>
        <h3 className="text-lg font-bold text-white mt-1">
          Can I do this outdoor activity right now?
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select an activity below to calculate immediate risk mitigation based on current {psi} PSI and {pm25} µg/m³ PM2.5.
        </p>

        {/* Activity Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIVITIES.map((act) => {
            const isSelected = act.id === selectedActivityId;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedActivityId(act.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {act.name}
              </button>
            );
          })}
        </div>

        {/* Activity Evaluation Result */}
        <div className="mt-4 p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${activityAdvice.badge}`}>
                {activityAdvice.status}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Physical Exertion Level: {activeActivity.intensity}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-1">
              {activityAdvice.text}
            </p>
          </div>

          <div className="sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
            <div className="text-[11px] font-mono text-slate-400">Recommendation</div>
            <div className="text-xs text-cyan-400 font-medium mt-0.5">
              {psi > 100 ? 'Switch to Indoor Facility' : 'Hydrate & monitor conditions'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

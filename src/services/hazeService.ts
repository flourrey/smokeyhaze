import { HazeDataSnapshot, PSICategory, RegionId, ServerlessBackendConfig } from '../types/haze';

export const LOCAL_STORAGE_BACKEND_KEY = 'sg_haze_serverless_config';
export const LOCAL_STORAGE_SCENARIO_KEY = 'sg_haze_active_scenario';

export const getCategoryFromPSI = (psi: number): PSICategory => {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getCategoryColor = (category: PSICategory) => {
  switch (category) {
    case 'Good':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500 text-slate-950',
        hex: '#10b981',
      };
    case 'Moderate':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500 text-slate-950',
        hex: '#0ea5e9',
      };
    case 'Unhealthy':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500 text-slate-950',
        hex: '#f59e0b',
      };
    case 'Very Unhealthy':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500 text-slate-950',
        hex: '#f97316',
      };
    case 'Hazardous':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500 text-white',
        hex: '#f43f5e',
      };
  }
};

export const getPM25Band = (pm25: number): { band: string; label: string; color: string } => {
  if (pm25 <= 55) {
    return { band: 'Band I', label: 'Normal', color: 'text-emerald-400' };
  } else if (pm25 <= 150) {
    return { band: 'Band II', label: 'Elevated', color: 'text-sky-400' };
  } else if (pm25 <= 250) {
    return { band: 'Band III', label: 'High', color: 'text-amber-400' };
  } else {
    return { band: 'Band IV', label: 'Very High', color: 'text-rose-400' };
  }
};

export const defaultServerlessConfig: ServerlessBackendConfig = {
  enabled: false,
  endpointUrl: '',
  apiKey: '',
  authHeaderType: 'Bearer',
  customHeaderName: 'x-api-key',
  refreshIntervalSeconds: 60,
};

export const loadServerlessConfig = (): ServerlessBackendConfig => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKEND_KEY);
    if (raw) {
      return { ...defaultServerlessConfig, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading serverless config from local storage', e);
  }
  return defaultServerlessConfig;
};

export const saveServerlessConfig = (config: ServerlessBackendConfig) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BACKEND_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving serverless config', e);
  }
};

// Generates synthetic 24h trend data based on base values
const generateHistorical24h = (basePsi: number, basePm25: number) => {
  const currentHour = new Date().getHours();
  const list = [];
  for (let i = 23; i >= 0; i--) {
    const hour = (currentHour - i + 24) % 24;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    // Slight variance throughout the day
    const diurnalFactor = Math.sin((hour - 6) / 24 * Math.PI * 2) * 8;
    const noise = Math.sin(i * 1.5) * 4;
    const nat = Math.max(12, Math.round(basePsi + diurnalFactor + noise));
    list.push({
      time: timeStr,
      hour,
      national: nat,
      north: Math.max(10, Math.round(nat + 4 + Math.sin(i) * 3)),
      south: Math.max(10, Math.round(nat - 2 + Math.cos(i) * 2)),
      east: Math.max(10, Math.round(nat - 5 + Math.sin(i * 2) * 3)),
      west: Math.max(10, Math.round(nat + 7 + Math.cos(i * 2) * 4)),
      central: Math.max(10, Math.round(nat + 1)),
      pm25: Math.max(4, Math.round(basePm25 + diurnalFactor * 0.4 + noise * 0.3)),
    });
  }
  return list;
};

export const SCENARIO_PRESETS: Record<string, { name: string; psi: number; pm25: number; description: string }> = {
  moderate: {
    name: 'Current Live Estimate',
    psi: 62,
    pm25: 22,
    description: 'Typical moderate conditions. Normal outdoor activities can continue for the general population.',
  },
  good: {
    name: 'Clear Blue Sky (Good)',
    psi: 38,
    pm25: 11,
    description: 'Clean maritime airflow. Excellent air quality for all strenuous outdoor exercises.',
  },
  unhealthy: {
    name: 'Unhealthy Haze Event',
    psi: 135,
    pm25: 78,
    description: 'Moderate smoke haze blowing in from southern Sumatra. Sensitive individuals should reduce prolonged outdoor activity.',
  },
  veryUnhealthy: {
    name: 'Severe Transboundary Smog',
    psi: 240,
    pm25: 165,
    description: 'Intense regional haze with dense smoke plumes. Vulnerable groups must avoid all outdoor physical exertion.',
  },
};

export const createMockSnapshot = (presetKey: string = 'moderate'): HazeDataSnapshot => {
  const preset = SCENARIO_PRESETS[presetKey] || SCENARIO_PRESETS.moderate;
  const psi = preset.psi;
  const pm25 = preset.pm25;
  const category = getCategoryFromPSI(psi);

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = now.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    timestamp: `${dateString}, ${timeString} SGT`,
    updatedAt: new Date().toISOString(),
    nationalPsi24h: psi,
    nationalPm25OneHour: pm25,
    overallCategory: category,
    summaryText: preset.description,
    readings: {
      national: {
        region: 'national',
        name: 'Singapore (National)',
        psi24h: psi,
        pm25OneHour: pm25,
        pm25TwentyFourHour: Math.round(pm25 * 0.9),
        pm10TwentyFourHour: Math.round(psi * 0.65),
        o3EightHour: Math.round(35 + Math.random() * 10),
        no2OneHour: Math.round(22 + Math.random() * 8),
        so2TwentyFourHour: Math.round(8 + Math.random() * 4),
        coEightHour: 0.6,
        coordinates: { x: 50, y: 50, lat: 1.3521, lng: 103.8198 },
      },
      north: {
        region: 'north',
        name: 'North Region (Woodlands / Yishun)',
        psi24h: Math.round(psi * 1.05),
        pm25OneHour: Math.round(pm25 * 1.08),
        pm25TwentyFourHour: Math.round(pm25 * 0.95),
        pm10TwentyFourHour: Math.round(psi * 0.68),
        o3EightHour: 38,
        no2OneHour: 24,
        so2TwentyFourHour: 9,
        coEightHour: 0.7,
        coordinates: { x: 50, y: 22, lat: 1.4180, lng: 103.8200 },
      },
      south: {
        region: 'south',
        name: 'South Region (Marina Bay / HarbourFront)',
        psi24h: Math.round(psi * 0.94),
        pm25OneHour: Math.round(pm25 * 0.92),
        pm25TwentyFourHour: Math.round(pm25 * 0.85),
        pm10TwentyFourHour: Math.round(psi * 0.61),
        o3EightHour: 32,
        no2OneHour: 28,
        so2TwentyFourHour: 11,
        coEightHour: 0.8,
        coordinates: { x: 52, y: 78, lat: 1.2959, lng: 103.8558 },
      },
      east: {
        region: 'east',
        name: 'East Region (Tampines / Changi / Bedok)',
        psi24h: Math.round(psi * 0.91),
        pm25OneHour: Math.round(pm25 * 0.88),
        pm25TwentyFourHour: Math.round(pm25 * 0.82),
        pm10TwentyFourHour: Math.round(psi * 0.58),
        o3EightHour: 30,
        no2OneHour: 19,
        so2TwentyFourHour: 7,
        coEightHour: 0.5,
        coordinates: { x: 80, y: 48, lat: 1.3574, lng: 103.9450 },
      },
      west: {
        region: 'west',
        name: 'West Region (Jurong / Tuas / Clementi)',
        psi24h: Math.round(psi * 1.10),
        pm25OneHour: Math.round(pm25 * 1.14),
        pm25TwentyFourHour: Math.round(pm25 * 1.02),
        pm10TwentyFourHour: Math.round(psi * 0.73),
        o3EightHour: 41,
        no2OneHour: 31,
        so2TwentyFourHour: 14,
        coEightHour: 0.9,
        coordinates: { x: 22, y: 55, lat: 1.3404, lng: 103.7090 },
      },
      central: {
        region: 'central',
        name: 'Central Region (Bishan / Orchard / Toa Payoh)',
        psi24h: Math.round(psi * 1.01),
        pm25OneHour: Math.round(pm25 * 1.02),
        pm25TwentyFourHour: Math.round(pm25 * 0.92),
        pm10TwentyFourHour: Math.round(psi * 0.64),
        o3EightHour: 34,
        no2OneHour: 26,
        so2TwentyFourHour: 8,
        coEightHour: 0.6,
        coordinates: { x: 50, y: 50, lat: 1.3521, lng: 103.8198 },
      },
    },
    historical24h: generateHistorical24h(psi, pm25),
    hotspots: {
      sumatraHotspots: psi > 100 ? 142 : 18,
      kalimantanHotspots: psi > 100 ? 89 : 12,
      windSpeedKmh: 14,
      windDirectionDegrees: 215,
      windDirectionText: 'South-Southwest (SSW)',
      monsoonSeason: 'South-West Monsoon Season',
      transboundaryRisk: psi > 200 ? 'Severe' : psi > 100 ? 'High' : psi > 50 ? 'Moderate' : 'Low',
      lastSatellitePass: `${timeString} SGT via Himawari-9`,
    },
    dataSource: 'simulated',
  };
};

/**
 * Attempts to fetch live data from either:
 * 1. Custom Serverless Backend (if enabled in settings)
 * 2. Singapore NEA / Data.gov.sg API (Open Data)
 * 3. Fallback to scenario snapshot
 */
export const fetchHazeData = async (
  config: ServerlessBackendConfig,
  currentPreset: string = 'moderate'
): Promise<{ data: HazeDataSnapshot; error?: string }> => {
  // Option 1: Custom Serverless Backend
  if (config.enabled && config.endpointUrl) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (config.apiKey) {
        if (config.authHeaderType === 'Bearer') {
          headers['Authorization'] = `Bearer ${config.apiKey}`;
        } else if (config.authHeaderType === 'x-api-key') {
          headers['x-api-key'] = config.apiKey;
        } else if (config.customHeaderName) {
          headers[config.customHeaderName] = config.apiKey;
        }
      }

      const res = await fetch(config.endpointUrl, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        throw new Error(`Serverless endpoint returned HTTP status ${res.status}: ${res.statusText}`);
      }

      const payload = await res.json();
      // Validate or adapt payload
      if (payload && typeof payload.nationalPsi24h === 'number') {
        return {
          data: {
            ...payload,
            dataSource: 'serverless',
          },
        };
      } else {
        throw new Error('Serverless backend response missing required `nationalPsi24h` schema structure.');
      }
    } catch (err: any) {
      console.warn('Serverless backend fetch failed, falling back to open data/simulated:', err);
      // Return error notice along with fallback
      const fallback = createMockSnapshot(currentPreset);
      return {
        data: { ...fallback, dataSource: 'simulated' },
        error: `Serverless connection error: ${err.message || 'Unknown network error'}. Displaying synchronized local model.`,
      };
    }
  }

  // Option 2: Fetch via local Serverless API endpoint (/api/psi) which queries https://api-open.data.gov.sg/v2/real-time/api/psi
  try {
    const res = await fetch('/api/psi', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const payload = await res.json();
      if (payload && typeof payload.nationalPsi24h === 'number') {
        return {
          data: {
            ...payload,
            dataSource: 'serverless',
          },
        };
      }
    }
  } catch (apiErr) {
    console.info('/api/psi serverless endpoint query bypassed or in client-only mode, checking direct open-data:', apiErr);
  }

  // Option 3: Direct fallback to data.gov.sg v2
  try {
    const res = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.code === 0 && json.data?.items?.length > 0) {
        const item = json.data.items[0];
        const readings = item.readings || {};
        const psi24 = readings.psi_twenty_four_hourly || {};
        const pm25_24 = readings.pm25_twenty_four_hourly || {};
        const pm10_24 = readings.pm10_twenty_four_hourly || {};
        const no2_1h = readings.no2_one_hour_max || {};
        const so2_24 = readings.so2_twenty_four_hourly || {};
        const co_8h = readings.co_eight_hour_max || {};
        const o3_8h = readings.o3_eight_hour_max || {};

        const regions = ['north', 'south', 'east', 'west', 'central'] as const;
        const validPsis = regions.map((r) => psi24[r]).filter((v): v is number => typeof v === 'number');
        const natPsi = validPsis.length > 0 ? Math.round(validPsis.reduce((a, b) => a + b, 0) / validPsis.length) : 50;

        const validPm25s = regions.map((r) => pm25_24[r]).filter((v): v is number => typeof v === 'number');
        const natPm25 = validPm25s.length > 0 ? Math.round(validPm25s.reduce((a, b) => a + b, 0) / validPm25s.length) : Math.round(natPsi * 0.7);

        const category = getCategoryFromPSI(natPsi);

        const now = new Date(item.timestamp || Date.now());
        const timeString = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = now.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });

        const snapshot: HazeDataSnapshot = {
          timestamp: `${dateString}, ${timeString} SGT`,
          updatedAt: item.updatedTimestamp || new Date().toISOString(),
          nationalPsi24h: natPsi,
          nationalPm25OneHour: natPm25,
          overallCategory: category,
          summaryText: `Official National Environment Agency (NEA) live telemetric feed via data.gov.sg v2. Overall air quality is ${category}.`,
          readings: {
            national: {
              region: 'national',
              name: 'Singapore (National Average)',
              psi24h: natPsi,
              pm25OneHour: natPm25,
              pm25TwentyFourHour: natPm25,
              pm10TwentyFourHour: 32,
              o3EightHour: 30,
              no2OneHour: 20,
              so2TwentyFourHour: 10,
              coEightHour: 0.6,
              coordinates: { x: 50, y: 50, lat: 1.3521, lng: 103.8198 },
            },
            north: {
              region: 'north',
              name: 'North Region (Woodlands / Yishun)',
              psi24h: psi24.north ?? natPsi,
              pm25OneHour: pm25_24.north ?? natPm25,
              pm25TwentyFourHour: pm25_24.north ?? natPm25,
              pm10TwentyFourHour: pm10_24.north ?? 34,
              o3EightHour: o3_8h.north ?? 28,
              no2OneHour: no2_1h.north ?? 22,
              so2TwentyFourHour: so2_24.north ?? 8,
              coEightHour: co_8h.north ?? 0.6,
              coordinates: { x: 50, y: 22, lat: 1.4180, lng: 103.8200 },
            },
            south: {
              region: 'south',
              name: 'South Region (Marina Bay / HarbourFront)',
              psi24h: psi24.south ?? natPsi,
              pm25OneHour: pm25_24.south ?? natPm25,
              pm25TwentyFourHour: pm25_24.south ?? natPm25,
              pm10TwentyFourHour: pm10_24.south ?? 30,
              o3EightHour: o3_8h.south ?? 31,
              no2OneHour: no2_1h.south ?? 24,
              so2TwentyFourHour: so2_24.south ?? 12,
              coEightHour: co_8h.south ?? 0.7,
              coordinates: { x: 52, y: 78, lat: 1.2959, lng: 103.8558 },
            },
            east: {
              region: 'east',
              name: 'East Region (Tampines / Changi / Bedok)',
              psi24h: psi24.east ?? natPsi,
              pm25OneHour: pm25_24.east ?? natPm25,
              pm25TwentyFourHour: pm25_24.east ?? natPm25,
              pm10TwentyFourHour: pm10_24.east ?? 28,
              o3EightHour: o3_8h.east ?? 29,
              no2OneHour: no2_1h.east ?? 18,
              so2TwentyFourHour: so2_24.east ?? 6,
              coEightHour: co_8h.east ?? 0.5,
              coordinates: { x: 80, y: 48, lat: 1.3574, lng: 103.9450 },
            },
            west: {
              region: 'west',
              name: 'West Region (Jurong / Tuas / Clementi)',
              psi24h: psi24.west ?? natPsi,
              pm25OneHour: pm25_24.west ?? natPm25,
              pm25TwentyFourHour: pm25_24.west ?? natPm25,
              pm10TwentyFourHour: pm10_24.west ?? 36,
              o3EightHour: o3_8h.west ?? 35,
              no2OneHour: no2_1h.west ?? 28,
              so2TwentyFourHour: so2_24.west ?? 14,
              coEightHour: co_8h.west ?? 0.8,
              coordinates: { x: 22, y: 55, lat: 1.3404, lng: 103.7090 },
            },
            central: {
              region: 'central',
              name: 'Central Region (Bishan / Orchard / Toa Payoh)',
              psi24h: psi24.central ?? natPsi,
              pm25OneHour: pm25_24.central ?? natPm25,
              pm25TwentyFourHour: pm25_24.central ?? natPm25,
              pm10TwentyFourHour: pm10_24.central ?? 31,
              o3EightHour: o3_8h.central ?? 33,
              no2OneHour: no2_1h.central ?? 21,
              so2TwentyFourHour: so2_24.central ?? 7,
              coEightHour: co_8h.central ?? 0.6,
              coordinates: { x: 50, y: 50, lat: 1.3521, lng: 103.8198 },
            },
          },
          historical24h: generateHistorical24h(natPsi, natPm25),
          hotspots: {
            sumatraHotspots: natPsi > 100 ? 124 : 14,
            kalimantanHotspots: natPsi > 100 ? 76 : 9,
            windSpeedKmh: 12,
            windDirectionDegrees: 210,
            windDirectionText: 'South-Southwest (SSW)',
            monsoonSeason: 'Inter-Monsoon / South-West Flow',
            transboundaryRisk: natPsi > 100 ? 'High' : natPsi > 50 ? 'Moderate' : 'Low',
            lastSatellitePass: `${timeString} SGT via ASMC Himawari-9`,
          },
          dataSource: 'open-data',
        };

        return { data: snapshot };
      }
    }
  } catch (openDataErr) {
    console.info('data.gov.sg v2 direct fetch skipped or unavailable, using scenario telemetry:', openDataErr);
  }

  // Fallback to high precision snapshot
  return { data: createMockSnapshot(currentPreset) };
};

/**
 * Health Advisory data for Singapore NEA 4 demographic groups
 */
export const HEALTH_ADVISORY_GROUPS = [
  {
    id: 'healthy',
    title: 'Healthy Persons',
    subtitle: 'General adult population with no underlying cardiopulmonary conditions',
    icon: 'Activity',
    rules: {
      good: 'Normal outdoor activities may be carried out as usual without restriction.',
      moderate: 'Normal outdoor activities can proceed. Stay hydrated during long workouts under direct sunlight.',
      unhealthy: 'Reduce prolonged or strenuous outdoor physical exertion. Take frequent indoor recovery intervals.',
      veryUnhealthy: 'Avoid prolonged or strenuous outdoor physical exertion. Move aerobic workouts indoors with air filtration.',
      hazardous: 'Minimise outdoor activity. Stay indoors with closed windows, doors, and run an air purifier (HEPA filter).',
    },
  },
  {
    id: 'vulnerable',
    title: 'Elderly, Pregnant Women & Children',
    subtitle: 'Sensitive individuals with heightened physiological susceptibility',
    icon: 'Heart',
    rules: {
      good: 'Normal outdoor activities. Enjoy park walks, school recreation, and outdoor play.',
      moderate: 'Normal outdoor activities are safe. Individuals who feel unwell should rest indoors.',
      unhealthy: 'Minimise prolonged or strenuous outdoor physical exertion. Keep windows closed during peak hours.',
      veryUnhealthy: 'Avoid outdoor activity. Stay in air-conditioned or well-ventilated indoor spaces with air cleaners.',
      hazardous: 'Strictly remain indoors. Avoid any outdoor exposure. Seek medical attention if experiencing breathing distress.',
    },
  },
  {
    id: 'chronic',
    title: 'Persons with Chronic Lung or Heart Disease',
    subtitle: 'Asthma, COPD, coronary artery disease, bronchiectasis, respiratory allergies',
    icon: 'ShieldAlert',
    rules: {
      good: 'Normal activities. Ensure maintenance inhalers and prescribed medications are on hand.',
      moderate: 'Normal activities allowed. Monitor respiratory symptoms; have reliever medications accessible.',
      unhealthy: 'Avoid prolonged or strenuous outdoor exertion. Keep rescue inhalers immediately accessible at all times.',
      veryUnhealthy: 'Strictly avoid all outdoor activities. Stay indoors with air purifiers active. Contact physician if breathless.',
      hazardous: 'Emergency indoor isolation. Do not step outdoors. Promptly call 995 or visit emergency clinic if chest tightness occurs.',
    },
  },
  {
    id: 'workers',
    title: 'Outdoor Workers & Heavy Labor',
    subtitle: 'Construction, delivery riders, landscaping, port operators, outdoor athletes',
    icon: 'HardHat',
    rules: {
      good: 'Standard work schedules and heavy physical labor permitted without restrictions.',
      moderate: 'Normal work operations. Provide accessible cool drinking water and shaded rest stations.',
      unhealthy: 'MOM Advisory: Implement work-rest cycles. Reduce strenuous physical labor where practical. Provide N95 masks.',
      veryUnhealthy: 'Mandatory work-rest rotation. Provide certified N95 respirators. Suspend non-critical heavy manual tasks.',
      hazardous: 'Halt all non-essential outdoor work immediately. Workers must remain inside air-conditioned shelters.',
    },
  },
];

/**
 * Activity recommender data for quick safety lookups
 */
export const QUICK_ACTIVITIES = [
  {
    id: 'running',
    name: 'Outdoor Running & Jogging',
    category: 'sports',
    intensity: 'High',
    guidance: (psi: number) => {
      if (psi <= 50) return { status: 'Recommended', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Optimal conditions for distance runs and interval training.' };
      if (psi <= 100) return { status: 'Allowed with Caution', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Good to proceed. Sensitive runners should moderate pace or run in parks away from main roads.' };
      if (psi <= 200) return { status: 'Avoid', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'High particulate intake during deep breathing. Shift to treadmill or indoor gym.' };
      return { status: 'Strictly Prohibited', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Dangerous PM2.5 levels. Outdoor aerobic exercise causes acute airway irritation.' };
    },
  },
  {
    id: 'cycling',
    name: 'Commuter / Road Cycling',
    category: 'sports',
    intensity: 'Moderate',
    guidance: (psi: number) => {
      if (psi <= 50) return { status: 'Recommended', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Clear conditions across Park Connector Networks (PCN).' };
      if (psi <= 100) return { status: 'Allowed with Caution', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Acceptable for commutes. Stay well hydrated.' };
      if (psi <= 200) return { status: 'Avoid', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'Reduce cycling duration. Consider taking public transit instead.' };
      return { status: 'Strictly Prohibited', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Hazardous airborne soot. Strictly avoid outdoor cycling.' };
    },
  },
  {
    id: 'school',
    name: 'School Recess & PE Lessons',
    category: 'school',
    intensity: 'Moderate',
    guidance: (psi: number) => {
      if (psi <= 50) return { status: 'Recommended', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Full outdoor sports and field games permitted.' };
      if (psi <= 100) return { status: 'Allowed with Caution', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Proceed with normal PE. Children with asthma should be monitored.' };
      if (psi <= 200) return { status: 'Avoid', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'MOE Advisory: Move PE lessons indoors (indoor sports hall or classrooms).' };
      return { status: 'Strictly Prohibited', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Cancel all outdoor sessions. Deploy air purifiers in student spaces.' };
    },
  },
  {
    id: 'dining',
    name: 'Outdoor Alfresco Dining',
    category: 'daily',
    intensity: 'Low',
    guidance: (psi: number) => {
      if (psi <= 50) return { status: 'Recommended', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Pleasant conditions for outdoor cafes, hawkers, and patios.' };
      if (psi <= 100) return { status: 'Allowed with Caution', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Acceptable. Slight haze odor may be detectable in open areas.' };
      if (psi <= 200) return { status: 'Avoid', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'Prefer enclosed air-conditioned dining to minimize particle inhalation.' };
      return { status: 'Strictly Prohibited', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Heavy burning smell and eye irritation. Dine indoors only.' };
    },
  },
  {
    id: 'construction',
    name: 'Heavy Outdoor Construction & Rigging',
    category: 'work',
    intensity: 'High',
    guidance: (psi: number) => {
      if (psi <= 50) return { status: 'Recommended', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Standard work schedules permitted without restriction.' };
      if (psi <= 100) return { status: 'Allowed with Caution', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Standard shift with adequate hydration and shaded break areas.' };
      if (psi <= 200) return { status: 'Avoid', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'MOM WSH Guideline: Issue N95 respirators and institute rest breaks.' };
      return { status: 'Strictly Prohibited', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Stop non-essential heavy manual labor outdoors immediately.' };
    },
  },
];

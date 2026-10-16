export type PSICategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export type RegionId = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionalReading {
  region: RegionId;
  name: string;
  psi24h: number;
  pm25OneHour: number;
  pm25TwentyFourHour: number;
  pm10TwentyFourHour: number;
  o3EightHour: number;
  no2OneHour: number;
  so2TwentyFourHour: number;
  coEightHour: number;
  coordinates: { x: number; y: number; lat: number; lng: number };
}

export interface PollutantInfo {
  key: string;
  name: string;
  formula: string;
  currentValue: number;
  unit: string;
  averagingTime: string;
  whoStandard: string;
  singaporeTarget: string;
  status: 'safe' | 'caution' | 'warning' | 'danger';
  description: string;
}

export interface HealthAdvisoryGroup {
  id: string;
  title: string;
  description: string;
  iconName: string;
  actionGuidance: {
    good: string;
    moderate: string;
    unhealthy: string;
    veryUnhealthy: string;
    hazardous: string;
  };
}

export interface ActivityGuidance {
  id: string;
  name: string;
  category: 'sports' | 'daily' | 'work' | 'school';
  intensity: 'High' | 'Moderate' | 'Low';
  advice: {
    status: 'Recommended' | 'Allowed with Caution' | 'Avoid' | 'Strictly Prohibited';
    description: string;
    mitigation: string;
  };
}

export interface HotspotTelemetry {
  sumatraHotspots: number;
  kalimantanHotspots: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirectionText: string;
  monsoonSeason: string;
  transboundaryRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  lastSatellitePass: string;
}

export interface HazeDataSnapshot {
  timestamp: string;
  updatedAt: string;
  nationalPsi24h: number;
  nationalPm25OneHour: number;
  overallCategory: PSICategory;
  summaryText: string;
  readings: Record<RegionId, RegionalReading>;
  historical24h: Array<{
    time: string;
    hour: number;
    national: number;
    north: number;
    south: number;
    east: number;
    west: number;
    central: number;
    pm25: number;
  }>;
  hotspots: HotspotTelemetry;
  dataSource: 'open-data' | 'serverless' | 'simulated';
}

export interface ServerlessBackendConfig {
  enabled: boolean;
  endpointUrl: string;
  apiKey: string;
  authHeaderType: 'Bearer' | 'x-api-key' | 'Custom';
  customHeaderName: string;
  refreshIntervalSeconds: number;
}

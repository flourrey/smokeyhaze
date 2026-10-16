/**
 * Health check serverless endpoint
 * Route: GET /api/health
 */

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  uptimeSeconds: number;
  environment: string;
}

export async function getHealthStatus(): Promise<HealthCheckResponse> {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SG HazePulse Telemetry Serverless API',
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'production',
  };
}

// Universal handler compatible with Express and Vercel/Node serverless runtimes
export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const status = await getHealthStatus();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(status);
}

// Standard Web Request/Response handler (Cloudflare Workers, Next.js route handlers, Edge)
export async function GET(_req?: Request) {
  const status = await getHealthStatus();
  return new Response(JSON.stringify(status), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

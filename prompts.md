# SG HazePulse — Chat & Prompt History

## Turn 1: Initial App Design & Frontend Build

### User Request
> i want to design a singapore haze tracking app that displays real-time PSI levels and health advisories.
> 
> only build the front end and i will provide the severless key backend later

### Solution Implemented
1. **Application Architecture & Branding**:
   - Initialized project as **SG HazePulse** adhering to NEA (National Environment Agency) Singapore telemetry standards.
   - Configured typography (Plus Jakarta Sans and JetBrains Mono) and deep obsidian clinical science palette.

2. **Core Components Created**:
   - `HeroOverview.tsx`: Official 24-hour PSI gauge (0–50 Good, 51–100 Moderate, 101–200 Unhealthy, 201–300 Very Unhealthy, >300 Hazardous) and instantaneous 1-hour PM2.5 concentration ($µ\text{g/m}^3$) with Band I–IV classification.
   - `SingaporeMap.tsx`: Vector geographic station visualizer covering all 5 Singapore regions (North, South, East, West, Central) with interactive pin selection, smoke plume dispersion overlay, and wind vector compass.
   - `HealthAdvisories.tsx`: NEA health advisories for 4 demographic groups (Healthy, Elderly/Pregnant/Children, Chronic Cardiopulmonary Illness, Outdoor Workers) with an interactive outdoor activity safety decision engine and certified N95 respirator protocol guide.
   - `TrendChart.tsx`: 24-hour historical time-series chart with hover scrub crosshair, threshold reference lines, and min/max/average statistics.
   - `PollutantTable.tsx`: Full 6-pollutant breakdown ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{O}_3$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$) benchmarked against WHO 2021 air quality targets.
   - `HotspotRadar.tsx`: ASMC regional hotspot tracker (Sumatra & Kalimantan fire anomalies) and synoptic wind flow monitor.
   - `ServerlessConfigModal.tsx`: Comprehensive configuration modal for custom serverless backends (URL endpoint, API key, auth headers, latency test ping, and copyable JSON schema contract).
   - `PrintAdvisoryModal.tsx`: Printable Workplace Safety & Health (WSH) noticeboard bulletin card.

---

## Turn 2: GitHub Repository Initialization & Push

### User Request
> git push https://[GITHUB_TOKEN]@https://github.com/flourrey/smokeyhaze.git

### Solution Implemented
1. Initialized Git repository in the project workspace.
2. Formatted git author identity and created the initial commit on branch `main`.
3. Fixed the remote URL format (`https://[TOKEN]@github.com/flourrey/smokeyhaze.git`).
4. Successfully pushed the branch `main` to the remote repository.
5. Scrubbed authentication credentials from local git remote storage for security.

---

## Turn 3: Serverless API Endpoint Integration

### User Request
> add a serverless API endpoint that pulls live data from data.gov.sg using the following endpoints:
> 
> GET https://api-open.data.gov.sg/v2/real-time/api/psi
> 
> 1. store this in /api folder in the project root level. not the src folder
> 2. include /health.ts and /psi.ts within the same subfolder 
> 3. there is no key required for this service

### Solution Implemented
1. **Serverless Endpoints in `/api/`**:
   - `/api/health.ts`: Health check endpoint returning service status, uptime, and timestamp.
   - `/api/psi.ts`: Serverless proxy pulling live data from `https://api-open.data.gov.sg/v2/real-time/api/psi` without requiring any key. Enriches data with regional aggregates, calculations, 30-second in-memory caching, and standard CORS headers.
   - Both modules export universal Node/Express handlers and standard Web `GET(request: Request)` handlers for cross-platform serverless execution (AWS Lambda, Vercel, Cloudflare Workers, Express).

2. **Full-Stack Mounting (`server.ts`)**:
   - Created root `server.ts` mounting Express routes for `/api/health` and `/api/psi` together with Vite middlewares.
   - Updated `package.json` scripts (`"dev": "tsx server.ts"`, `"start": "node server.ts"`).
   - Verified live responses via `curl`:
     - `GET http://localhost:3000/api/health` → `200 OK`
     - `GET http://localhost:3000/api/psi` → `200 OK` with real-time Singapore PSI data.

3. **Remote Git Sync**:
   - Committed changes and pushed to [https://github.com/flourrey/smokeyhaze](https://github.com/flourrey/smokeyhaze).

---

## Turn 4: Chat History Export

### User Request
> export this entire chat to prompts.md

### Solution Implemented
- Generated `prompts.md` documenting the complete project prompt history, architectural implementations, and API details.

---

## Turn 5: Mobile Viewport Optimization for Map Monitor

### User Request
> your display of message is blocking the map monitor on a mobile phone screen setup, optimise for mobile view

### Solution Implemented
1. **Unblocked SVG Map Canvas on Mobile Screens**:
   - Identified that the floating station telemetry HUD overlay was placed with absolute coordinates `bottom-3 left-3 right-3` inside the SVG canvas, covering the entire southern half of Singapore (Sentosa, Jurong Island, South station, Central station) on smaller viewports.
   - Decoupled the mobile layout: on mobile screens (`< sm`), the regional status and PSI/PM2.5 metrics are cleanly docked **below** the SVG canvas in a dedicated companion card, completely freeing up 100% of the SVG map view with zero overlap.
   - On desktop viewports (`sm:` and up), the detail card remains unobtrusively docked in the corner.
2. **Responsive Height & Touch Targets**:
   - Adjusted mobile SVG map container height to `h-[270px] sm:h-[370px] md:h-[430px]` to maintain crisp geometric ratios without squishing.
   - Enhanced touch-friendly selector pill buttons with horizontal scroll and clear active states.


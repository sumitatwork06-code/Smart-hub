# SmartHub: Vadodara City Twin & Decision Intelligence Console

SmartHub is an advanced, full-stack digital twin platform designed for municipal administrators, community organizers, and citizens. It integrates real-time environmental metrics, mobility telemetry, solar grid generation parameters, public safety patrols, and clinic queue management into a single unified workspace.

Leveraging Gemini AI, the platform translates raw telemetry streams into actionable decision support, enabling operators to analyze traffic bottlenecks, compile automation policies from natural language prompts, and trigger emergency EV dispatches.

---

## 🌟 Core System Modules

### 1. Unified Operations Dashboard & Interactive Charts
- **Real-Time KPIs**: Monitor key metrics including Air Quality Index (AQI), Traffic Congestion, Solar Generation output (kWh), Solid Waste Bin Capacity, Clinic Wait Times, and Emergency Patrol units.
- **Simulation Timeline**: Cycle through critical municipal periods: **08:00 (Commute Peak)**, **12:00 (Solar Peak)**, **18:00 (Evening commuted Rush)**, and **23:00 (Night Low Load)**. Shifting hours recalculates telemetry metrics across all zones dynamically.
- **Vibrant SVG Analytics**: Visually trace daily trends using interactive charts, tracking pollution levels, energy demand, and grid loading.

### 2. Operations Control Center
- **Simulated CCTV surveillance Deck**: View simulated camera streams (`CAM_ALKAPURI_01`, `CAM_FATEHGUNJ_02`, etc.) overlaid with scanline filters, green tracking overlays, FPS counters, and real-time statistics.
- **Manual Green Signal Override**: Instantly bypass congested zones by forcing green light signal cycles, reducing traffic congestion back to normal (20%) directly in the database.
- **Smart Grid Load Manager**: Engage backup solar battery storage arrays manually during grid warnings to resolve power overload incidents.
- **Active Incident Dispatcher**: View crowdsourced hazard reports and click **"Dispatch EV Response Vehicle"** with animated loading meters. Dispatches resolve the issue on the city map and return telemetry metrics back to safe levels.

### 3. Interactive GIS Map Deck
- Built using **Leaflet.js** and OpenStreetMap.
- Highlights city zones as circles color-coded by severity status (**Teal for Normal**, **Amber for Warning**, **Rose for Critical**).
- Renders glowing overlays and pulsing ambulance/police responder markers in zones experiencing active incidents.

### 4. Policy Automation Engine
- **Active Workflow Rules**: Toggles standard policies (e.g. reducing speed limits on high AQI warnings, shifting power loads on solar dropouts).
- **Gemini AI Rule Compiler**: Input natural language instructions (e.g. *"If clinic wait time in Zone A exceeds 35 minutes, dispatch a support responder"*) to compile and register structured rules in the system database.

### 5. Citizen Crowdsourcing Portal
- Simulates citizen feedback loops by allowing community members to submit geotagged reports under categories like *Infrastructure Damage*, *Traffic Hazard*, *Sanitation/Waste*, and *Environmental Issues*.

### 6. Gemini Decision AI Companion
- A persistent chat drawer integrating live city telemetry context (Retrieval-Augmented Generation / RAG).
- Provides actionable diagnostic support, alerts operators of pending bottlenecks, and suggests policy optimizations.

### 7. Direct Email Authentication
- Secure login and registration portal using email addresses.
- Restricts database edits and workspace access only to verified accounts.

---

## 📂 Project Directory Structure

```text
Smart hub/
├── README.md                 # System documentation
├── package.json              # Frontend scripts and bundler dependencies
├── vite.config.js            # Vite configuration
├── index.html                # Main html wrapper
├── start.bat                 # Bat executable to run servers concurrently
├── src/                      # Frontend Application
│   ├── assets/               # vadodara visuals, Palace, Gotri, and Alkapuri photos
│   ├── App.jsx               # Application coordinator, weather fetchers, geocoding
│   └── components/           # UI Dashboards
│       ├── Sidebar.jsx             # Drawer navigation with live alert count
│       ├── DashboardOverview.jsx   # KPI widgets and welcome panels
│       ├── SmartMap.jsx            # Leaflet map instance and pulsed markers
│       ├── OperationsCenter.jsx    # CCTV stream grids, dispatcher loaders, battery gates
│       ├── Workflows.jsx           # AI policy compiler and logs console
│       ├── CitizenPortal.jsx       # Crowd reports form
│       ├── DecisionAI.jsx          # Gemini RAG drawer
│       ├── LoginPage.jsx           # Secure email login/register inputs
│       └── InteractiveCharts.jsx   # SVG charts
└── server/                   # Backend Server
    ├── package.json          # Node dependencies
    ├── server.js             # Express.js REST API router
    ├── db.json               # JSON database (zones, users, workflows, reports)
    └── .env                  # Port and API Key variables
```

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite (Vanilla CSS design system, glassmorphism panel styles, and smooth micro-animations).
- **Interactive Map**: Leaflet GIS API.
- **Backend API**: Node.js + Express.js (cors, dotenv).
- **Database**: Flat JSON database (`db.json`) simulating a real-time municipal ledger.
- **AI Integrations**: `@google/generative-ai` (Gemini API).

---

## 🚀 Setup & Execution Guide

### 1. Configure Environment Variables
Create a `.env` file inside the `server/` directory:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no `GEMINI_API_KEY` is supplied, the chatbot and rule compiler will automatically fall back to an offline rule-based simulation engine).*

### 2. Install Dependencies & Run
Open two separate terminal windows in your project directory:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm install
node server.js
```
*Server runs at: `http://localhost:3001`*

**Terminal 2 (Frontend Dev Server)**:
```bash
npm install
npm.cmd run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 🖥️ REST API Specification

### Authentication Routes
- **`POST /api/login`**: Authenticates user emails.
  - *Payload*: `{ "username": "admin@example.com", "password": "password123" }`
  - *Returns*: `{ "success": true, "user": { "name": "Sunit Singh", "role": "City Planner", ... } }`
- **`POST /api/register`**: Creates new user profile.
  - *Payload*: `{ "name": "Jane Smith", "email": "jane@example.com", "role": "Community Rep", "password": "password123" }`
  - *Returns*: `{ "success": true, "user": { ... } }`

### Operations & Telemetry Routes
- **`GET /api/state`**: Fetches current municipal zones, active workflows, and reports.
- **`POST /api/state/sync`**: Syncs current telemetry states back to database.
- **`POST /api/telemetry/override`**: Manually overrides a specific metric.
  - *Payload*: `{ "zoneIdx": 0, "metric": "traffic", "value": 20 }`
- **`POST /api/telemetry/grid-boost`**: Boosts industrial zone solar energy generation above warning limits.
  - *Payload*: `{ "zoneIdx": 3 }`

### Incident Report Routes
- **`POST /api/reports`**: Files a new citizen hazard report.
  - *Payload*: `{ "category": "traffic", "zoneIdx": 0, "description": "Crash on road" }`
- **`POST /api/reports/resolve`**: Resolves an active report, removing warning indicators from maps and metrics.
  - *Payload*: `{ "id": 1782069757345 }`

### Workflow & AI Routes
- **`POST /api/evaluate`**: Runs workflows against telemetry, logging triggered alarms.
- **`POST /api/workflows/toggle`**: Toggles a workflow rule's active state.
- **`POST /api/workflows/create`**: Translates natural language prompts to structured rules via Gemini.
- **`POST /api/chat`**: Communicates with the AI Decision Engine using RAG contexts.

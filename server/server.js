import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import * as ss from 'simple-statistics';

dotenv.config();

// SMTP Transporter configuration for OTP dispatches
const smtpTransporter = (process.env.SMTP_HOST && process.env.SMTP_USER) ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

// Memory map for active OTP verification sessions
const activeOTPSessions = new Map();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to read database
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json, returning empty structure:", error);
    return { users: [], zones: [], workflows: [], citizenReports: [] };
  }
};

// Helper to write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
};

// Seeder logic to hash plaintext passwords on boot (cost factor 10)
const seedPasswords = () => {
  try {
    const db = readDB();
    if (!db.users || db.users.length === 0) return;
    let updated = false;
    db.users = db.users.map(u => {
      // Check if password is not already a bcrypt hash (standard length/formats start with $2a$ or $2b$)
      if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
        const salt = bcrypt.genSaltSync(10);
        u.password = bcrypt.hashSync(u.password, salt);
        updated = true;
      }
      return u;
    });
    if (updated) {
      writeDB(db);
      console.log("Database seeded successfully: Plaintext passwords migrated to bcrypt hashes.");
    }
  } catch (err) {
    console.error("Failed to seed passwords:", err);
  }
};

// Run seeder on startup
seedPasswords();

// Seeder to populate historical telemetry if missing
const seedHistory = () => {
  try {
    const db = readDB();
    if (!db.zones || db.zones.length === 0) return;
    let updated = false;
    db.zones = db.zones.map((zone, idx) => {
      if (!zone.history) {
        // Create baseline telemetry history
        const baseAqi = zone.baseAqi || 80;
        const baseWait = zone.baseHealthWait || 15;
        
        zone.history = [
          { hour: 7, aqi: Math.max(5, baseAqi - 15), healthWait: Math.max(2, baseWait - 6) },
          { hour: 8, aqi: Math.max(5, baseAqi + 5), healthWait: Math.max(2, baseWait + 2) },
          { hour: 9, aqi: Math.max(5, baseAqi + 20), healthWait: Math.max(2, baseWait + 10) },
          { hour: 10, aqi: Math.max(5, baseAqi + 12), healthWait: Math.max(2, baseWait + 5) },
          { hour: 11, aqi: Math.max(5, baseAqi - 8), healthWait: Math.max(2, baseWait - 3) },
          { hour: 12, aqi: Math.max(5, baseAqi - 12), healthWait: Math.max(2, baseWait - 7) }
        ];
        updated = true;
      }
      return zone;
    });
    if (updated) {
      writeDB(db);
      console.log("Database seeded successfully: Initialized telemetry history for Vadodara zones.");
    }
  } catch (err) {
    console.error("Failed to seed telemetry history:", err);
  }
};

// Run history seeder
seedHistory();

// Seeder to populate weather history if missing
const seedWeather = () => {
  try {
    const db = readDB();
    if (!db.zones || db.zones.length === 0) return;
    let updated = false;
    db.zones = db.zones.map((zone) => {
      if (!zone.weatherHistory) {
        const history = [];
        for (let day = 1; day <= 30; day++) {
          const baseHumid = 70 + Math.sin(day * 0.5) * 15;
          const temp = 30 - Math.sin(day * 0.5) * 4;
          // Rain occurs mostly on high humidity days
          const rain = baseHumid > 82 ? Math.max(0, Math.round((baseHumid - 80) * 2.5 + Math.random() * 10)) : 0;
          history.push({
            day,
            rainfall: rain,
            humidity: Math.round(baseHumid),
            temperature: Math.round(temp)
          });
        }
        zone.weatherHistory = history;
        updated = true;
      }
      return zone;
    });
    if (updated) {
      writeDB(db);
      console.log("Database seeded successfully: Initialized monthly weather history logs.");
    }
  } catch (err) {
    console.error("Failed to seed weather history:", err);
  }
};

// Run weather seeder
seedWeather();

// --- REST API ENDPOINTS ---

// Get full city state (zones, workflows, reports)
app.get('/api/state', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Authenticate User credentials
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDB();
  // Find user by username or email
  const user = db.users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Compare submitted plaintext password with stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Directly return authenticated user session (no OTP verification required)
  const { password: _, ...userSession } = user;
  res.json({ success: true, user: userSession });
});

// Register a new user profile
app.post('/api/register', async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: "Name, email, role, and password are required" });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered. Please sign in." });
  }

  // Hash password using bcryptjs with cost factor 10
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password.trim(), salt);

  const newUser = {
    username: email.trim(),
    password: hashedPassword,
    name: name.trim(),
    role: role.trim(),
    email: email.trim()
  };

  db.users.push(newUser);
  writeDB(db);

  // Directly return authenticated user session (no OTP verification required)
  const { password: _, ...userSession } = newUser;
  res.json({ success: true, user: userSession });
});

// Sync full zone state
app.post('/api/state/sync', (req, res) => {
  const { zones } = req.body;
  const db = readDB();
  if (zones) {
    db.zones = zones;
    writeDB(db);
  }
  res.json({ success: true, zones: db.zones });
});

// Update zone metrics manually (Override)
app.post('/api/telemetry/override', (req, res) => {
  const { zoneIdx, metric, value } = req.body;
  const db = readDB();

  if (zoneIdx === undefined || !metric || value === undefined) {
    return res.status(400).json({ error: "Missing required fields: zoneIdx, metric, value" });
  }

  const zone = db.zones[zoneIdx];
  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  zone[metric] = value;

  // Recalculate zone status based on traffic and AQI
  let status = 'normal';
  if (zone.aqi > 150 || zone.traffic > 75) status = 'critical';
  else if (zone.aqi > 100 || zone.traffic > 50) status = 'warning';
  zone.status = status;

  writeDB(db);
  res.json({ success: true, zones: db.zones });
});

// Save a new citizen report
app.post('/api/reports', (req, res) => {
  const { category, zoneName, zoneIdx, description } = req.body;
  const db = readDB();

  if (!category || !description || zoneIdx === undefined) {
    return res.status(400).json({ error: "Missing category, description, or zoneIdx" });
  }

  const newReport = {
    id: Date.now(),
    category,
    zoneName: zoneName || db.zones[zoneIdx].name,
    zoneIdx,
    description,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending'
  };

  db.citizenReports.unshift(newReport);

  // Sync to zone's activeIncidents
  const zone = db.zones[zoneIdx];
  if (zone) {
    zone.activeIncidents.push(`[Citizen Report] ${description}`);
    
    // Impact of incident on telemetry
    if (category === 'traffic') zone.traffic = Math.min(100, zone.traffic + 15);
    if (category === 'air') zone.aqi = Math.min(300, zone.aqi + 25);
    
    let status = 'normal';
    if (zone.aqi > 150 || zone.traffic > 75) status = 'critical';
    else if (zone.aqi > 100 || zone.traffic > 50) status = 'warning';
    zone.status = status;
  }

  writeDB(db);
  res.json({ success: true, citizenReports: db.citizenReports, zones: db.zones });
});

// Resolve a citizen report and update target zone telemetry
app.post('/api/reports/resolve', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing report id" });
  }

  const db = readDB();
  const report = db.citizenReports.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ error: "Citizen report not found" });
  }

  report.status = 'resolved';

  const zone = db.zones[report.zoneIdx];
  if (zone) {
    // Clear incident description from activeIncidents
    const targetMsg = `[Citizen Report] ${report.description}`;
    zone.activeIncidents = zone.activeIncidents.filter(inc => inc !== targetMsg);

    // Resolve impact on telemetry
    if (report.category === 'traffic') {
      zone.traffic = Math.max(zone.baseTraffic || 20, zone.traffic - 15);
    }
    if (report.category === 'air') {
      zone.aqi = Math.max(zone.baseAqi || 50, zone.aqi - 25);
    }

    // Recalculate status
    let status = 'normal';
    if (zone.aqi > 150 || zone.traffic > 75) status = 'critical';
    else if (zone.aqi > 100 || zone.traffic > 50) status = 'warning';
    zone.status = status;
  }

  writeDB(db);
  res.json({ success: true, citizenReports: db.citizenReports, zones: db.zones });
});

// Manual grid boost to resolve grid overload alerts
app.post('/api/telemetry/grid-boost', (req, res) => {
  const { zoneIdx } = req.body;
  if (zoneIdx === undefined) {
    return res.status(400).json({ error: "Missing zoneIdx" });
  }

  const db = readDB();
  const zone = db.zones[zoneIdx];
  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  // Boost energy generation to exceed critical limit (200 kWh)
  zone.energy = Math.max(220, zone.energy + 100);

  // Clear Grid Overload incident if present
  zone.activeIncidents = zone.activeIncidents.filter(inc => !inc.includes('Grid Overload'));

  // Recalculate status
  let status = 'normal';
  if (zone.aqi > 150 || zone.traffic > 75) status = 'critical';
  else if (zone.aqi > 100 || zone.traffic > 50) status = 'warning';
  zone.status = status;

  writeDB(db);
  res.json({ success: true, zones: db.zones });
});

// Evaluate Automation Workflow Rules
app.post('/api/evaluate', (req, res) => {
  const db = readDB();
  const logs = [];

  const updatedZones = db.zones.map((zone) => {
    let activeIncidents = [...zone.activeIncidents];
    let status = zone.status;

    // Rule 1: AQI Advisory
    const ruleAqi = db.workflows.find(w => w.id === 'aqi');
    if (ruleAqi && ruleAqi.active) {
      if (zone.aqi > 150) {
        const msg = 'Community Alert Issued: High AQI. Speed limits reduced to 30km/h.';
        if (!activeIncidents.includes(msg)) {
          activeIncidents.push(msg);
          logs.push({ type: 'trigger', ruleName: ruleAqi.name, zone: zone.name, detail: `AQI reached ${zone.aqi}` });
        }
        status = 'critical';
      } else {
        activeIncidents = activeIncidents.filter(inc => !inc.includes('High AQI'));
      }
    }

    // Rule 2: Grid Overload
    const ruleGrid = db.workflows.find(w => w.id === 'grid');
    if (ruleGrid && ruleGrid.active) {
      if (zone.energy < 200 && zone.name.includes('Industrial')) {
        const msg = 'Grid Overload: Switching grid load to secondary backup storage battery.';
        if (!activeIncidents.includes(msg)) {
          activeIncidents.push(msg);
          logs.push({ type: 'trigger', ruleName: ruleGrid.name, zone: zone.name, detail: `Solar generation fell to ${zone.energy} kWh` });
        }
        status = status === 'critical' ? 'critical' : 'warning';
      } else {
        activeIncidents = activeIncidents.filter(inc => !inc.includes('Grid Overload'));
      }
    }

    // Rule 3: Traffic Congestion Bypass
    const ruleTraffic = db.workflows.find(w => w.id === 'traffic');
    if (ruleTraffic && ruleTraffic.active) {
      if (zone.traffic > 70) {
        const msg = 'Transit Advisory: Congestion detected. Automated bypass routes initialized.';
        if (!activeIncidents.includes(msg)) {
          activeIncidents.push(msg);
          logs.push({ type: 'trigger', ruleName: ruleTraffic.name, zone: zone.name, detail: `Traffic congestion reached ${zone.traffic}%` });
        }
        status = 'critical';
      } else {
        activeIncidents = activeIncidents.filter(inc => !inc.includes('Congestion detected'));
      }
    }

    // Rule 4: Waste Route Dispatch
    const ruleWaste = db.workflows.find(w => w.id === 'waste');
    if (ruleWaste && ruleWaste.active) {
      if (zone.waste > 80) {
        const msg = 'EV Waste Dispatch: Automated collection route initialized.';
        if (!activeIncidents.includes(msg)) {
          activeIncidents.push(msg);
          logs.push({ type: 'trigger', ruleName: ruleWaste.name, zone: zone.name, detail: `Trash bin filled to ${zone.waste}%` });
        }
        status = status === 'critical' ? 'critical' : 'warning';
      } else {
        activeIncidents = activeIncidents.filter(inc => !inc.includes('EV Waste Dispatch'));
      }
    }

    // Custom Rules Evaluation
    db.workflows.forEach((rule) => {
      const standardIds = ['aqi', 'grid', 'traffic', 'waste'];
      if (standardIds.includes(rule.id) || !rule.active) return;

      const triggerLower = rule.trigger.toLowerCase();
      let matched = false;
      let detailInfo = '';

      // Check zone filters
      if (triggerLower.includes('zone a')) {
        if (!zone.name.includes('Zone A')) return;
      } else if (triggerLower.includes('zone b')) {
        if (!zone.name.includes('Zone B')) return;
      } else if (triggerLower.includes('zone c')) {
        if (!zone.name.includes('Zone C')) return;
      } else if (triggerLower.includes('zone d')) {
        if (!zone.name.includes('Zone D')) return;
      }

      // Check parameter matching
      if (triggerLower.includes('wait') || triggerLower.includes('clinic') || triggerLower.includes('health')) {
        const threshold = parseInt(triggerLower.replace(/[^0-9]/g, '')) || 20;
        if (zone.healthWait > threshold) {
          matched = true;
          detailInfo = `Clinic wait time reached ${zone.healthWait} mins (threshold: ${threshold})`;
        }
      } else if (triggerLower.includes('patrol') || triggerLower.includes('safety') || triggerLower.includes('units') || triggerLower.includes('police')) {
        const threshold = parseInt(triggerLower.replace(/[^0-9]/g, '')) || 5;
        if (triggerLower.includes('<') || triggerLower.includes('below') || triggerLower.includes('less')) {
          if (zone.safetyUnits < threshold) {
            matched = true;
            detailInfo = `Active patrols fell to ${zone.safetyUnits} units (threshold: <${threshold})`;
          }
        } else {
          if (zone.safetyUnits > threshold) {
            matched = true;
            detailInfo = `Active patrols reached ${zone.safetyUnits} units (threshold: >${threshold})`;
          }
        }
      } else if (triggerLower.includes('traffic') || triggerLower.includes('congestion')) {
        const threshold = parseInt(triggerLower.replace(/[^0-9]/g, '')) || 70;
        if (zone.traffic > threshold) {
          matched = true;
          detailInfo = `Traffic congestion reached ${zone.traffic}% (threshold: ${threshold}%)`;
        }
      } else if (triggerLower.includes('aqi') || triggerLower.includes('air')) {
        const threshold = parseInt(triggerLower.replace(/[^0-9]/g, '')) || 150;
        if (zone.aqi > threshold) {
          matched = true;
          detailInfo = `AQI reached ${zone.aqi} (threshold: ${threshold})`;
        }
      }

      if (matched) {
        const msg = `[Auto-Action] ${rule.action}`;
        if (!activeIncidents.includes(msg)) {
          activeIncidents.push(msg);
          logs.push({ type: 'trigger', ruleName: rule.name, zone: zone.name, detail: detailInfo });
        }
        status = 'critical';
      } else {
        activeIncidents = activeIncidents.filter(inc => !inc.includes(`[Auto-Action] ${rule.action}`));
      }
    });

    if (activeIncidents.length === 0) {
      status = 'normal';
    }

    return {
      ...zone,
      activeIncidents,
      status
    };
  });

  db.zones = updatedZones;
  writeDB(db);

  if (logs.length === 0) {
    logs.push({ type: 'clean', detail: 'Telemetry evaluation complete. All systems stable. No rules triggered.' });
  }

  res.json({ success: true, zones: db.zones, logs });
});

// Update workflow active status
app.post('/api/workflows/toggle', (req, res) => {
  const { id } = req.body;
  const db = readDB();

  const rule = db.workflows.find(w => w.id === id);
  if (!rule) {
    return res.status(404).json({ error: "Workflow rule not found" });
  }

  rule.active = !rule.active;
  writeDB(db);
  res.json({ success: true, workflows: db.workflows });
});

// Compile natural language workflows with Gemini API
app.post('/api/workflows/create', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt description is required" });
  }

  const db = readDB();
  const apiKey = process.env.GEMINI_API_KEY;
  let compiledRule = null;

  if (!apiKey) {
    console.log("No GEMINI_API_KEY detected. Using fallback mock rule generator.");
    const randomId = 'custom_' + Math.random().toString(36).substring(2, 7);
    compiledRule = {
      id: randomId,
      name: "Custom AI Rule " + randomId.substring(7).toUpperCase(),
      trigger: `Clinic Wait > 25 mins or Safety Patrols < 4 in Zone A`,
      action: `Send emergency dispatch responder to ${prompt.includes('Zone') ? prompt : 'Zone A'}`,
      active: true
    };
  } else {
    try {
      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `
You are a compiler for a Smart City rule automation engine.
Convert the user's natural language automation request into a single structured rule JSON object.

Rule Schema:
{
  "id": "unique slug like custom_clinic_wait (lowercase, underscores only)",
  "name": "Short, capitalised title (e.g. Clinic Wait Emergency Dispatch)",
  "trigger": "A clear condition (e.g. Clinic Wait > 30m in Zone A or Active Patrols < 3 units in Zone B)",
  "action": "A clear action (e.g. Dispatch 1 additional patrol unit or Send wellness broadcast)"
}

Input text: "${prompt}"

Return ONLY a valid JSON object matching the schema. Do not include markdown code block formatting (no \`\`\`json), do not include extra comments. Return exactly the raw JSON text.
`;

      const result = await model.generateContent(systemPrompt);
      const cleanedText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      compiledRule = JSON.parse(cleanedText);
      compiledRule.active = true;
    } catch (err) {
      console.error("Gemini Rule Compiler Error, returning fallback:", err);
      const randomId = 'custom_fail_' + Math.random().toString(36).substring(2, 6);
      compiledRule = {
        id: randomId,
        name: "Custom AI Rule " + randomId.substring(12).toUpperCase(),
        trigger: `Check if Clinic Wait > 20 mins or patrols < 3 units`,
        action: `Deploy emergency patrol units.`,
        active: true
      };
    }
  }

  db.workflows.push(compiledRule);
  writeDB(db);

  res.json({ success: true, workflows: db.workflows, rule: compiledRule });
});

// AI Chatbot with Gemini RAG integration
app.post('/api/chat', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const db = readDB();
  const apiKey = process.env.GEMINI_API_KEY;

  const avgAqi = Math.round(db.zones.reduce((sum, z) => sum + z.aqi, 0) / db.zones.length);
  const avgTraffic = Math.round(db.zones.reduce((sum, z) => sum + z.traffic, 0) / db.zones.length);
  const totalEnergy = Math.round(db.zones.reduce((sum, z) => sum + z.energy, 0));
  const avgWaste = Math.round(db.zones.reduce((sum, z) => sum + z.waste, 0) / db.zones.length);
  const avgHealthWait = Math.round(db.zones.reduce((sum, z) => sum + z.healthWait, 0) / db.zones.length);
  const totalSafetyUnits = Math.round(db.zones.reduce((sum, z) => sum + z.safetyUnits, 0));

  // Build telemetry context source snippets dynamically
  const sources = [];
  const qLower = query.toLowerCase();

  sources.push(`System-wide Averages: AQI=${avgAqi}, Congestion=${avgTraffic}%, Solar=${totalEnergy} kWh, Waste=${avgWaste}%, WaitTime=${avgHealthWait}m`);

  if (qLower.includes('air') || qLower.includes('pollution') || qLower.includes('aqi')) {
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]} Air Quality: ${z.aqi} AQI (Status: ${z.status})`);
    });
  } else if (qLower.includes('traffic') || qLower.includes('congestion') || qLower.includes('delay') || qLower.includes('road')) {
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]} Congestion: ${z.traffic}% (Status: ${z.status})`);
    });
  } else if (qLower.includes('solar') || qLower.includes('energy') || qLower.includes('power') || qLower.includes('grid')) {
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]} Solar Production: ${z.energy} kWh`);
    });
  } else if (qLower.includes('wait') || qLower.includes('clinic') || qLower.includes('hospital') || qLower.includes('health') || qLower.includes('queue')) {
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]} Clinic Wait Time: ${z.healthWait} mins`);
    });
  } else if (qLower.includes('safety') || qLower.includes('patrol') || qLower.includes('police') || qLower.includes('responder') || qLower.includes('security')) {
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]} Emergency Patrols: ${z.safetyUnits} active units`);
    });
  } else {
    // Default: include status of all zones
    db.zones.forEach(z => {
      sources.push(`${z.name.split(':')[0]}: Status=${z.status.toUpperCase()}, AQI=${z.aqi}, Traffic=${z.traffic}%`);
    });
  }

  // Calculate context correlation confidence level
  let confidence = 'Low';
  const keywords = ['air', 'aqi', 'pollution', 'traffic', 'congestion', 'delay', 'solar', 'energy', 'power', 'grid', 'waste', 'garbage', 'bin', 'wait', 'clinic', 'hospital', 'health', 'safety', 'patrol', 'police', 'responder'];
  const hasKeyword = keywords.some(k => qLower.includes(k));
  if (hasKeyword) {
    confidence = 'High';
  } else if (qLower.includes('vadodara') || qLower.includes('city') || qLower.includes('zone') || qLower.includes('status') || qLower.includes('report') || qLower.includes('baroda')) {
    confidence = 'Medium';
  }

  // Rule-based Fallback if API Key is not set
  if (!apiKey) {
    console.log("No GEMINI_API_KEY detected. Using fallback analytics engine.");
    let responseText = '';

    if (qLower.includes('air') || qLower.includes('pollution') || qLower.includes('aqi')) {
      const highAqiZones = db.zones.filter(z => z.aqi > 100);
      responseText = highAqiZones.length > 0 
        ? `[MOCK ENGINE] Air Quality average is ${avgAqi} AQI. Warning: ${highAqiZones.map(z => z.name.split(':')[0]).join(', ')} report elevated indices. Activate "AQI Advisory" triggers.`
        : `[MOCK ENGINE] Air quality averages ${avgAqi} AQI (Optimal). All districts safe.`;
    } else if (qLower.includes('traffic') || qLower.includes('congestion') || qLower.includes('delay')) {
      const heavyTrafficZones = db.zones.filter(z => z.traffic > 50);
      responseText = heavyTrafficZones.length > 0 
        ? `[MOCK ENGINE] Average congestion stands at ${avgTraffic}%. Congestion heavy in: ${heavyTrafficZones.map(z => z.name.split(':')[0]).join(', ')}. Recommend initializing Traffic detour signals.`
        : `[MOCK ENGINE] Traffic flows are normal (Average congestion ${avgTraffic}%). No alerts active.`;
    } else if (qLower.includes('energy') || qLower.includes('solar') || qLower.includes('power')) {
      responseText = `[MOCK ENGINE] Solar arrays producing ${totalEnergy} kWh city-wide. Grid functioning stably. Secondary battery backups are active and normal.`;
    } else if (qLower.includes('waste') || qLower.includes('bin') || qLower.includes('garbage')) {
      responseText = `[MOCK ENGINE] Waste bins average ${avgWaste}% full. Dispatch fleet for areas reporting > 80% capacity.`;
    } else if (qLower.includes('health') || qLower.includes('clinic') || qLower.includes('wait') || qLower.includes('hospital')) {
      responseText = `[MOCK ENGINE] Healthcare status: Average clinic wait time across the city is ${avgHealthWait} minutes. Wellness centers are operating at nominal capacity.`;
    } else if (qLower.includes('safety') || qLower.includes('patrol') || qLower.includes('police') || qLower.includes('responder') || qLower.includes('emergency')) {
      responseText = `[MOCK ENGINE] Public safety status: There are currently ${totalSafetyUnits} active emergency responder patrol units deployed across all sectors to ensure swift incident coverage.`;
    } else if (qLower.includes('diagnosis') || qLower.includes('report') || qLower.includes('recommend')) {
      responseText = `[MOCK ENGINE] Smart City Health Diagnostic:
- Environmental: Average AQI is ${avgAqi}
- Mobility: Average Congestion is ${avgTraffic}%
- Utilities: Solar Output is ${totalEnergy} kWh, Waste capacity is ${avgWaste}%
- Healthcare: Average Clinic Wait Time is ${avgHealthWait} mins
- Public Safety: Total Active Responder Patrols is ${totalSafetyUnits} units
- Recommendations: Keep triggers active. File reports via Citizen Portal for simulated testing.`;
    } else {
      responseText = `[MOCK ENGINE] City health is optimal. Ask me about "Air Quality", "Traffic Congestion", "Clean Solar Generation", "Solid Waste", "Clinic Wait Times", or "Emergency Patrols".`;
    }

    return res.json({ response: responseText, sources, confidence });
  }

  // Live Gemini API call
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format city state as context for RAG
    const systemContext = `
You are the AI Decision Engine for the Smart City Decision Hub.
Below is the current telemetry, active incidents, and citizen reports for the city:
- Average AQI: ${avgAqi}
- Average Congestion: ${avgTraffic}%
- Total Solar Energy: ${totalEnergy} kWh
- Average Waste Capacity: ${avgWaste}%
- Average Clinic Wait: ${avgHealthWait} mins
- Total Active Emergency Responders: ${totalSafetyUnits} units

District Statuses:
${db.zones.map(z => `- ${z.name}: AQI=${z.aqi}, Traffic=${z.traffic}%, Solar Gen=${z.energy} kWh, Waste=${z.waste}%, Clinic Wait=${z.healthWait}m, Active Responders=${z.safetyUnits}, Status=${z.status}, Active Incidents: [${z.activeIncidents.join(', ')}]`).join('\n')}

Active Automation Rules:
${db.workflows.map(w => `- ${w.name} (Active=${w.active}): Trigger [${w.trigger}] -> Action [${w.action}]`).join('\n')}

Recent Citizen Incident Logs:
${db.citizenReports.slice(0, 5).map(r => `- [${r.category.toUpperCase()}] Location: ${r.zoneName.split(':')[0]}, Status: ${r.status}, Message: "${r.description}"`).join('\n')}

Provide detailed, concise, and structured decision support analysis. Focus on identifying bottlenecks, proposing automation overrides, and suggesting policy improvements. Keep response text compact, clear, and action-oriented.
`;

    const chatSession = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Introduce yourself and explain what you analyze." }] },
        { role: "model", parts: [{ text: "Hello! I am your Smart City AI Decision Engine. I analyze live telemetry, incident logs, and citizen reports to provide actionable city management alerts and recommendations." }] }
      ]
    });

    const prompt = `${systemContext}\n\nUser Question: ${query}`;
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    res.json({ response: responseText, sources, confidence });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Gemini API encountered an error: " + error.message });
  }
});

// Multimodal Gemini Vision analysis endpoint for CCTV feeds
app.post('/api/vision/analyze', async (req, res) => {
  const { zoneIdx } = req.body;
  if (zoneIdx === undefined) {
    return res.status(400).json({ error: "Missing required parameter: zoneIdx" });
  }

  const db = readDB();
  const zone = db.zones[zoneIdx];
  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  // Pre-mapped images by zone index
  const imageNames = [
    'vadodara_alkapuri.png',
    'vadodara_fatehgunj.png',
    'vadodara_gotri.png',
    'vadodara_manjalpur.png'
  ];
  
  const imageName = imageNames[zoneIdx] || imageNames[0];
  const imagePath = path.join(__dirname, '../src/assets', imageName);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Dynamic Mock Fallback based on live telemetry parameters and active incidents in the database
    const vehicleCount = Math.max(5, Math.round(zone.traffic * 0.6 + (Math.random() * 6 - 3)));
    
    let crowdDensity = 'Low';
    if (zone.traffic > 70) crowdDensity = 'High';
    else if (zone.traffic > 40) crowdDensity = 'Medium';

    // Parse active anomalies from the incidents registered in the DB
    const anomalies = [];
    zone.activeIncidents.forEach(inc => {
      const incLower = inc.toLowerCase();
      if (incLower.includes('congest') || incLower.includes('traffic')) {
        anomalies.push('traffic congestion');
      }
      if (incLower.includes('overload') || incLower.includes('grid')) {
        anomalies.push('grid warning');
      }
      if (incLower.includes('citizen report')) {
        anomalies.push('reported hazard');
      }
    });

    // Preset zone specific static anomaly indicators for testing
    if (zoneIdx === 1 && anomalies.length === 0) anomalies.push('blocked lane');
    if (zoneIdx === 2 && anomalies.length === 0) anomalies.push('stalled vehicle');

    const responseJSON = {
      success: true,
      vehicleCount,
      crowdDensity,
      anomalies,
      confidenceScore: parseFloat((0.85 + Math.random() * 0.12).toFixed(2))
    };

    return res.json(responseJSON);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Read image from disk and encode to base64
    if (!fs.existsSync(imagePath)) {
      throw new Error(`CCTV Frame asset not found at path: ${imagePath}`);
    }
    const base64Data = fs.readFileSync(imagePath).toString("base64");
    const mimeType = "image/png";

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const systemPrompt = `
Analyze this CCTV traffic surveillance camera frame from a Vadodara municipal zone.
Perform the following vision detection tasks:
1. Count the number of vehicles visible in the frame (cars, motorcycles, buses, rickshaws).
2. Estimate the crowd density of pedestrians (Return one of: "Low", "Medium", "High").
3. Detect any anomalies in the traffic pattern (e.g., "stalled vehicle", "blocked lane", "unusual crowding"). If none are found, return an empty array.
4. Output a confidence score for the analysis between 0.0 and 1.0.

You must respond ONLY with a valid JSON object matching the following structure:
{
  "vehicleCount": number,
  "crowdDensity": "Low" | "Medium" | "High",
  "anomalies": string[],
  "confidenceScore": number
}

Do not include markdown formatting (do not wrap in \`\`\`json). Return exactly the raw JSON text.
`;

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text().trim();
    
    // Clean response markup just in case
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const responseJSON = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...responseJSON
    });
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    const vehicleCount = Math.round(zone.traffic * 0.5 + 5);
    res.json({
      success: true,
      vehicleCount,
      crowdDensity: zone.traffic > 60 ? "High" : "Medium",
      anomalies: ["API connection alert"],
      confidenceScore: 0.5
    });
  }
});

// Expose forecasting API using simple-statistics linear regression
app.get('/api/forecast/:zone', (req, res) => {
  const param = req.params.zone;
  const db = readDB();
  
  let zoneIdx = parseInt(param);
  let zone = null;

  if (!isNaN(zoneIdx) && db.zones[zoneIdx]) {
    zone = db.zones[zoneIdx];
  } else {
    zoneIdx = db.zones.findIndex(z => z.name.toLowerCase().includes(param.toLowerCase()));
    if (zoneIdx !== -1) {
      zone = db.zones[zoneIdx];
    }
  }

  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  // Fallback history array just in case database loading encounters an empty log
  const history = zone.history || [
    { hour: 7, aqi: zone.baseAqi || 80, healthWait: zone.baseHealthWait || 15 },
    { hour: 8, aqi: (zone.baseAqi || 80) + 5, healthWait: (zone.baseHealthWait || 15) + 2 },
    { hour: 9, aqi: (zone.baseAqi || 80) + 15, healthWait: (zone.baseHealthWait || 15) + 8 },
    { hour: 10, aqi: (zone.baseAqi || 80) + 10, healthWait: (zone.baseHealthWait || 15) + 4 }
  ];

  // Perform linear regression: y = mx + b
  const aqiPoints = history.map(pt => [pt.hour, pt.aqi]);
  const healthPoints = history.map(pt => [pt.hour, pt.healthWait]);

  const aqiRegression = ss.linearRegression(aqiPoints);
  const healthRegression = ss.linearRegression(healthPoints);

  const aqiLine = ss.linearRegressionLine(aqiRegression);
  const healthLine = ss.linearRegressionLine(healthRegression);

  // Project the next 3 hours
  const lastHour = history[history.length - 1].hour;
  const forecast = [];

  for (let i = 1; i <= 3; i++) {
    const targetHour = lastHour + i;
    const projectedAqi = Math.max(5, Math.round(aqiLine(targetHour)));
    const projectedHealth = Math.max(2, Math.round(healthLine(targetHour)));
    forecast.push({
      hour: targetHour,
      aqi: projectedAqi,
      healthWait: projectedHealth
    });
  }

  res.json({
    success: true,
    zoneName: zone.name,
    zoneIdx,
    history,
    forecast,
    regression: {
      aqi: { slope: aqiRegression.m, intercept: aqiRegression.b },
      health: { slope: healthRegression.m, intercept: healthRegression.b }
    }
  });
});

// Citizen Travel Advisory and service routing optimizer
app.post('/api/advisory/optimize', (req, res) => {
  const { originIdx, destinationType } = req.body;
  if (originIdx === undefined || !destinationType) {
    return res.status(400).json({ error: "Missing originIdx or destinationType parameters" });
  }

  const db = readDB();
  const originZone = db.zones[originIdx];
  if (!originZone) {
    return res.status(404).json({ error: "Starting origin zone not found" });
  }

  // Define candidate targets matching the requested type
  // indices: 0 = Alkapuri (Commercial), 1 = Fatehgunj (Academic), 2 = Gotri (Medical), 3 = Makarpura (Industrial)
  let candidates = [];
  if (destinationType === 'medical') {
    candidates = [2]; // Gotri Medical Hub is the main target, but let's evaluate options
  } else if (destinationType === 'commercial') {
    candidates = [0];
  } else if (destinationType === 'academic') {
    candidates = [1];
  } else if (destinationType === 'industrial') {
    candidates = [3];
  } else {
    candidates = [0, 1, 2, 3];
  }

  // Find the candidate zone with the optimal operational scoring
  // Lower score is better. Score = Congestion percentage + wait time index
  let bestZoneIdx = candidates[0];
  let minScore = Infinity;

  candidates.forEach(idx => {
    const zone = db.zones[idx];
    if (zone) {
      let score = zone.traffic;
      if (destinationType === 'medical') {
        score += (zone.healthWait || 15) * 1.5;
      }
      if (score < minScore) {
        minScore = score;
        bestZoneIdx = idx;
      }
    }
  });

  const bestZone = db.zones[bestZoneIdx];

  // Calculate route metrics
  const travelTimeMinutes = Math.round(10 + (originZone.traffic + bestZone.traffic) * 0.15);
  
  let trafficLevel = 'Optimal Flow';
  if ((originZone.traffic + bestZone.traffic) / 2 > 60) {
    trafficLevel = 'Heavy Congestion';
  } else if ((originZone.traffic + bestZone.traffic) / 2 > 35) {
    trafficLevel = 'Moderate Flow';
  }

  // Build recommendation text
  let advice = `Route clear. Travelling to ${bestZone.name.split(':')[0]} is currently optimal.`;
  if (trafficLevel === 'Heavy Congestion') {
    advice = `Transit warning: Heavy congestion detected on the main bypass. Recommend using alternate automated detours via Outer Ring Road.`;
  }
  if (destinationType === 'medical' && bestZone.healthWait > 30) {
    advice += ` Note: Clinic wait times at ${bestZone.name.split(':')[0]} are currently elevated (${bestZone.healthWait} mins). Consider delaying non-emergency visits.`;
  }

  res.json({
    success: true,
    originZoneName: originZone.name,
    bestZoneName: bestZone.name,
    bestZoneIdx,
    travelTimeMinutes,
    trafficLevel,
    advice,
    metrics: {
      congestion: bestZone.traffic,
      waitTime: bestZone.healthWait || 0,
      aqi: bestZone.aqi
    }
  });
});

// Weather intelligence and precipitation forecasting API
app.get('/api/weather/forecast/:zone', (req, res) => {
  const param = req.params.zone;
  const db = readDB();
  
  let zoneIdx = parseInt(param);
  let zone = null;

  if (!isNaN(zoneIdx) && db.zones[zoneIdx]) {
    zone = db.zones[zoneIdx];
  } else {
    zoneIdx = db.zones.findIndex(z => z.name.toLowerCase().includes(param.toLowerCase()));
    if (zoneIdx !== -1) {
      zone = db.zones[zoneIdx];
    }
  }

  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  const history = zone.weatherHistory || [];
  
  // Calculate linear regression of humidity -> rainfall
  const points = history.map(pt => [pt.humidity, pt.rainfall]);
  const regression = ss.linearRegression(points);
  const rainLine = ss.linearRegressionLine(regression);

  // Forecast next 7 days (days 31 to 37)
  const forecast = [];
  for (let i = 1; i <= 7; i++) {
    const targetDay = 30 + i;
    const projectedHumidity = Math.min(100, Math.round(80 + Math.sin(i * 0.8) * 10 + Math.random() * 5));
    const projectedTemp = Math.round(28 - Math.sin(i * 0.8) * 2);
    // If humidity is high, calculate regression line value + random variation
    const projectedRain = projectedHumidity > 82 ? Math.max(0, Math.round(rainLine(projectedHumidity) + Math.random() * 12)) : 0;
    forecast.push({
      day: targetDay,
      rainfall: projectedRain,
      humidity: projectedHumidity,
      temperature: projectedTemp
    });
  }

  const totalPredictedRain = forecast.reduce((sum, f) => sum + f.rainfall, 0);
  let recommendation = "Rainfall parameters within nominal drainage limits. Keep municipal pumps on standby.";
  let dangerLevel = "Low";

  if (totalPredictedRain > 100) {
    recommendation = "CRITICAL ACTION REQUIRED: Predicted monsoon rainfall exceeds 100mm. Automatically opening Gotri and Alkapuri storm sluice gates 100%. Deploying emergency pump reserves.";
    dangerLevel = "High";
  } else if (totalPredictedRain > 50) {
    recommendation = "ADVISORY ALERT: Elevated precipitation forecast (50-100mm). Recommend activating automated sump pumps in low-lying corridors.";
    dangerLevel = "Medium";
  }

  res.json({
    success: true,
    zoneName: zone.name,
    zoneIdx,
    history,
    forecast,
    totalPredictedRain,
    dangerLevel,
    recommendation,
    regression: {
      slope: regression.m,
      intercept: regression.b
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Smart City backend server listening at http://localhost:${PORT}`);
});

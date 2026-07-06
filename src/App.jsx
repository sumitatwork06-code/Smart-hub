import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import SmartMap from './components/SmartMap';
import Workflows from './components/Workflows';
import DecisionAI from './components/DecisionAI';
import CitizenPortal from './components/CitizenPortal';
import CitizenAdvisory from './components/CitizenAdvisory';
import WeatherIntelligence from './components/WeatherIntelligence';
import InteractiveCharts from './components/InteractiveCharts';
import { Play, Pause, Search, MapPin, CloudSun, Wind as WindIcon, Thermometer } from 'lucide-react';

import LoginPage from './components/LoginPage';
import OperationsCenter from './components/OperationsCenter';

const DEFAULT_CITIES = [
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
];

const getZoneNameForCity = (cityName, zoneLetter) => {
  const normCity = cityName.toLowerCase();
  if (normCity.includes('vadodara')) {
    if (zoneLetter === 'A') return 'Zone A: Alkapuri Commercial Core';
    if (zoneLetter === 'B') return 'Zone B: Fatehgunj Academic Hub';
    if (zoneLetter === 'C') return 'Zone C: Akota-Gotri Medical Hub';
    return 'Zone D: Makarpura Industrial Zone';
  } else if (normCity.includes('ahmedabad')) {
    if (zoneLetter === 'A') return 'Zone A: Satellite Business Hub';
    if (zoneLetter === 'B') return 'Zone B: Vastrapur Academic District';
    if (zoneLetter === 'C') return 'Zone C: Ashram Road Healthcare';
    return 'Zone D: Naroda Industrial Estate';
  } else if (normCity.includes('mumbai')) {
    if (zoneLetter === 'A') return 'Zone A: BKC Commercial Center';
    if (zoneLetter === 'B') return 'Zone B: Fort Heritage District';
    if (zoneLetter === 'C') return 'Zone C: Bandra Medical Center';
    return 'Zone D: Thane Industrial Zone';
  } else if (normCity.includes('delhi')) {
    if (zoneLetter === 'A') return 'Zone A: Connaught Place Core';
    if (zoneLetter === 'B') return 'Zone B: South Campus Academic';
    if (zoneLetter === 'C') return 'Zone C: Dwarka Healthcare Hub';
    return 'Zone D: Okhla Industrial Area';
  } else {
    const cleanCity = cityName.split(',')[0];
    if (zoneLetter === 'A') return `Zone A: ${cleanCity} Commercial Hub`;
    if (zoneLetter === 'B') return `Zone B: ${cleanCity} Academic Center`;
    if (zoneLetter === 'C') return `Zone C: ${cleanCity} Medical Sector`;
    return `Zone D: ${cleanCity} Industrial District`;
  }
};

const projectZonesForCity = (cityName, lat, lng, baseZones) => {
  return baseZones.map((zone, idx) => {
    let latOffset = 0;
    let lngOffset = 0;
    let letter = 'A';
    if (idx === 0) {
      latOffset = 0.0057;
      lngOffset = -0.0139;
      letter = 'A';
    } else if (idx === 1) {
      latOffset = 0.0125;
      lngOffset = 0.0061;
      letter = 'B';
    } else if (idx === 2) {
      latOffset = 0.0043;
      lngOffset = -0.0321;
      letter = 'C';
    } else {
      latOffset = -0.0331;
      lngOffset = 0.0158;
      letter = 'D';
    }

    return {
      ...zone,
      name: getZoneNameForCity(cityName, letter),
      lat: Number((lat + latOffset).toFixed(4)),
      lng: Number((lng + lngOffset).toFixed(4))
    };
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeHour, setTimeHour] = useState(12);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smarthub_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Core global state fetched from the backend server
  const [cityState, setCityState] = useState({
    zones: [],
    workflows: []
  });

  const [citizenReports, setCitizenReports] = useState([]);
  const [isPlayMode, setIsPlayMode] = useState(false);

  // City and live weather states
  const [activeCity, setActiveCity] = useState('Vadodara');
  const [cityCoords, setCityCoords] = useState({ lat: 22.3072, lng: 73.1812 });
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isPlayMode) {
      intervalId = setInterval(() => {
        const hours = [8, 12, 18, 23];
        const currentIndex = hours.indexOf(timeHour);
        const nextIndex = (currentIndex + 1) % hours.length;
        updateTimelineHour(hours[nextIndex]);
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlayMode, timeHour]);

  // Fetch initial state from server
  const fetchState = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/state`);
      const data = await res.json();
      
      // Update coordinates dynamically if Vadodara is active
      const vadodaraZones = projectZonesForCity('Vadodara', 22.3072, 73.1812, data.zones);
      setCityState({ zones: vadodaraZones, workflows: data.workflows });
      setCitizenReports(data.citizenReports);
      
      // Fetch default weather info
      fetchRealWeather(22.3072, 73.1812);
    } catch (err) {
      console.error("Failed to load initial city state from server:", err);
    }
  };

  const fetchRealWeather = async (lat, lng) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
      const data = await res.json();
      if (data && data.current) {
        setWeatherInfo({
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m)
        });
      }
    } catch (err) {
      console.error("Open-Meteo fetch failed:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchState();
    }
  }, [user]);

  const handleLocationChange = async (cityName, lat, lng) => {
    setActiveCity(cityName);
    setCityCoords({ lat, lng });
    await fetchRealWeather(lat, lng);

    if (cityState.zones.length > 0) {
      const projected = projectZonesForCity(cityName, lat, lng, cityState.zones);
      setCityState(prev => ({ ...prev, zones: projected }));

      // Sync with database
      try {
        await fetch(`http://${window.location.hostname}:3001/api/state/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zones: projected })
        });
      } catch (err) {
        console.error("Failed to sync new city zones with server:", err);
      }
    }
  };

  const handleSearchCity = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        const name = first.display_name.split(',')[0];
        await handleLocationChange(name, lat, lng);
        setSearchQuery('');
      } else {
        alert("Location not found. Please try another city.");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      alert("Search failed. Check your internet connection.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('smarthub_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smarthub_user');
  };

  // Adjust telemetry based on time of day and sync to server
  const updateTimelineHour = async (hour) => {
    setTimeHour(hour);
    if (cityState.zones.length === 0) return;

    // Open-Meteo real weather influence factors
    let weatherModifierSolar = 0;
    let weatherModifierAqi = 0;
    let weatherModifierGrid = 0;

    if (weatherInfo) {
      if (weatherInfo.temp > 28) {
        weatherModifierSolar = (weatherInfo.temp - 28) * 12; // Boost solar on hot days
        weatherModifierGrid = (weatherInfo.temp - 28) * 18;  // High AC grid load
      }
      if (weatherInfo.windSpeed > 10) {
        weatherModifierAqi = -Math.round(weatherInfo.windSpeed * 1.5); // Wind cleans AQI
      }
    }
    
    const updatedZones = cityState.zones.map((zone) => {
      let trafficModifier = 0;
      let aqiModifier = 0;
      let energyModifier = 0;
      let wasteModifier = 0;
      let healthModifier = 0;
      let safetyModifier = 0;

      if (hour === 8) {
        // Morning commute rush
        trafficModifier = zone.name.includes('Commercial') || zone.name.includes('Academic') ? 35 : 10;
        aqiModifier = 15;
        energyModifier = -50;
        wasteModifier = 5;
        healthModifier = 5;
        safetyModifier = 0;
      } else if (hour === 12) {
        // Midday Solar peak
        trafficModifier = -15;
        aqiModifier = -10;
        energyModifier = zone.name.includes('Industrial') ? 220 : 150;
        wasteModifier = 22;
        healthModifier = 15;
        safetyModifier = -1;
      } else if (hour === 18) {
        // Evening Rush
        trafficModifier = zone.name.includes('Commercial') || zone.name.includes('Academic') ? 45 : 20;
        aqiModifier = 30;
        energyModifier = -100;
        wasteModifier = 10;
        healthModifier = 8;
        safetyModifier = 2;
      } else if (hour === 23) {
        // Night low load
        trafficModifier = -25;
        aqiModifier = -20;
        energyModifier = -180;
        wasteModifier = 5;
        healthModifier = -5;
        safetyModifier = 4;
      }

      const newTraffic = Math.max(5, Math.min(100, zone.baseTraffic + trafficModifier));
      const newAqi = Math.max(10, Math.min(300, zone.baseAqi + aqiModifier + weatherModifierAqi));
      const newEnergy = Math.max(0, zone.baseEnergy + energyModifier + (zone.name.includes('Industrial') ? weatherModifierSolar * 1.4 : weatherModifierSolar));
      const newWaste = Math.max(0, Math.min(100, zone.baseWaste + wasteModifier));
      const newHealthWait = Math.max(2, Math.min(120, (zone.baseHealthWait !== undefined ? zone.baseHealthWait : 15) + healthModifier));
      const newSafetyUnits = Math.max(1, Math.min(20, (zone.baseSafetyUnits !== undefined ? zone.baseSafetyUnits : 5) + safetyModifier));

      let status = 'normal';
      if (newAqi > 150 || newTraffic > 75) status = 'critical';
      else if (newAqi > 100 || newTraffic > 50) status = 'warning';

      return {
        ...zone,
        traffic: newTraffic,
        aqi: newAqi,
        energy: newEnergy + weatherModifierGrid,
        waste: newWaste,
        healthWait: newHealthWait,
        safetyUnits: newSafetyUnits,
        status,
      };
    });

    setCityState(prev => ({ ...prev, zones: updatedZones }));

    try {
      await fetch(`http://${window.location.hostname}:3001/api/state/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones: updatedZones })
      });
    } catch (err) {
      console.error("Failed to sync timeline telemetry with server:", err);
    }
  };

  // Add crowdsourced report and update target zone
  const handleAddReport = async (report) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      const data = await res.json();
      if (data.success) {
        setCitizenReports(data.citizenReports);
        setCityState(prev => ({ ...prev, zones: data.zones }));
      }
    } catch (err) {
      console.error("Failed to post citizen report to server:", err);
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (cityState.zones.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', color: '#fff', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'hsl(var(--color-teal))', borderRadius: '50%', animation: 'pulse-glow 1s infinite linear' }} />
        <span>Syncing Digital Twin state...</span>
      </div>
    );
  }

  return (
    <div className={`app-container-bg bg-glow-${timeHour}`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cityState={cityState} 
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Panel Content */}
      <main className="main-content">
        {/* Scenario Playback Slider & City Selector */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(10, 12, 20, 0.4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Simulation Timeline</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--color-teal))' }}>
                Time: {timeHour === 8 ? '08:00 (Commute Peak)' : timeHour === 12 ? '12:00 (Solar peak)' : timeHour === 18 ? '18:00 (Commute Peak)' : '23:00 (Night Load)'}
              </span>
            </div>

            {/* City Selector HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Weather info badge */}
              {weatherInfo && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(20, 180, 160, 0.08)',
                  border: '1px solid rgba(20, 180, 160, 0.2)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  color: 'hsl(var(--color-teal))',
                }}>
                  <CloudSun size={14} />
                  <span>{weatherInfo.temp}°C</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                  <WindIcon size={14} />
                  <span>{weatherInfo.windSpeed} km/h</span>
                </div>
              )}

              {/* City Dropdown */}
              <div style={{ position: 'relative' }}>
                <select
                  value={activeCity}
                  onChange={(e) => {
                    const selected = DEFAULT_CITIES.find(c => c.name === e.target.value);
                    if (selected) {
                      handleLocationChange(selected.name, selected.lat, selected.lng);
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.4rem 2rem 0.4rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  {DEFAULT_CITIES.map(c => (
                    <option key={c.name} value={c.name} style={{ background: '#0c0f16' }}>{c.name}</option>
                  ))}
                  {!DEFAULT_CITIES.some(c => c.name === activeCity) && (
                    <option value={activeCity} style={{ background: '#0c0f16' }}>{activeCity}</option>
                  )}
                </select>
                <MapPin size={12} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'hsl(var(--color-primary))' }} />
              </div>

              {/* Search city input */}
              <form onSubmit={handleSearchCity} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Predict anywhere..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.5rem 0.4rem 2rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    width: '130px',
                    outline: 'none',
                    transition: 'width 0.2s',
                  }}
                  onFocus={(e) => e.target.style.width = '170px'}
                  onBlur={(e) => setTimeout(() => e.target.style.width = '130px', 200)}
                />
                <Search size={12} style={{ position: 'absolute', left: '0.75rem', color: 'hsl(var(--text-muted))' }} />
                <button type="submit" style={{ display: 'none' }} disabled={geocoding} />
              </form>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsPlayMode(!isPlayMode)}
              style={{
                background: isPlayMode ? 'rgba(20, 180, 160, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isPlayMode ? '1px solid hsl(var(--color-teal))' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: isPlayMode ? 'hsl(var(--color-teal))' : '#fff',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s',
                boxShadow: isPlayMode ? '0 0 10px rgba(20, 180, 160, 0.2)' : 'none',
                outline: 'none',
              }}
            >
              {isPlayMode ? (
                <>
                  <Pause size={12} fill="hsl(var(--color-teal))" /> Pause Sim
                </>
              ) : (
                <>
                  <Play size={12} fill="#fff" /> Auto Play
                </>
              )}
            </button>
            <button className={`timeline-mark ${timeHour === 8 ? 'active' : ''}`} onClick={() => updateTimelineHour(8)}>08:00</button>
            <button className={`timeline-mark ${timeHour === 12 ? 'active' : ''}`} onClick={() => updateTimelineHour(12)}>12:00</button>
            <button className={`timeline-mark ${timeHour === 18 ? 'active' : ''}`} onClick={() => updateTimelineHour(18)}>18:00</button>
            <button className={`timeline-mark ${timeHour === 23 ? 'active' : ''}`} onClick={() => updateTimelineHour(23)}>23:00</button>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: '150px' }}>
              <input 
                type="range" 
                min="0" 
                max="3" 
                value={timeHour === 8 ? 0 : timeHour === 12 ? 1 : timeHour === 18 ? 2 : 3} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const hours = [8, 12, 18, 23];
                  updateTimelineHour(hours[val]);
                }}
                className="timeline-slider"
              />
            </div>
          </div>
        </div>

        {/* Tab Selection Rendering */}
        {activeTab === 'overview' && (
          <>
            <DashboardOverview 
              cityState={cityState} 
              setCityState={setCityState} 
              setActiveTab={setActiveTab}
            />
            {/* SVG Interactive Charts panel */}
            <InteractiveCharts cityState={cityState} timeHour={timeHour} />
          </>
        )}
        {activeTab === 'map' && (
          <SmartMap 
            cityState={cityState} 
            setCityState={setCityState} 
            citizenReports={citizenReports}
          />
        )}
        {activeTab === 'operations' && (
          <OperationsCenter 
            cityState={cityState} 
            setCityState={setCityState} 
            citizenReports={citizenReports}
            onSyncReports={setCitizenReports}
          />
        )}
        {activeTab === 'workflows' && (
          <Workflows 
            cityState={cityState} 
            setCityState={setCityState} 
          />
        )}
        {activeTab === 'advisory' && (
          <CitizenAdvisory cityState={cityState} />
        )}
        {activeTab === 'weather' && (
          <WeatherIntelligence cityState={cityState} />
        )}
        {activeTab === 'citizens' && (
          <CitizenPortal 
            citizenReports={citizenReports} 
            onAddReport={handleAddReport} 
            zones={cityState.zones}
          />
        )}
      </main>

      {/* Decision AI Companion Chat Drawer */}
      <DecisionAI cityState={cityState} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Droplets, AlertTriangle, Play, Settings, ShieldCheck } from 'lucide-react';

export default function WeatherIntelligence({ cityState }) {
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualPumpOverride, setManualPumpOverride] = useState(false);

  const zones = cityState.zones;

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${window.API_URL}/api/weather/forecast/${selectedZoneIdx}`);
        const data = await res.json();
        if (data.success) {
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Failed to fetch weather forecast:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [selectedZoneIdx, cityState.zones]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', position: 'relative' }}>
      
      {/* Dynamic Rain CSS Animation injection */}
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        .rain-drop {
          position: absolute;
          width: 1.5px;
          height: 12px;
          background: linear-gradient(transparent, hsl(var(--color-teal)));
          animation: rain-fall 1.2s linear infinite;
        }
        .weather-card-glow {
          box-shadow: 0 8px 32px rgba(20, 180, 160, 0.05), inset 0 0 12px rgba(255,255,255,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .weather-card-glow:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 40px rgba(20, 180, 160, 0.15), inset 0 0 15px rgba(255,255,255,0.05);
          border-color: rgba(20, 180, 160, 0.3) !important;
        }
      `}</style>

      {/* Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Monsoon Resilience Center
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', margin: '0.25rem 0 0 0' }}>
            Predicting precipitation curves and optimizing municipal drainage pump gates using 30-day climate history.
          </p>
        </div>

        {/* Zone Selector */}
        <select
          value={selectedZoneIdx}
          onChange={(e) => setSelectedZoneIdx(parseInt(e.target.value))}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '0.35rem 1.5rem 0.35rem 0.5rem',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '600',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            background: 'rgba(255, 255, 255, 0.04) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a0aec0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 0.5rem center',
            backgroundSize: '1rem'
          }}
        >
          {zones.map((z, idx) => (
            <option key={idx} value={idx} style={{ background: '#0c0f16' }}>
              {z.name.split(':')[0]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'hsl(var(--color-teal))', borderRadius: '50%', animation: 'pulse-glow 1s infinite linear', marginRight: '8px' }} />
          <span>Solving climate regression models...</span>
        </div>
      ) : weatherData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
          
          {/* Left Column: Live Weather & Drainage Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Live Weather Card with animated rain drops */}
            <div className="glass-panel weather-card-glow" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', height: '220px' }}>
              {/* Rain Drops */}
              <div className="rain-drop" style={{ left: '10%', animationDelay: '0.2s', animationDuration: '1.3s' }} />
              <div className="rain-drop" style={{ left: '25%', animationDelay: '0.8s', animationDuration: '0.9s' }} />
              <div className="rain-drop" style={{ left: '45%', animationDelay: '0.1s', animationDuration: '1.1s' }} />
              <div className="rain-drop" style={{ left: '60%', animationDelay: '0.5s', animationDuration: '1.4s' }} />
              <div className="rain-drop" style={{ left: '78%', animationDelay: '0.3s', animationDuration: '0.8s' }} />
              <div className="rain-drop" style={{ left: '90%', animationDelay: '0.7s', animationDuration: '1.2s' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'hsl(var(--color-teal))', fontWeight: 'bold', uppercase: 'true' }}>LIVE WEATHER NODE</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0.15rem 0 0 0' }}>Monsoon Wet Season</h3>
                </div>
                <CloudRain size={24} style={{ color: 'hsl(var(--color-teal))', filter: 'drop-shadow(0 0 8px hsl(var(--color-teal)))' }} />
              </div>

              {/* Live metrics */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Thermometer size={20} style={{ color: 'hsl(var(--color-amber))' }} />
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'hsl(var(--text-muted))' }}>Temp</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>26°C</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplets size={20} style={{ color: 'hsl(var(--color-primary))' }} />
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'hsl(var(--text-muted))' }}>Humidity</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>86%</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CloudRain size={20} style={{ color: 'hsl(var(--color-teal))' }} />
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'hsl(var(--text-muted))' }}>7d Total</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'hsl(var(--color-teal))' }}>{weatherData.totalPredictedRain} mm</div>
                  </div>
                </div>
              </div>

              {/* Forecast Rationale alert */}
              <div style={{
                marginTop: '1.25rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: 'hsl(var(--text-secondary))',
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertTriangle size={14} style={{ color: weatherData.dangerLevel === 'High' ? 'hsl(var(--color-rose))' : 'hsl(var(--color-amber))' }} />
                <span>Flood Risk: <strong style={{ color: weatherData.dangerLevel === 'High' ? 'hsl(var(--color-rose))' : 'hsl(var(--color-amber))' }}>{weatherData.dangerLevel}</strong></span>
              </div>
            </div>

            {/* Storm Drainage Sluice Gates control panel */}
            <div className="glass-panel weather-card-glow" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Settings size={16} style={{ color: 'hsl(var(--color-teal))' }} /> Drainage Control Override
              </h4>

              {/* Graphic container */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>Sluice Gate Status</div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                    {weatherData.totalPredictedRain > 100 || manualPumpOverride ? "⚠️ GATES 100% OPENED (FLOOD BYPASS)" : "Normal Drainage flow"}
                  </div>
                </div>
                <div style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '10px',
                  background: weatherData.totalPredictedRain > 100 || manualPumpOverride ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: weatherData.totalPredictedRain > 100 || manualPumpOverride ? '#ef4444' : '#10b981',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  border: '1px solid currentColor'
                }}>
                  {weatherData.totalPredictedRain > 100 || manualPumpOverride ? "OPEN" : "CLOSED"}
                </div>
              </div>

              {/* Manual toggle override */}
              <button
                type="button"
                onClick={() => setManualPumpOverride(prev => !prev)}
                style={{
                  width: '100%',
                  background: manualPumpOverride ? 'linear-gradient(135deg, hsl(var(--color-rose)), #be123c)' : 'rgba(255,255,255,0.04)',
                  border: manualPumpOverride ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '0.55rem',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  boxShadow: manualPumpOverride ? '0 0 12px rgba(239,68,68,0.2)' : 'none'
                }}
              >
                <Play size={12} fill="#fff" />
                <span>{manualPumpOverride ? "Force Shutdown Override (Active)" : "Manual Force Sluice Gates Open"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Weather Charts & AI Advisory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Rationale recommendation block */}
            <div className="glass-panel weather-card-glow" style={{ padding: '1rem 1.25rem', border: '1px solid rgba(99, 102, 241, 0.15)', background: 'rgba(99, 102, 241, 0.03)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} style={{ color: 'hsl(var(--color-primary))', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#fff' }}>AI Meteorological Advisory</div>
                <div style={{ fontSize: '0.74rem', color: 'hsl(var(--text-secondary))', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {weatherData.recommendation}
                </div>
              </div>
            </div>

            {/* Precipitation Chart */}
            <div className="glass-panel weather-card-glow" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', margin: '0 0 1rem 0' }}>
                Precipitation Analysis (30-Day History vs 7-Day Prediction)
              </h4>

              <div style={{ position: 'relative', height: '170px' }}>
                <svg width="100%" height="170" viewBox="0 0 450 170" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="420" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                  <line x1="40" y1="90" x2="420" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                  <line x1="40" y1="140" x2="420" y2="140" stroke="rgba(255,255,255,0.08)" />

                  {/* Warning line at 35mm */}
                  <line x1="40" y1="80" x2="420" y2="80" stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="2,2" strokeWidth="1.25" />
                  <text x="425" y="83" fill="rgba(239, 68, 68, 0.7)" fontSize="8" textAnchor="start">Warning: 35mm</text>

                  {/* Y-axis Labels */}
                  <text x="32" y="44" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">60mm</text>
                  <text x="32" y="94" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">30mm</text>
                  <text x="32" y="144" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">0mm</text>

                  {/* Build Area Path for 30 days history */}
                  {(() => {
                    const points = weatherData.history;
                    // Map days 1-30 over 300 pixels (width index: 40 to 340)
                    const getX = (d) => 40 + (d - 1) * 10;
                    const getY = (val) => 140 - (val / 65) * 100;
                    
                    const pathD = `M ${getX(1)},140 L ${points.map(p => `${getX(p.day)},${getY(p.rainfall)}`).join(' L ')} L ${getX(30)},140 Z`;
                    
                    // Forecast Path (from day 30 to 37)
                    const fcPoints = [{ day: 30, rainfall: points[points.length-1].rainfall }, ...weatherData.forecast];
                    const fcGetX = (d) => 340 + (d - 30) * 11;
                    const fcPathD = `M ${fcPoints.map(p => `${fcGetX(p.day)},${getY(p.rainfall)}`).join(' L ')}`;

                    return (
                      <g>
                        {/* History area fill */}
                        <path d={pathD} fill="rgba(20, 180, 160, 0.08)" stroke="hsl(var(--color-teal))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Forecast line (glowing dash) */}
                        <path d={fcPathD} fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2.5" strokeDasharray="3,3" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 3px hsl(var(--color-primary)))" />

                        {/* Key timeline split indicator */}
                        <line x1="340" y1="30" x2="340" y2="140" stroke="rgba(255,255,255,0.12)" strokeDasharray="2" />
                        <text x="340" y="24" fill="hsl(var(--text-muted))" fontSize="8" textAnchor="middle">Today</text>

                        {/* History X-labels */}
                        <text x="40" y="154" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="middle">Day 1</text>
                        <text x="190" y="154" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="middle">Day 15</text>
                        <text x="340" y="154" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="middle">Day 30</text>

                        {/* Forecast X-labels */}
                        <text x="417" y="154" fill="hsl(var(--color-primary))" fontSize="9" textAnchor="middle" fontWeight="bold">Day 37*</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Legend details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'hsl(var(--text-muted))', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'hsl(var(--color-teal))', borderRadius: '2px' }} />
                    <span>30-Day Historical Data</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '8px', height: '2px', borderTop: '2px dashed hsl(var(--color-primary))' }} />
                    <span>7-Day Future Forecast</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  Regression Slope: <strong style={{ color: '#fff' }}>{weatherData.regression.slope.toFixed(2)}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '3rem' }}>
          No climate logs available.
        </div>
      )}
    </div>
  );
}

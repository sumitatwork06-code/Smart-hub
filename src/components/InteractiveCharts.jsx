import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Sparkles, Brain } from 'lucide-react';

export default function InteractiveCharts({ cityState, timeHour }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [showForecast, setShowForecast] = useState(false);

  // Telemetry linear regression forecasting states
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('healthWait'); // 'healthWait' or 'aqi'
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  const zones = cityState.zones;

  useEffect(() => {
    const fetchForecast = async () => {
      setForecastLoading(true);
      try {
        const res = await fetch(`http://${window.location.hostname}:3001/api/forecast/${selectedZoneIdx}`);
        const data = await res.json();
        if (data.success) {
          setForecastData(data);
        }
      } catch (err) {
        console.error("Failed to fetch telemetry forecast:", err);
      } finally {
        setForecastLoading(false);
      }
    };
    fetchForecast();
  }, [selectedZoneIdx, cityState.zones]);

  // Chart 1 Data: Daily Load Curve (Solar vs Grid Load)
  // X-coords for time slots: 08:00 (50), 12:00 (150), 18:00 (250), 23:00 (350)
  const times = [
    { label: '08:00', solar: 150, load: 300, x: 50 },
    { label: '12:00', solar: 650, load: 240, x: 150 },
    { label: '18:00', solar: 100, load: 450, x: 250 },
    { label: '23:00', solar: 0, load: 180, x: 350 },
  ];

  const scaleY = (val) => 160 - (val / 700) * 120; // Scale 0-700 to height 160-40

  // SVG lines path generator
  const solarPath = `M ${times.map(t => `${t.x},${scaleY(t.solar)}`).join(' L ')}`;
  const loadPath = `M ${times.map(t => `${t.x},${scaleY(t.load)}`).join(' L ')}`;

  // Predictive curve generator (forecast paths)
  const isGridOptimized = cityState.workflows.some(w => w.id === 'grid' && w.active);
  const solarForecastPath = `M ${times.map(t => `${t.x},${scaleY(t.solar * 1.05 + 10)}`).join(' L ')}`;
  const loadForecastPath = `M ${times.map(t => `${t.x},${scaleY(t.load * (isGridOptimized ? 0.76 : 1.04))}`).join(' L ')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Forecast Controls Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Simulation Analytics</h3>
        <button
          onClick={() => setShowForecast(!showForecast)}
          style={{
            background: showForecast ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: showForecast ? '1px solid hsl(var(--color-primary))' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: showForecast ? 'hsl(var(--color-primary))' : '#fff',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
            boxShadow: showForecast ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none',
            outline: 'none',
          }}
        >
          <Sparkles size={12} fill={showForecast ? 'hsl(var(--color-primary))' : 'none'} />
          {showForecast ? 'Predictive Forecast Active' : 'Enable AI Forecast'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Chart 1: Solar & Load Curve */}
        <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-secondary))' }}>
            <TrendingUp size={16} style={{ color: 'hsl(var(--color-amber))' }} /> Solar Generation vs. Grid Load (Daily Curve)
          </h4>

        <div style={{ position: 'relative', height: '180px' }}>
          <svg width="100%" height="180" viewBox="0 0 400 180" style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1="40" y1="40" x2="370" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
            <line x1="40" y1="100" x2="370" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
            <line x1="40" y1="160" x2="370" y2="160" stroke="rgba(255,255,255,0.08)" />

            {/* X-axis Labels */}
            {times.map((t, idx) => (
              <text key={idx} x={t.x} y="175" fill="hsl(var(--text-muted))" fontSize="10" textAnchor="middle" fontFamily="monospace">
                {t.label}
              </text>
            ))}

            {/* Y-axis Labels */}
            <text x="30" y="44" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">600k</text>
            <text x="30" y="104" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">300k</text>
            <text x="30" y="164" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">0k</text>

            {/* Solar Line */}
            <path d={solarPath} fill="none" stroke="hsl(var(--color-amber))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {showForecast && (
              <path d={solarForecastPath} fill="none" stroke="hsl(var(--color-amber))" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
            )}

            {/* Grid Load Line */}
            <path d={loadPath} fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {showForecast && (
              <path d={loadForecastPath} fill="none" stroke="hsl(var(--color-primary))" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
            )}

            {/* Interactive Data Nodes */}
            {times.map((t, idx) => {
              const activeHour = timeHour === parseInt(t.label.split(':')[0]);
              return (
                <g key={idx}>
                  {/* Solar Node */}
                  <circle
                    cx={t.x}
                    cy={scaleY(t.solar)}
                    r={activeHour ? 6 : 4}
                    fill="hsl(var(--color-amber))"
                    stroke="#0a0d14"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint({ ...t, type: 'solar', val: t.solar, cy: scaleY(t.solar) })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Load Node */}
                  <circle
                    cx={t.x}
                    cy={scaleY(t.load)}
                    r={activeHour ? 6 : 4}
                    fill="hsl(var(--color-primary))"
                    stroke="#0a0d14"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint({ ...t, type: 'load', val: t.load, cy: scaleY(t.load) })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* Selected Time Highlight Vertical Line */}
            {times.map((t, idx) => {
              const activeHour = timeHour === parseInt(t.label.split(':')[0]);
              if (activeHour) {
                return (
                  <line key={`v-${idx}`} x1={t.x} y1="35" x2={t.x} y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2" />
                );
              }
              return null;
            })}
          </svg>

          {/* Sparkly Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / 400) * 100}%`,
                top: `${hoveredPoint.cy - 40}px`,
                transform: 'translateX(-50%)',
                background: '#0c0f16',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                pointerEvents: 'none',
                fontSize: '0.75rem',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                color: '#fff',
              }}
            >
              <div style={{ fontWeight: '600', color: hoveredPoint.type === 'solar' ? 'hsl(var(--color-amber))' : 'hsl(var(--color-primary))' }}>
                {hoveredPoint.type === 'solar' ? 'Solar Output' : 'Grid Demand'}
              </div>
              <div>{hoveredPoint.val} kWh ({hoveredPoint.label})</div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-amber))' }} />
            <span>Solar Supply</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-primary))' }} />
            <span>Grid Demand</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Zone Congestion Comparison */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-secondary))' }}>
          <BarChart2 size={16} style={{ color: 'hsl(var(--color-teal))' }} /> Live Traffic Congestion load by District
        </h4>

        <div style={{ position: 'relative', height: '180px' }}>
          <svg width="100%" height="180" viewBox="0 0 400 180" style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1="40" y1="40" x2="370" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
            <line x1="40" y1="100" x2="370" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
            <line x1="40" y1="160" x2="370" y2="160" stroke="rgba(255,255,255,0.08)" />

            {/* Bars */}
            {zones.map((zone, idx) => {
              const x = 70 + idx * 80;
              const barHeight = (zone.traffic / 100) * 110;
              const y = 160 - barHeight;
              
              const isHovered = hoveredBar === idx;
              const color = zone.traffic > 70 ? 'hsl(var(--color-rose))' : zone.traffic > 45 ? 'hsl(var(--color-amber))' : 'hsl(var(--color-teal))';

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glowing Outline on Hover */}
                  {isHovered && (
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width="38"
                      height={barHeight + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      strokeOpacity="0.3"
                      rx="6"
                    />
                  )}

                  {/* Filled Bar */}
                  <rect
                    x={x}
                    y={y}
                    width="30"
                    height={barHeight}
                    fill={color}
                    fillOpacity={isHovered ? 0.9 : 0.7}
                    rx="4"
                    style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />

                  {/* Forecast Outline Rect */}
                  {showForecast && (() => {
                    const isTrafficBypassed = cityState.workflows.some(w => w.id === 'traffic' && w.active);
                    const forecastTraffic = isTrafficBypassed ? Math.max(10, zone.traffic - 15) : Math.min(100, zone.traffic + 12);
                    const forecastHeight = (forecastTraffic / 100) * 110;
                    const forecastY = 160 - forecastHeight;
                    return (
                      <rect
                        x={x + 4}
                        y={forecastY}
                        width="22"
                        height={forecastHeight}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="1.25"
                        strokeDasharray="2,2"
                        rx="3"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })()}

                  {/* Label */}
                  <text x={x + 15} y="174" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="middle">
                    Zone {String.fromCharCode(65 + idx)}
                  </text>
                </g>
              );
            })}

            {/* Y Labels */}
            <text x="30" y="44" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">100%</text>
            <text x="30" y="104" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">50%</text>
            <text x="30" y="164" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">0%</text>
          </svg>

          {/* Bar Tooltip */}
          {hoveredBar !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${((70 + hoveredBar * 80 + 15) / 400) * 100}%`,
                top: `${160 - (zones[hoveredBar].traffic / 100) * 110 - 42}px`,
                transform: 'translateX(-50%)',
                background: '#0c0f16',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                pointerEvents: 'none',
                fontSize: '0.75rem',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: '600' }}>{zones[hoveredBar].name.split(':')[0]}</div>
              <div>Load: <strong style={{ color: zones[hoveredBar].traffic > 70 ? 'hsl(var(--color-rose))' : 'hsl(var(--color-teal))' }}>{zones[hoveredBar].traffic}%</strong></div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textAlign: 'center', marginTop: '0.5rem' }}>
          *Hover bars to view live district traffic capacity indexes.
        </div>
      </div>
    </div>

    {/* Chart 3: AI Telemetry Forecasting Card */}
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', margin: 0 }}>
          <Brain size={18} style={{ color: 'hsl(var(--color-primary))' }} /> AI Telemetry Forecasting (Linear Regression Model)
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Zone Selector */}
          <select
            value={selectedZoneIdx}
            onChange={(e) => setSelectedZoneIdx(parseInt(e.target.value))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '0.3rem 1.5rem 0.3rem 0.5rem',
              color: '#fff',
              fontSize: '0.72rem',
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

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '0.3rem 1.5rem 0.3rem 0.5rem',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              background: 'rgba(255, 255, 255, 0.04) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a0aec0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 0.5rem center',
              backgroundSize: '1rem'
            }}
          >
            <option value="healthWait" style={{ background: '#0c0f16' }}>Clinic Queue Wait Time</option>
            <option value="aqi" style={{ background: '#0c0f16' }}>Air Quality Index (AQI)</option>
          </select>
        </div>
      </div>

      {forecastLoading ? (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.78rem', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'hsl(var(--color-primary))', borderRadius: '50%', animation: 'pulse-glow 1s infinite linear' }} />
          <span>Computing regression matrices...</span>
        </div>
      ) : forecastData ? (() => {
        const hist = forecastData.history;
        const fc = forecastData.forecast;
        
        const maxVal = selectedMetric === 'aqi' ? 220 : 70;
        const labelSuffix = selectedMetric === 'aqi' ? ' AQI' : ' mins';

        const getX = (hr) => 50 + (hr - 7) * 36;
        const getY = (val) => 140 - (val / maxVal) * 100;

        // Build path for History
        const historyPath = `M ${hist.map(p => `${getX(p.hour)},${getY(p[selectedMetric])}`).join(' L ')}`;
        
        // Build path for Forecast (starting from last history point)
        const lastHist = hist[hist.length - 1];
        const forecastPoints = [lastHist, ...fc];
        const forecastPath = `M ${forecastPoints.map(p => `${getX(p.hour)},${getY(p[selectedMetric])}`).join(' L ')}`;

        return (
          <div style={{ position: 'relative', height: '180px' }}>
            <svg width="100%" height="180" viewBox="0 0 400 180" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="50" y1="40" x2="350" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
              <line x1="50" y1="90" x2="350" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
              <line x1="50" y1="140" x2="350" y2="140" stroke="rgba(255,255,255,0.08)" />

              {/* X-axis Labels */}
              {hist.map((p, idx) => (
                <text key={`h-lbl-${idx}`} x={getX(p.hour)} y="155" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {String(p.hour).padStart(2, '0')}:00
                </text>
              ))}
              {fc.map((p, idx) => (
                <text key={`f-lbl-${idx}`} x={getX(p.hour)} y="155" fill="hsl(var(--color-primary))" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                  {String(p.hour).padStart(2, '0')}:00*
                </text>
              ))}

              {/* Y-axis Labels */}
              <text x="40" y="44" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">{maxVal}</text>
              <text x="40" y="94" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">{Math.round(maxVal/2)}</text>
              <text x="40" y="144" fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end">0</text>

              {/* History Line (Solid Teal) */}
              <path d={historyPath} fill="none" stroke="hsl(var(--color-teal))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Forecast Line (Dashed Primary, Glowing) */}
              <path d={forecastPath} fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 4px hsl(var(--color-primary)))" />

              {/* History Nodes */}
              {hist.map((p, idx) => (
                <circle
                  key={`hn-${idx}`}
                  cx={getX(p.hour)}
                  cy={getY(p[selectedMetric])}
                  r="4"
                  fill="hsl(var(--color-teal))"
                  stroke="#0a0d14"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: getX(p.hour), cy: getY(p[selectedMetric]), val: `${p[selectedMetric]}${labelSuffix}`, label: `Hour ${p.hour}:00 (Actual)` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Forecast Nodes */}
              {fc.map((p, idx) => (
                <circle
                  key={`fn-${idx}`}
                  cx={getX(p.hour)}
                  cy={getY(p[selectedMetric])}
                  r="4.5"
                  fill="#0a0d14"
                  stroke="hsl(var(--color-primary))"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: getX(p.hour), cy: getY(p[selectedMetric]), val: `${p[selectedMetric]}${labelSuffix}`, label: `Hour ${p.hour}:00 (AI Forecast)` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(hoveredPoint.x / 400) * 100}%`,
                  top: `${hoveredPoint.cy - 45}px`,
                  transform: 'translateX(-50%)',
                  background: '#0c0f16',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  pointerEvents: 'none',
                  fontSize: '0.75rem',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  color: '#fff',
                }}
              >
                <div style={{ fontWeight: '600', color: hoveredPoint.label.includes('AI') ? 'hsl(var(--color-primary))' : 'hsl(var(--color-teal))' }}>
                  {hoveredPoint.label}
                </div>
                <div>Value: <strong>{hoveredPoint.val}</strong></div>
              </div>
            )}

            {/* Legend & Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-teal))' }} />
                  <span>Historical Log</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', border: '1.5px solid hsl(var(--color-primary))', borderRadius: '50%', background: 'none' }} />
                  <span>AI Prediction (Linear Fit)</span>
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                Model Slope: <strong style={{ color: '#fff' }}>{forecastData.regression[selectedMetric === 'aqi' ? 'aqi' : 'health'].slope.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        );
      })() : (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'hsl(var(--text-muted))' }}>
          No forecast data available.
        </div>
      )}
    </div>
  </div>
);
}

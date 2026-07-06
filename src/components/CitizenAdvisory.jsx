import React, { useState } from 'react';
import { Compass, Navigation, ShieldCheck, Clock, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function CitizenAdvisory({ cityState }) {
  const [originIdx, setOriginIdx] = useState(0);
  const [destinationType, setDestinationType] = useState('medical');
  const [advisoryResult, setAdvisoryResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const zones = cityState.zones;

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${window.API_URL}/api/advisory/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originIdx, destinationType }),
      });
      const data = await res.json();
      if (data.success) {
        setAdvisoryResult(data);
      }
    } catch (err) {
      console.error("Failed to calculate optimal citizen advisory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Coordinates for the interactive zone map nodes
  const mapCoordinates = [
    { x: 100, y: 50, label: "Alkapuri (A)" },
    { x: 300, y: 50, label: "Fatehgunj (B)" },
    { x: 100, y: 150, label: "Gotri (C)" },
    { x: 300, y: 150, label: "Makarpura (D)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Citizen Decision Advisory Node
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', margin: '0.25rem 0 0 0' }}>
            Empowering citizens with real-time transit optimization, emergency warnings, and clinic wait-time recommendations.
          </p>
        </div>
        <div className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Live Advisory Active
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Left Control Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Compass size={18} style={{ color: 'hsl(var(--color-teal))' }} /> Route & Service Planner
          </h4>

          {/* Starting Zone Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>Your Current Location (Origin)</label>
            <select
              value={originIdx}
              onChange={(e) => setOriginIdx(parseInt(e.target.value))}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '0.5rem',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {zones.map((z, idx) => (
                <option key={idx} value={idx} style={{ background: '#0c0f16' }}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Destination Type Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>Desired Destination Type</label>
            <select
              value={destinationType}
              onChange={(e) => setDestinationType(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '0.5rem',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="medical" style={{ background: '#0c0f16' }}>Medical Center (Hospital / Clinic)</option>
              <option value="commercial" style={{ background: '#0c0f16' }}>Shopping / Commercial Core</option>
              <option value="academic" style={{ background: '#0c0f16' }}>Academic Hub (Schools / Colleges)</option>
              <option value="industrial" style={{ background: '#0c0f16' }}>Industrial / Office Sector</option>
            </select>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleOptimize}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'pulse-glow 1s infinite linear' }} />
            ) : (
              <Navigation size={16} />
            )}
            <span>Calculate Best Route & Option</span>
          </button>
        </div>

        {/* Right Output Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '300px', justifyContent: advisoryResult ? 'flex-start' : 'center' }}>
          {advisoryResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Header result row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'hsl(var(--color-teal))', fontWeight: 'bold', uppercase: 'true', letterSpacing: '0.05em' }}>OPTIMIZED SERVICE DESTINATION</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0.1rem 0 0 0', color: '#fff' }}>
                    {advisoryResult.bestZoneName.split(':')[0]}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                    <Clock size={12} style={{ color: 'hsl(var(--color-amber))' }} /> {advisoryResult.travelTimeMinutes} mins travel
                  </div>
                  <div style={{ 
                    padding: '0.35rem 0.6rem', 
                    borderRadius: '6px', 
                    background: advisoryResult.trafficLevel === 'Heavy Congestion' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                    color: advisoryResult.trafficLevel === 'Heavy Congestion' ? '#ef4444' : '#10b981', 
                    border: '1px solid currentColor', 
                    fontSize: '0.72rem',
                    fontWeight: '600'
                  }}>
                    {advisoryResult.trafficLevel}
                  </div>
                </div>
              </div>

              {/* Advice Box */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.04)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}>
                <ShieldCheck size={18} style={{ color: 'hsl(var(--color-primary))', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#fff' }}>AI Transit Recommendation</div>
                  <div style={{ fontSize: '0.74rem', color: 'hsl(var(--text-muted))', marginTop: '0.15rem', lineHeight: '1.4' }}>
                    {advisoryResult.advice}
                  </div>
                </div>
              </div>

              {/* Service metrics logs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>Clinic Queue Wait</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'hsl(var(--color-teal))', marginTop: '2px' }}>{advisoryResult.metrics.waitTime}m</div>
                </div>
                <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>Traffic Congestion</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'hsl(var(--color-primary))', marginTop: '2px' }}>{advisoryResult.metrics.congestion}%</div>
                </div>
                <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>Environmental AQI</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'hsl(var(--color-amber))', marginTop: '2px' }}>{advisoryResult.metrics.aqi}</div>
                </div>
              </div>

              {/* Interactive Route SVG Map */}
              <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Sparkles size={12} style={{ color: 'hsl(var(--color-teal))' }} /> AI Simulated Transit Route Matrix
                </div>
                <svg width="100%" height="200" viewBox="0 0 400 200" style={{ overflow: 'visible' }}>
                  {/* Connective Paths */}
                  <line x1="100" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <line x1="100" y1="50" x2="100" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <line x1="300" y1="50" x2="300" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <line x1="100" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />

                  {/* Draw optimized path with glowing animated dashes */}
                  {(() => {
                    const startCoord = mapCoordinates[originIdx];
                    const destCoord = mapCoordinates[advisoryResult.bestZoneIdx];
                    return (
                      <line 
                        x1={startCoord.x} 
                        y1={startCoord.y} 
                        x2={destCoord.x} 
                        y2={destCoord.y} 
                        stroke="hsl(var(--color-teal))" 
                        strokeWidth="4" 
                        strokeDasharray="5,5"
                        filter="drop-shadow(0 0 4px hsl(var(--color-teal)))"
                      >
                        <animate attributeName="stroke-dashoffset" values="50;0" dur="2s" repeatCount="indefinite" />
                      </line>
                    );
                  })()}

                  {/* Map Nodes */}
                  {mapCoordinates.map((node, idx) => {
                    const isOrigin = idx === originIdx;
                    const isDest = idx === advisoryResult.bestZoneIdx;
                    return (
                      <g key={idx}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isOrigin || isDest ? 10 : 7}
                          fill={isOrigin ? 'hsl(var(--color-primary))' : isDest ? 'hsl(var(--color-teal))' : 'rgba(255,255,255,0.1)'}
                          stroke="#0a0d14"
                          strokeWidth="2"
                        />
                        <text
                          x={node.x}
                          y={node.y - 14}
                          fill="#fff"
                          fontSize="9"
                          fontWeight={isOrigin || isDest ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          {node.label} {isOrigin ? '(Start)' : isDest ? '(Optimal)' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <Navigation size={48} style={{ opacity: 0.15 }} />
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.85rem' }}>Travel Advisory Standby</div>
                <div style={{ fontSize: '0.74rem', marginTop: '0.2rem', maxWidth: '280px' }}>
                  Select your location and travel needs, then click "Calculate Best Route" to run the optimized routing matrix.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

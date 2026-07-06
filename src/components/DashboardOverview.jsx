import React from 'react';
import { Wind, Car, Zap, Trash2, ArrowUpRight, ArrowDownRight, ShieldAlert, Sparkles, Heart, Shield } from 'lucide-react';
import healthcareVisual from '../assets/healthcare_visual.png';
import publicSafetyVisual from '../assets/public_safety_visual.png';
import alkapuriVisual from '../assets/vadodara_alkapuri.png';
import fatehgunjVisual from '../assets/vadodara_fatehgunj.png';
import gotriVisual from '../assets/vadodara_gotri.png';
import manjalpurVisual from '../assets/vadodara_manjalpur.png';

export default function DashboardOverview({ cityState, setCityState, setActiveTab }) {
  const zoneVisuals = [alkapuriVisual, fatehgunjVisual, gotriVisual, manjalpurVisual];
  // Aggregate calculations
  const avgAqi = Math.round(cityState.zones.reduce((sum, z) => sum + z.aqi, 0) / cityState.zones.length);
  const avgTraffic = Math.round(cityState.zones.reduce((sum, z) => sum + z.traffic, 0) / cityState.zones.length);
  const totalCleanEnergy = Math.round(cityState.zones.reduce((sum, z) => sum + z.energy, 0));
  const avgWaste = Math.round(cityState.zones.reduce((sum, z) => sum + z.waste, 0) / cityState.zones.length);
  const avgHealthWait = Math.round(cityState.zones.reduce((sum, z) => sum + (z.healthWait || 0), 0) / cityState.zones.length);
  const totalSafetyUnits = Math.round(cityState.zones.reduce((sum, z) => sum + (z.safetyUnits || 0), 0));

  const kpis = [
    {
      title: 'Air Quality (Avg)',
      value: `${avgAqi} AQI`,
      icon: Wind,
      color: avgAqi > 100 ? 'var(--color-rose)' : avgAqi > 75 ? 'var(--color-amber)' : 'var(--color-teal)',
      change: '-4.2% since yesterday',
      isPositive: true,
      sparkline: [42, 45, 52, 48, 49, 44, 48],
    },
    {
      title: 'Traffic Congestion',
      value: `${avgTraffic}%`,
      icon: Car,
      color: avgTraffic > 50 ? 'var(--color-rose)' : avgTraffic > 30 ? 'var(--color-amber)' : 'var(--color-teal)',
      change: '+1.5% vs last hour',
      isPositive: false,
      sparkline: [18, 22, 28, 26, 25, 22, 24],
    },
    {
      title: 'Clean Solar Energy',
      value: `${totalCleanEnergy} kWh`,
      icon: Zap,
      color: 'var(--color-amber)',
      change: '+12.4% peak generation',
      isPositive: true,
      sparkline: [310, 340, 390, 420, 480, 520, 560],
    },
    {
      title: 'Solid Waste Bin Status',
      value: `${avgWaste}% Full`,
      icon: Trash2,
      color: avgWaste > 70 ? 'var(--color-rose)' : avgWaste > 50 ? 'var(--color-amber)' : 'var(--color-teal)',
      change: '-0.8% collection route',
      isPositive: true,
      sparkline: [68, 62, 59, 58, 55, 51, 48],
    },
    {
      title: 'Clinic Wait Time',
      value: `${avgHealthWait} Min`,
      icon: Heart,
      color: 'hsl(var(--color-primary))',
      change: '-2.1% hospital wellness',
      isPositive: true,
      sparkline: [18, 20, 22, 19, 17, 16, 18],
    },
    {
      title: 'Emergency Patrols',
      value: `${totalSafetyUnits} Units`,
      icon: Shield,
      color: 'var(--color-amber)',
      change: '+3 patrols active',
      isPositive: true,
      sparkline: [16, 18, 20, 21, 20, 22, 22],
    },
  ];

  const getAqiLabel = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'hsl(var(--color-teal))' };
    if (aqi <= 100) return { label: 'Moderate', color: 'hsl(var(--color-amber))' };
    return { label: 'Unhealthy', color: 'hsl(var(--color-rose))' };
  };

  const getTrafficLabel = (traffic) => {
    if (traffic <= 30) return { label: 'Light', color: 'hsl(var(--color-teal))' };
    if (traffic <= 60) return { label: 'Moderate', color: 'hsl(var(--color-amber))' };
    return { label: 'Heavy', color: 'hsl(var(--color-rose))' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome Panel */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(20, 24, 35, 0.7), rgba(40, 30, 60, 0.4))' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Decision Intelligence Console
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', maxWidth: '600px' }}>
            Live status of smart infrastructure. Review zone indexes, analyze optimization recommendations, or trigger automated city responder workflows.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('map')}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
            border: 'none',
            color: '#fff',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={16} /> View City Map
        </button>
      </div>

      {/* Interactive Visual Features Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Healthcare Card */}
        <div className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', padding: '0', minHeight: '180px', position: 'relative' }}>
          <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--color-primary))', marginBottom: '0.5rem' }}>
                <Heart size={16} />
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wellness & Care</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>Clinic Wait Optimization</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                Monitoring clinic congestion across all districts. Current average wait stands at <strong style={{ color: 'hsl(var(--color-primary))' }}>{avgHealthWait} minutes</strong>.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('map')}
              style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
            >
              Analyze Clinics
            </button>
          </div>
          <div style={{ width: '160px', background: `linear-gradient(to right, rgba(20,24,35,0.95), transparent), url(${healthcareVisual})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
        </div>

        {/* Public Safety Card */}
        <div className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', padding: '0', minHeight: '180px', position: 'relative' }}>
          <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-amber)', marginBottom: '0.5rem' }}>
                <Shield size={16} />
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Security & Response</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>Emergency Unit Dispatch</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                Real-time security coverage routing. <strong style={{ color: 'var(--color-amber)' }}>{totalSafetyUnits} active responders</strong> currently patrolling high-priority zones.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('map')}
              style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
            >
              Inspect Patrols
            </button>
          </div>
          <div style={{ width: '160px', background: `linear-gradient(to right, rgba(20,24,35,0.95), transparent), url(${publicSafetyVisual})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              {/* Background Glow */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: kpi.color,
                filter: 'blur(40px)',
                opacity: 0.15,
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>{kpi.title}</span>
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{kpi.value}</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: kpi.isPositive ? 'hsl(var(--color-teal))' : 'hsl(var(--color-rose))',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '600'
                }}>
                  {kpi.isPositive ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} 
                  {kpi.change.split(' ')[0]}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '1.25rem' }}>
                {kpi.change.substring(kpi.change.indexOf(' ') + 1)}
              </div>

              {/* Mini Sparkline Chart */}
              <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                {kpi.sparkline.map((val, sIdx) => {
                  const max = Math.max(...kpi.sparkline);
                  const min = Math.min(...kpi.sparkline);
                  const range = max - min || 1;
                  const heightPercent = ((val - min) / range) * 80 + 20; // min 20% height
                  return (
                    <div
                      key={sIdx}
                      style={{
                        flex: 1,
                        height: `${heightPercent}%`,
                        background: kpi.color,
                        borderRadius: '2px',
                        opacity: sIdx === kpi.sparkline.length - 1 ? 1 : 0.4,
                        transition: 'all 0.3s ease',
                      }}
                      className="tooltip"
                    >
                      <span className="tooltiptext">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Info Split: Zones Table and Live Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Zones Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Zone Metrics Analysis
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Zone Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Air Quality</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Traffic</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Waste Fill</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Solar Gen</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Clinic Wait</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Patrol Units</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {cityState.zones.map((zone, zIdx) => {
                  const aqiInfo = getAqiLabel(zone.aqi);
                  const trafficInfo = getTrafficLabel(zone.traffic);
                  return (
                    <tr
                      key={zIdx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setActiveTab('map')}
                    >
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={zoneVisuals[zIdx % zoneVisuals.length]} 
                          alt={zone.name} 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                          }}
                        />
                        <span style={{ fontSize: '0.85rem' }}>{zone.name}</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{zone.aqi} AQI</span>
                          <span style={{ fontSize: '0.7rem', color: aqiInfo.color }}>{aqiInfo.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{zone.traffic}%</span>
                          <span style={{ fontSize: '0.7rem', color: trafficInfo.color }}>{trafficInfo.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                          <div style={{ width: `${zone.waste}%`, height: '100%', backgroundColor: zone.waste > 70 ? 'hsl(var(--color-rose))' : 'hsl(var(--color-teal))' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{zone.waste}%</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'hsl(var(--color-amber))', fontWeight: '500' }}>{zone.energy} kWh</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'hsl(var(--color-primary))', fontWeight: '500' }}>{zone.healthWait || 0} min</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#fff', fontWeight: '500' }}>{zone.safetyUnits || 0} Active</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: zone.status === 'critical' ? 'rgba(240, 40, 80, 0.15)' : zone.status === 'warning' ? 'rgba(240, 150, 20, 0.15)' : 'rgba(20, 180, 160, 0.15)',
                          color: zone.status === 'critical' ? 'hsl(var(--color-rose))' : zone.status === 'warning' ? 'hsl(var(--color-amber))' : 'hsl(var(--color-teal))'
                        }}>
                          {zone.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Alerts & Incidents */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} style={{ color: 'hsl(var(--color-rose))' }} /> Live Alerts Feed
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
            {cityState.zones.some(z => z.activeIncidents.length > 0) ? (
              cityState.zones.map((zone) => 
                zone.activeIncidents.map((incident, incIdx) => (
                  <div
                    key={`${zone.name}-${incIdx}`}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: zone.status === 'critical' ? 'rgba(240, 40, 80, 0.08)' : 'rgba(240, 150, 20, 0.08)',
                      borderLeft: zone.status === 'critical' ? '3px solid hsl(var(--color-rose))' : '3px solid hsl(var(--color-amber))',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: zone.status === 'critical' ? 'hsl(var(--color-rose))' : 'hsl(var(--color-amber))' }}>
                        {zone.status === 'critical' ? 'CRITICAL INCIDENT' : 'WARNING'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Just now</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', fontWeight: '500' }}>{incident}</p>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Affecting {zone.name}</span>
                  </div>
                ))
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', gap: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                <div style={{ background: 'rgba(20, 180, 160, 0.1)', padding: '0.8rem', borderRadius: '50%', color: 'hsl(var(--color-teal))' }}>
                  <ShieldAlert size={24} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>No active alerts in the city</span>
                <span style={{ fontSize: '0.7rem', textAlign: 'center' }}>All monitoring nodes report optimal values.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

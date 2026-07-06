import React, { useState, useEffect } from 'react';
import { Shield, Battery, Play, ShieldAlert, Cpu, Check, Activity, AlertTriangle, AlertCircle } from 'lucide-react';
import alkapuriVisual from '../assets/vadodara_alkapuri.png';
import fatehgunjVisual from '../assets/vadodara_fatehgunj.png';
import gotriVisual from '../assets/vadodara_gotri.png';
import manjalpurVisual from '../assets/vadodara_manjalpur.png';

export default function OperationsCenter({ cityState, setCityState, citizenReports = [], onAddReport, onSyncReports }) {
  const [selectedCamIdx, setSelectedCamIdx] = useState(0);
  const [overrideMsg, setOverrideMsg] = useState('');
  const [dispatchingId, setDispatchingId] = useState(null);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [gridSuccessMsg, setGridSuccessMsg] = useState('');

  const [visionData, setVisionData] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  const zones = cityState.zones;
  const activeZone = zones[selectedCamIdx] || zones[0];
  const cameraFeeds = [
    { name: 'CAM_ALKAPURI_01', img: alkapuriVisual, zoneIdx: 0 },
    { name: 'CAM_FATEHGUNJ_02', img: fatehgunjVisual, zoneIdx: 1 },
    { name: 'CAM_GOTRI_03', img: gotriVisual, zoneIdx: 2 },
    { name: 'CAM_MANJALPUR_04', img: manjalpurVisual, zoneIdx: 3 }
  ];

  const currentFeed = cameraFeeds[selectedCamIdx] || cameraFeeds[0];

  // Fetch real image analysis from Gemini Multimodal Vision endpoint
  const fetchVisionAnalysis = async () => {
    setVisionLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneIdx: selectedCamIdx })
      });
      const data = await res.json();
      if (data.success) {
        setVisionData(data);
      }
    } catch (err) {
      console.error("Failed to run Gemini Vision analysis:", err);
    } finally {
      setVisionLoading(false);
    }
  };

  useEffect(() => {
    fetchVisionAnalysis();
  }, [selectedCamIdx, cityState.zones]);

  // Simulation metrics loop for CCTV overlays
  const [scanTime, setScanTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setScanTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Traffic light signal override
  const handleTrafficOverride = async () => {
    if (!activeZone) return;
    setOverrideMsg('Syncing signal cycle...');
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/telemetry/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneIdx: selectedCamIdx, metric: 'traffic', value: 20 })
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, zones: data.zones }));
        setOverrideMsg('Transit detours resolved successfully!');
        setTimeout(() => setOverrideMsg(''), 3000);
      }
    } catch (err) {
      console.error("Traffic override failed:", err);
      setOverrideMsg('Error: Signal override offline.');
    }
  };

  // Trigger dispatch animation
  const triggerDispatch = (reportId) => {
    setDispatchingId(reportId);
    setDispatchProgress(0);
  };

  // Dispatch progress timer
  useEffect(() => {
    let timer;
    if (dispatchingId !== null) {
      timer = setInterval(() => {
        setDispatchProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            resolveReportOnServer(dispatchingId);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [dispatchingId]);

  const resolveReportOnServer = async (id) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/reports/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        onSyncReports(data.citizenReports);
        setCityState(prev => ({ ...prev, zones: data.zones }));
      }
    } catch (err) {
      console.error("Failed to resolve report:", err);
    } finally {
      setDispatchingId(null);
      setDispatchProgress(0);
    }
  };

  // Engage Solar grid battery load boost
  const handleGridBoost = async () => {
    setGridSuccessMsg('Initiating load transfer...');
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/telemetry/grid-boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneIdx: 3 }) // Target Makarpura Industrial Zone
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, zones: data.zones }));
        setGridSuccessMsg('Backup array engaged. Grid overload cleared!');
        setTimeout(() => setGridSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error("Grid battery transfer failed:", err);
      setGridSuccessMsg('Failed to transfer battery load.');
    }
  };

  // Filter only active (non-resolved) citizen reports for dispatch view
  const activeReports = citizenReports.filter(r => r.status !== 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={24} style={{ color: 'hsl(var(--color-teal))' }} /> Smart City Operations Center
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
          Manage real-time municipal grid alerts, coordinate emergency dispatches, and trigger manual traffic detours.
        </p>
      </div>

      {/* Grid Layout: CCTV on left, dispatch controls on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: CCTV Live Feeds Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }} />
              Gemini Vision Analysis
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(var(--color-teal))' }}>
              LIVE VISION DETECTION // Vadodara Municipal Corp
            </span>
          </div>

          {/* CCTV Feed Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {cameraFeeds.map((feed, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCamIdx(idx)}
                style={{
                  flex: 1,
                  background: selectedCamIdx === idx ? 'rgba(20, 180, 160, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: selectedCamIdx === idx ? 'hsl(var(--color-teal))' : 'rgba(255,255,255,0.06)',
                  color: selectedCamIdx === idx ? '#fff' : 'hsl(var(--text-secondary))',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                {feed.name}
              </button>
            ))}
          </div>

          {/* Simulated CCTV Screen Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              background: '#04060a'
            }}
          >
            {/* Real City Image Background */}
            <img
              src={currentFeed.img}
              alt="CCTV stream"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.1) brightness(0.9) saturate(0.8) hue-rotate(5deg)'
              }}
            />

            {/* Vision loading overlay spinner */}
            {visionLoading && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(10, 12, 20, 0.88)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: '#fff',
                fontSize: '0.82rem',
                zIndex: 10
              }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'hsl(var(--color-teal))', borderRadius: '50%', animation: 'pulse-glow 1s infinite linear' }} />
                <span style={{ fontFamily: 'monospace', color: 'hsl(var(--color-teal))' }}>Exchanging frame with Gemini Multimodal Vision API...</span>
              </div>
            )}

            {/* Glowing Bounding Box overlays representing Gemini detections */}
            {visionData && !visionLoading && (
              <>
                {/* Alkapuri Detections */}
                {selectedCamIdx === 0 && (
                  <>
                    <div style={{ position: 'absolute', top: '42%', left: '30%', width: '10%', height: '8%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>CAR 94%</span>
                    </div>
                    <div style={{ position: 'absolute', top: '48%', left: '52%', width: '12%', height: '10%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>AUTO 91%</span>
                    </div>
                    <div style={{ position: 'absolute', top: '55%', left: '15%', width: '8%', height: '8%', border: '1.5px solid #38bdf8', boxShadow: '0 0 8px #38bdf8', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#38bdf8', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>PEDESTRIAN 86%</span>
                    </div>
                  </>
                )}

                {/* Fatehgunj Detections */}
                {selectedCamIdx === 1 && (
                  <>
                    <div style={{ position: 'absolute', top: '38%', left: '42%', width: '9%', height: '7%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>CAR 93%</span>
                    </div>
                    {visionData.anomalies.includes('blocked lane') && (
                      <div style={{ position: 'absolute', top: '45%', left: '60%', width: '13%', height: '9%', border: '1.5px solid #f43f5e', boxShadow: '0 0 8px #f43f5e', borderRadius: '4px', pointerEvents: 'none' }}>
                        <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#f43f5e', color: '#fff', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>ANOMALY: BLOCKED LANE 95%</span>
                      </div>
                    )}
                  </>
                )}

                {/* Gotri Detections */}
                {selectedCamIdx === 2 && (
                  <>
                    <div style={{ position: 'absolute', top: '48%', left: '32%', width: '11%', height: '8%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>CAR 95%</span>
                    </div>
                    {visionData.anomalies.includes('stalled vehicle') && (
                      <div style={{ position: 'absolute', top: '53%', left: '54%', width: '12%', height: '9%', border: '1.5px solid #f43f5e', boxShadow: '0 0 8px #f43f5e', borderRadius: '4px', pointerEvents: 'none' }}>
                        <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#f43f5e', color: '#fff', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>ANOMALY: STALLED CAR 92%</span>
                      </div>
                    )}
                  </>
                )}

                {/* Manjalpur Detections */}
                {selectedCamIdx === 3 && (
                  <>
                    <div style={{ position: 'absolute', top: '58%', left: '20%', width: '15%', height: '11%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>TRUCK 94%</span>
                    </div>
                    <div style={{ position: 'absolute', top: '48%', left: '48%', width: '10%', height: '8%', border: '1.5px solid #10b981', boxShadow: '0 0 8px #10b981', borderRadius: '4px', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-14px', left: '-1px', background: '#10b981', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '0 3px', borderRadius: '2px', fontFamily: 'monospace' }}>CAR 91%</span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Holographic HUD UI Overlays */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#10b981', fontFamily: 'monospace', fontSize: '0.75rem', textShadow: '0 0 5px #10b981', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>REC ● {currentFeed.name}</div>
              <div>LOC: {activeZone ? activeZone.name.split(':')[0] : 'VADODARA'}</div>
              <div>ISO 400 // f/2.8 // 60 FPS</div>
            </div>

            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#10b981', fontFamily: 'monospace', fontSize: '0.75rem', textShadow: '0 0 5px #10b981', textAlign: 'right' }}>
              <div>{scanTime.toLocaleDateString()}</div>
              <div>{scanTime.toLocaleTimeString()}</div>
              <div style={{ color: activeZone?.status === 'critical' ? '#f43f5e' : activeZone?.status === 'warning' ? '#f59e0b' : '#10b981' }}>
                STATUS: {activeZone?.status.toUpperCase()}
              </div>
            </div>

            {/* CCTV Telemetry Overlay Panel - Now displaying real Gemini Vision Detection details */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                background: 'rgba(10,12,20,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {visionData ? (
                <>
                  <div>VEHICLES: <strong style={{ color: '#14b8a6', fontSize: '0.8rem' }}>{visionData.vehicleCount}</strong></div>
                  <div>CROWD: <span style={{
                    color: visionData.crowdDensity === 'High' ? '#f43f5e' : visionData.crowdDensity === 'Medium' ? '#f59e0b' : '#10b981',
                    fontWeight: 'bold'
                  }}>{visionData.crowdDensity.toUpperCase()}</span></div>
                  <div>ANOMALIES: {visionData.anomalies.length > 0 ? (
                    <span style={{ background: 'rgba(244, 63, 94, 0.18)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.1rem 0.4rem', borderRadius: '4px', animation: 'pulse-glow 1s infinite' }}>
                      {visionData.anomalies.join(', ').toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>NONE DETECTED</span>
                  )}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>CONFIDENCE:</span>
                    <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(visionData.confidenceScore * 100)}%`, height: '100%', background: '#14b8a6' }} />
                    </div>
                    <span style={{ color: '#14b8a6', fontWeight: 'bold' }}>{(visionData.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  Awaiting Gemini Vision analysis results...
                </div>
              )}
            </div>
          </div>

          {/* Action buttons under CCTV Screen */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleTrafficOverride}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.6rem 1.25rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(99,102,241,0.2)',
                outline: 'none',
              }}
            >
              Force Green Signal Detour
            </button>
            {overrideMsg && (
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-teal))', fontWeight: '600', animation: 'pulse-glow 1s infinite' }}>
                {overrideMsg}
              </span>
            )}
          </div>
        </div>

        {/* Right Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Panel: Smart Grid Battery Override */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Battery size={18} style={{ color: 'var(--color-amber)' }} />
              solar grid load manager
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Grid State:</span>
                <span style={{
                  fontWeight: '700',
                  color: (zones[3]?.energy < 200) ? 'hsl(var(--color-rose))' : 'hsl(var(--color-teal))'
                }}>
                  {(zones[3]?.energy < 200) ? 'OVERLOADED WARNING' : 'GRID STABLE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Industrial Solar Output:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>{zones[3]?.energy || 0} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Reserve Battery:</span>
                <span style={{ fontWeight: '700', color: 'hsl(var(--color-teal))' }}>92% capacity</span>
              </div>
            </div>

            <button
              onClick={handleGridBoost}
              disabled={zones[3]?.energy >= 200}
              style={{
                width: '100%',
                background: zones[3]?.energy >= 200 ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, var(--color-amber), #d97706)',
                border: 'none',
                borderRadius: '8px',
                color: zones[3]?.energy >= 200 ? 'hsl(var(--text-muted))' : '#fff',
                padding: '0.65rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: zones[3]?.energy >= 200 ? 'default' : 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              {zones[3]?.energy >= 200 ? 'Reserve Batteries Offline (Grid Normal)' : 'Engage Solar Reserve Battery load'}
            </button>

            {gridSuccessMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--color-teal))', fontSize: '0.72rem', fontWeight: '600' }}>
                <Check size={14} /> <span>{gridSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Bottom Panel: Emergency Dispatch Control Terminal */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: 'hsl(var(--color-teal))' }} />
              active incident dispatcher
            </span>

            {/* List of active reports */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {activeReports.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={24} style={{ color: 'hsl(var(--color-teal))' }} />
                  <span>No active hazard alerts requiring dispatches. All sectors clear.</span>
                </div>
              ) : (
                activeReports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: report.category === 'traffic' ? 'var(--color-amber)' : 'hsl(var(--color-teal))' }}>
                        {report.category} Incident
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>
                        {report.timestamp}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', margin: 0, lineHeight: '1.4' }}>
                      {report.description}
                    </p>

                    <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>
                      Location: <strong style={{ color: '#fff' }}>{report.zoneName.split(':')[0]}</strong>
                    </div>

                    {/* Dispatch button / progress bar */}
                    {dispatchingId === report.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'hsl(var(--color-teal))', fontWeight: '600' }}>
                          <span>Deploying EV Unit...</span>
                          <span>{dispatchProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${dispatchProgress}%`, height: '100%', background: 'hsl(var(--color-teal))', transition: 'width 0.1s linear' }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerDispatch(report.id)}
                        disabled={dispatchingId !== null}
                        style={{
                          background: 'rgba(20, 180, 160, 0.08)',
                          border: '1px solid rgba(20, 180, 160, 0.25)',
                          borderRadius: '6px',
                          color: 'hsl(var(--color-teal))',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.4rem',
                          cursor: dispatchingId !== null ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          marginTop: '0.25rem',
                          outline: 'none',
                        }}
                      >
                        Dispatch EV Response Vehicle
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

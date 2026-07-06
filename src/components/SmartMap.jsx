import React, { useState, useEffect, useRef } from 'react';
import { Wind, Car, Zap, Trash2, ShieldAlert, Sparkles, MapPin, Settings, Heart, Shield } from 'lucide-react';

export default function SmartMap({ cityState, setCityState, citizenReports = [] }) {
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);

  const zones = cityState.zones;
  const selectedZone = zones[selectedZoneIdx];

  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polygonsRef = useRef([]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!window.L || zones.length === 0) return;

    // 1. Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      const centerLat = zones.reduce((sum, z) => sum + z.lat, 0) / zones.length;
      const centerLng = zones.reduce((sum, z) => sum + z.lng, 0) / zones.length;
      
      const map = window.L.map('leaflet-map-container', {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // 2. Clear existing markers & polygons
    markersRef.current.forEach(m => m.remove());
    polygonsRef.current.forEach(p => p.remove());
    markersRef.current = [];
    polygonsRef.current = [];

    // 3. Pan to the center of current zones when coordinates shift
    const centerLat = zones.reduce((sum, z) => sum + z.lat, 0) / zones.length;
    const centerLng = zones.reduce((sum, z) => sum + z.lng, 0) / zones.length;
    map.panTo([centerLat, centerLng]);

    // 4. Render Zones as Circles and Labels
    zones.forEach((zone, idx) => {
      const isSelected = selectedZoneIdx === idx;
      const color = zone.status === 'critical' ? '#f43f5e' : zone.status === 'warning' ? '#f59e0b' : '#14b8a6';

      // Draw zone circle radius
      const circle = window.L.circle([zone.lat, zone.lng], {
        color: isSelected ? '#ffffff' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.15,
        radius: 1200, // 1.2km radius
        weight: isSelected ? 3.5 : 1.5
      }).addTo(map);

      circle.on('click', () => {
        setSelectedZoneIdx(idx);
      });

      polygonsRef.current.push(circle);

      // Label Marker
      const labelIcon = window.L.divIcon({
        className: 'custom-leaflet-label',
        html: `
          <div style="
            background: rgba(12, 15, 25, 0.9);
            border: 1.5px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.08)'};
            color: ${isSelected ? '#ffffff' : '#94a3b8'};
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            transform: translate(-50%, -100%);
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span>${zone.name.split(':')[0]}</span>
            <span style="color: hsl(var(--color-primary))">🏥${zone.healthWait || 0}m</span>
            <span style="color: var(--color-amber)">🚨${zone.safetyUnits || 0}u</span>
            ${zone.status !== 'normal' ? '<span style="color:#f43f5e;font-weight:bold;animation:pulse-glow 1.2s infinite">⚠️</span>' : ''}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = window.L.marker([zone.lat, zone.lng], { icon: labelIcon }).addTo(map);
      markersRef.current.push(marker);

      // 5. Draw active incident dispatch markers (glowing ambulance/police icons)
      if (zone.status !== 'normal' || zone.activeIncidents.length > 0) {
        const isMedical = zone.name.includes('Medical') || zone.activeIncidents.some(i => i.toLowerCase().includes('clinic') || i.toLowerCase().includes('wait'));
        const emoji = isMedical ? '🏥' : '🚨';

        const responderIcon = window.L.divIcon({
          className: 'leaflet-pulsing-responder',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 30px;
              background: rgba(12, 15, 25, 0.85);
              border: 2px solid ${color};
              border-radius: 50%;
              box-shadow: 0 0 10px ${color};
              font-size: 14px;
              animation: pulse-glow 1.5s infinite;
              transform: translate(-50%, -50%);
            ">
              ${emoji}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        // Offset coordinates slightly so it sits next to center
        const respMarker = window.L.marker([zone.lat + 0.003, zone.lng + 0.003], { icon: responderIcon }).addTo(map);
        markersRef.current.push(respMarker);
      }
    });

    // 6. Draw connection corridors
    const corridorCoords = zones.map(z => [z.lat, z.lng]);
    if (corridorCoords.length > 1) {
      corridorCoords.push(corridorCoords[0]); // loop back
      const polyline = window.L.polyline(corridorCoords, {
        color: 'rgba(20, 180, 160, 0.25)',
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
      polygonsRef.current.push(polyline);
    }

    // 7. Draw citizen reports as warning icons
    citizenReports.forEach((report) => {
      const zone = zones[report.zoneIdx];
      if (!zone) return;

      const reportIcon = window.L.divIcon({
        className: 'leaflet-citizen-report-icon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: #f43f5e;
            color: #fff;
            border: 1.5px solid #fff;
            border-radius: 50%;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 0 8px #f43f5e;
            transform: translate(-50%, -50%);
            animation: pulse-glow 1.2s infinite;
          " title="[Citizen Report] ${report.description}">
            !
          </div>
        `,
        iconSize: [0, 0]
      });

      // Offset slightly to distinguish from zone center
      const repMarker = window.L.marker([zone.lat - 0.004, zone.lng - 0.004], { icon: reportIcon }).addTo(map);
      markersRef.current.push(repMarker);
    });

  }, [zones, selectedZoneIdx, citizenReports]);

  // Clean up Leaflet Map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Map status to colors
  const getZoneColors = (status) => {
    switch (status) {
      case 'critical':
        return {
          fill: 'rgba(240, 40, 80, 0.12)',
          stroke: 'hsl(var(--color-rose))',
          glow: 'rgba(240, 40, 80, 0.3)',
          pulseClass: 'pulse-rose',
        };
      case 'warning':
        return {
          fill: 'rgba(240, 150, 20, 0.12)',
          stroke: 'hsl(var(--color-amber))',
          glow: 'rgba(240, 150, 20, 0.3)',
          pulseClass: 'pulse-amber',
        };
      default:
        return {
          fill: 'rgba(20, 180, 160, 0.12)',
          stroke: 'hsl(var(--color-teal))',
          glow: 'rgba(20, 180, 160, 0.3)',
          pulseClass: 'pulse-teal',
        };
    }
  };

  // Handler to adjust metrics manually
  const updateMetric = async (metric, delta) => {
    const zone = selectedZone;
    let newValue = zone[metric] + delta;
    if (metric === 'aqi') newValue = Math.max(10, Math.min(300, newValue));
    if (metric === 'traffic') newValue = Math.max(0, Math.min(100, newValue));
    if (metric === 'waste') newValue = Math.max(0, Math.min(100, newValue));
    if (metric === 'energy') newValue = Math.max(0, newValue);
    if (metric === 'healthWait') newValue = Math.max(0, Math.min(120, newValue));
    if (metric === 'safetyUnits') newValue = Math.max(0, Math.min(20, newValue));

    // Optimistically update frontend UI
    const updatedZones = cityState.zones.map((z, idx) => {
      if (idx !== selectedZoneIdx) return z;
      return { ...z, [metric]: newValue };
    });
    setCityState(prev => ({ ...prev, zones: updatedZones }));

    // Sync override to backend
    try {
      const res = await fetch('http://localhost:3001/api/telemetry/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneIdx: selectedZoneIdx, metric, value: newValue })
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, zones: data.zones }));
      }
    } catch (err) {
      console.error("Failed to post telemetry override:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* CSS Overrides for Dark-themed Leaflet Map */}
      <style dangerouslySetInnerHTML={{__html: `
        #leaflet-map-container {
          height: 420px;
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0a0d14;
          overflow: hidden;
        }
        .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(185deg) brightness(95%) contrast(90%);
        }
        .custom-leaflet-label {
          pointer-events: none !important;
        }
      `}} />

      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Interactive Smart Grid Map</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
          Select a zone on the digital twin map to view sensor readouts, trigger incidents, or manually override telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Leaflet Map Display */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(10, 12, 20, 0.8)' }}>
          <div id="leaflet-map-container" />
        </div>

        {/* Selected Zone Telemetry Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
            <div style={{
              background: getZoneColors(selectedZone.status).stroke + '20',
              color: getZoneColors(selectedZone.status).stroke,
              padding: '0.6rem',
              borderRadius: '10px'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>{selectedZone.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Active Digital Twin Instance</span>
            </div>
          </div>

          {/* Telemetry Metrics Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* AQI Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Wind size={16} color="hsl(var(--color-teal))" />
                <span style={{ fontSize: '0.85rem' }}>Air Quality: <strong>{selectedZone.aqi} AQI</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('aqi', -15)} style={ctrlBtnStyle}>-15</button>
                <button onClick={() => updateMetric('aqi', 15)} style={ctrlBtnStyle}>+15</button>
              </div>
            </div>

            {/* Traffic Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Car size={16} color="hsl(var(--color-primary))" />
                <span style={{ fontSize: '0.85rem' }}>Traffic Load: <strong>{selectedZone.traffic}%</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('traffic', -10)} style={ctrlBtnStyle}>-10%</button>
                <button onClick={() => updateMetric('traffic', 10)} style={ctrlBtnStyle}>+10%</button>
              </div>
            </div>

            {/* Waste Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Trash2 size={16} color="hsl(var(--color-rose))" />
                <span style={{ fontSize: '0.85rem' }}>Waste Bin Fill: <strong>{selectedZone.waste}%</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('waste', -15)} style={ctrlBtnStyle}>-15%</button>
                <button onClick={() => updateMetric('waste', 15)} style={ctrlBtnStyle}>+15%</button>
              </div>
            </div>

            {/* Solar Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Zap size={16} color="hsl(var(--color-amber))" />
                <span style={{ fontSize: '0.85rem' }}>Solar Generation: <strong>{selectedZone.energy} kWh</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('energy', -50)} style={ctrlBtnStyle}>-50</button>
                <button onClick={() => updateMetric('energy', 50)} style={ctrlBtnStyle}>+50</button>
              </div>
            </div>

            {/* Clinic Wait Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Heart size={16} color="hsl(var(--color-primary))" />
                <span style={{ fontSize: '0.85rem' }}>Clinic Wait Time: <strong>{selectedZone.healthWait || 0} min</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('healthWait', -5)} style={ctrlBtnStyle}>-5</button>
                <button onClick={() => updateMetric('healthWait', 5)} style={ctrlBtnStyle}>+5</button>
              </div>
            </div>

            {/* Safety Patrol Units Control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Shield size={16} color="var(--color-amber)" />
                <span style={{ fontSize: '0.85rem' }}>Active Patrols: <strong>{selectedZone.safetyUnits || 0} Units</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => updateMetric('safetyUnits', -1)} style={ctrlBtnStyle}>-1</button>
                <button onClick={() => updateMetric('safetyUnits', 1)} style={ctrlBtnStyle}>+1</button>
              </div>
            </div>
          </div>

          {/* Active Incidents Panel */}
          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-secondary))' }}>
              <ShieldAlert size={14} /> Active Anomaly Log
            </h4>
            {selectedZone.activeIncidents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedZone.activeIncidents.map((inc, iIdx) => (
                  <div key={iIdx} style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', borderLeft: '3px solid hsl(var(--color-rose))' }}>
                    {inc}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                No active anomalies logged for this zone.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ctrlBtnStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'hsl(var(--text-primary))',
  padding: '0.3rem 0.6rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: '600',
  transition: 'all 0.2s',
  outline: 'none',
};

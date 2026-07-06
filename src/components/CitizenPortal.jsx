import React, { useState } from 'react';
import { Send, FileText, AlertTriangle, CloudRain, Trash, ShieldAlert } from 'lucide-react';

export default function CitizenPortal({ citizenReports, onAddReport, zones }) {
  const [category, setCategory] = useState('infrastructure');
  const [zoneIdx, setZoneIdx] = useState(0);
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport = {
      id: Date.now(),
      category,
      zoneName: zones[zoneIdx].name,
      zoneIdx,
      description: description.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending', // pending, dispatched, resolved
    };

    onAddReport(newReport);
    setDescription('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'air':
        return <CloudRain size={16} color="hsl(var(--color-teal))" />;
      case 'waste':
        return <Trash size={16} color="hsl(var(--color-rose))" />;
      case 'traffic':
        return <AlertTriangle size={16} color="hsl(var(--color-amber))" />;
      default:
        return <FileText size={16} color="hsl(var(--color-primary))" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Citizen Crowdsourcing Portal</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
          Simulate crowdsourced community telemetry. File citizen hazard reports to feed into the digital twin map and AI decision logs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Report Submission Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            Submit Incident Report
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Incident Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={selectInputStyle}
              >
                <option value="infrastructure">Infrastructure Damage (e.g. Water leak)</option>
                <option value="traffic">Traffic Hazard (e.g. Broken signal, crash)</option>
                <option value="waste">Sanitation/Waste (e.g. Overflowing dumpsters)</option>
                <option value="air">Environmental (e.g. Chemical smell, smoke)</option>
              </select>
            </div>

            {/* Zone Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Incident Location (Zone)</label>
              <select
                value={zoneIdx}
                onChange={(e) => setZoneIdx(parseInt(e.target.value))}
                style={selectInputStyle}
              >
                {zones.map((z, idx) => (
                  <option key={idx} value={idx}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Incident Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue (e.g. 'Burst hydrant causing water pooling on 4th avenue')"
                rows={3}
                style={{
                  ...selectInputStyle,
                  fontFamily: 'inherit',
                  resize: 'none',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(99,102,241,0.2)',
                marginTop: '0.5rem',
              }}
            >
              <Send size={14} /> Submit Report
            </button>

            {successMsg && (
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-teal))', textAlign: 'center', marginTop: '0.5rem', fontWeight: '500' }}>
                ✓ Report logged. Digital twin database synced.
              </div>
            )}
          </form>
        </div>

        {/* Incidents Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Live Crowdsourced Logs</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--text-secondary))', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
              {citizenReports.length} Reports
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
            {citizenReports.length > 0 ? (
              citizenReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                      {getCategoryIcon(report.category)}
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{report.category}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{report.timestamp}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', lineHeight: '1.4' }}>
                    {report.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ color: 'hsl(var(--text-muted))' }}>Location: {report.zoneName.split(':')[0]}</span>
                    <span style={{
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background: report.status === 'dispatched' ? 'rgba(240, 150, 20, 0.12)' : 'rgba(20, 180, 160, 0.12)',
                      color: report.status === 'dispatched' ? 'hsl(var(--color-amber))' : 'hsl(var(--color-teal))',
                      fontWeight: '600',
                      fontSize: '0.7rem',
                    }}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'hsl(var(--text-muted))', gap: '0.5rem' }}>
                <ShieldAlert size={24} />
                <span style={{ fontSize: '0.85rem' }}>No citizen reports filed yet.</span>
                <span style={{ fontSize: '0.7rem', textAlign: 'center' }}>Simulate a community hazard by filling the form.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const selectInputStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  padding: '0.6rem 0.8rem',
  color: '#fff',
  fontSize: '0.8rem',
  outline: 'none',
};

import React from 'react';
import { LayoutDashboard, Map, Activity, BrainCircuit, Bell, ShieldAlert, Cpu, LogOut, User as UserIcon, Compass, CloudRain } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, cityState, user, onLogout }) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'map', name: 'City Map', icon: Map },
    { id: 'operations', name: 'Operations Center', icon: BrainCircuit },
    { id: 'workflows', name: 'Workflows', icon: Activity },
    { id: 'advisory', name: 'Citizen Advisory', icon: Compass },
    { id: 'weather', name: 'Monsoon Resilience', icon: CloudRain },
    { id: 'citizens', name: 'Citizen Portal', icon: ShieldAlert },
  ];

  // Count active warnings or incidents
  const incidentCount = cityState.zones.reduce((sum, zone) => sum + zone.activeIncidents.length, 0);

  return (
    <aside className="sidebar glass-panel">
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-teal)))', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, hsl(var(--text-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartHub</h2>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision Intelligence</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '400',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '3px solid hsl(var(--color-primary))' : '3px solid transparent',
                }}
                className={!isActive ? 'glass-panel-hover' : ''}
              >
                <Icon size={18} style={{ color: isActive ? 'hsl(var(--color-primary))' : 'inherit' }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* City Health Summary Panel */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>City Health</span>
          {incidentCount > 0 ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', background: 'rgba(240, 40, 80, 0.15)', color: 'hsl(var(--color-rose))', padding: '0.2rem 0.5rem', borderRadius: '20px', fontWeight: '600' }}>
              <ShieldAlert size={12} /> {incidentCount} Alert{incidentCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ fontSize: '0.7rem', background: 'rgba(20, 180, 160, 0.15)', color: 'hsl(var(--color-teal))', padding: '0.2rem 0.5rem', borderRadius: '20px', fontWeight: '600' }}>
              All Clear
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'hsl(var(--text-secondary))' }}>Energy Efficiency</span>
            <span style={{ fontWeight: '600', color: 'hsl(var(--color-teal))' }}>84%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'hsl(var(--text-secondary))' }}>Traffic Congestion</span>
            <span style={{ fontWeight: '600', color: incidentCount > 1 ? 'hsl(var(--color-amber))' : 'hsl(var(--text-primary))' }}>24%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'hsl(var(--text-secondary))' }}>Air Quality Avg</span>
            <span style={{ fontWeight: '600', color: 'hsl(var(--color-teal))' }}>48 AQI</span>
          </div>
        </div>
      </div>

      {/* User Session Profile & Logout */}
      {user && (
        <div 
          style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '0.75rem' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</span>
              <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.role}</span>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'hsl(var(--text-muted))',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--color-rose))';
              e.currentTarget.style.background = 'rgba(240, 40, 80, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--text-muted))';
              e.currentTarget.style.background = 'none';
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}

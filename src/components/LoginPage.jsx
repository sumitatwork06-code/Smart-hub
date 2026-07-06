import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Cpu, AlertCircle } from 'lucide-react';
import smartCityLoginBg from '../assets/vadodara_palace.png';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Community Rep');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${window.API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Is the server running?');
      console.error("Login request failed:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${window.API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: role,
          password: password.trim()
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Is the server running?');
      console.error("Registration request failed:", err);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 0%, hsl(224 25% 15%) 0%, hsl(224 25% 6%) 100%)',
        fontFamily: 'var(--font-sans)',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '960px',
          minHeight: '580px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Visual Showcase Banner */}
        <div
          className="login-visual-showcase"
          style={{
            flex: 1.1,
            position: 'relative',
            background: `linear-gradient(to bottom, rgba(10,12,20,0.15), rgba(10,12,20,0.85)), url(${smartCityLoginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '3rem',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Neon Floating Lights overlay */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '150px', height: '150px', background: 'rgba(20, 180, 160, 0.2)', filter: 'blur(100px)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '180px', height: '180px', background: 'rgba(99, 102, 241, 0.25)', filter: 'blur(110px)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Cpu size={24} style={{ color: 'hsl(var(--color-teal))', filter: 'drop-shadow(0 0 8px hsl(var(--color-teal)))' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.25em', color: 'hsl(var(--color-teal))', textTransform: 'uppercase' }}>
                VADODARA DIGITAL TWIN
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1.15', marginBottom: '1.25rem', background: 'linear-gradient(to right, #ffffff, #c7d2fe, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-display)' }}>
              AI Decision Intelligence for Vadodara
            </h1>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '440px' }}>
              Leveraging real-time IoT feeds, municipal queue management, and automated emergency dispatches to build a smarter, safer Baroda.
            </p>
          </div>
        </div>

        {/* Right Side: Login/Register Form Panel */}
        <div
          style={{
            flex: 0.9,
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(12, 15, 25, 0.85)',
            position: 'relative',
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: 'hsl(var(--color-primary))',
              filter: 'blur(80px)',
              opacity: 0.12,
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '360px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)' }}>
                {isRegistering ? 'Create Account' : 'System Access'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                {isRegistering 
                  ? 'Register a new profile to access the Vadodara workspace.'
                  : 'Authenticate using credentials to initialize workspace nodes.'}
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(240, 40, 80, 0.08)',
                  border: '1px solid rgba(240, 40, 80, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: 'hsl(var(--color-rose))',
                  fontSize: '0.82rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {isRegistering ? (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      style={inputStyle}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      style={inputStyle}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Access Role
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: '1rem',
                        appearance: 'none',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a0aec0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 1rem center',
                        backgroundSize: '1.25rem'
                      }}
                      disabled={loading}
                    >
                      <option value="Community Rep" style={{ background: '#0b0d19', color: '#fff' }}>Community Rep (Citizen)</option>
                      <option value="City Planner" style={{ background: '#0b0d19', color: '#fff' }}>City Planner (Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      style={inputStyle}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'hsl(var(--text-muted))',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Registration */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
                    transition: 'all 0.2s',
                    marginTop: '0.25rem',
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Toggle Link */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'hsl(var(--color-teal))',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Email Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter email address"
                      style={inputStyle}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      style={inputStyle}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'hsl(var(--text-muted))',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
                    transition: 'transform 0.2s',
                    marginTop: '0.5rem',
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                {/* Toggle Link */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'hsl(var(--color-teal))',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    New to SmartHub? Create an account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  padding: '0.8rem 1rem 0.8rem 2.5rem',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

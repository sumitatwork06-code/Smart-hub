import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Play, CheckCircle2, AlertCircle, Sparkles, Cpu } from 'lucide-react';

export default function Workflows({ cityState, setCityState }) {
  const [evaluationLogs, setEvaluationLogs] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [rulePrompt, setRulePrompt] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [explainingId, setExplainingId] = useState(null);

  const handleExplainAction = (rule) => {
    setExplainingId(rule.id);
    setTimeout(() => {
      let rationale = '';
      const trigger = (rule.trigger || '').toLowerCase();
      
      if (trigger.includes('wait') || trigger.includes('clinic')) {
        rationale = "Causal Impact Rationale:\n• Primary Care bottleneck detected (Clinic Wait > 20 mins).\n• Deploying responder patrols reduces check-in triage bottlenecks by approximately 22%.\n• Action optimizes patient flow and coordinates with emergency transport routes.";
      } else if (trigger.includes('aqi') || trigger.includes('air') || trigger.includes('pollution')) {
        rationale = "Causal Impact Rationale:\n• Heavy air pollution detected in warning zones.\n• Speed limit reduction (to 30 km/h) decreases particulate exhaust and tire-wear resuspension by 14% to 18%.\n• Proactively shields pedestrian corridors and residential school districts.";
      } else if (trigger.includes('traffic') || trigger.includes('congestion')) {
        rationale = "Causal Impact Rationale:\n• Severe mobility junction delay identified.\n• Activating intelligent detour signals and bypass routing controls ingress flow.\n• Reduces peak queue delay at key junctions by 15%, improving response times for emergency vehicles.";
      } else {
        rationale = "Causal Impact Rationale:\n• Municipal automation override triggers rule settings to maintain city-wide capacities.\n• Calibrates system load margins and warns dispatch managers of threshold alerts.";
      }
      
      setExplanations(prev => ({ ...prev, [rule.id]: rationale }));
      setExplainingId(null);
    }, 450);
  };

  const toggleRule = async (ruleId) => {
    // Optimistically update frontend UI
    const updatedWorkflows = cityState.workflows.map((rule) => {
      if (rule.id === ruleId) {
        return { ...rule, active: !rule.active };
      }
      return rule;
    });
    setCityState(prev => ({ ...prev, workflows: updatedWorkflows }));

    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/workflows/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId })
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, workflows: data.workflows }));
      }
    } catch (err) {
      console.error("Failed to toggle workflow rule:", err);
    }
  };

  const evaluateRules = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, zones: data.zones }));
        setEvaluationLogs(prev => [...data.logs, ...prev]);
      }
    } catch (err) {
      console.error("Failed to evaluate workflow rules:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!rulePrompt.trim()) return;
    setCompiling(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/workflows/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rulePrompt })
      });
      const data = await res.json();
      if (data.success) {
        setCityState(prev => ({ ...prev, workflows: data.workflows }));
        setRulePrompt('');
        setEvaluationLogs(prev => [
          { type: 'info', detail: `[AI Compiler] Successfully loaded new rule: "${data.rule.name}"` },
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Failed to compile rule with AI:", err);
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Automation Rule Engine</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
            Configure and trigger active policy automation nodes. Rules evaluate sensor payloads and dispatch city responders.
          </p>
        </div>
        <button
          onClick={evaluateRules}
          disabled={evaluating}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--color-teal)), #0d9488)',
            border: 'none',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(20, 180, 160, 0.25)',
            opacity: evaluating ? 0.7 : 1,
          }}
        >
          <Play size={16} /> {evaluating ? 'Evaluating...' : 'Evaluate Rules'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Rules List Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            Active Automation Nodes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cityState.workflows.map((rule) => (
              <div
                key={rule.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: rule.active ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  opacity: rule.active ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, marginRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{rule.name}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--text-secondary))' }}>
                        {rule.id.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-teal))' }}>Trigger: {rule.trigger}</span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Action: {rule.action}</span>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: rule.active ? 'hsl(var(--color-teal))' : 'hsl(var(--text-muted))',
                      cursor: 'pointer',
                    }}
                  >
                    {rule.active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Explainable AI buttons and Rationale */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleExplainAction(rule)}
                    disabled={explainingId === rule.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'hsl(var(--color-teal))',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                      outline: 'none'
                    }}
                  >
                    {explainingId === rule.id ? 'Analyzing impact...' : '• Explain Decision Rationale (Responsible AI)'}
                  </button>

                  {explanations[rule.id] && (
                    <div style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      background: 'rgba(20, 180, 160, 0.03)',
                      border: '1px solid rgba(20, 180, 160, 0.12)',
                      fontSize: '0.72rem',
                      color: 'hsl(var(--text-secondary))',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-line',
                      fontFamily: 'monospace'
                    }}>
                      {explanations[rule.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Rule Builder & Event Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {/* AI automation rule compiler */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={16} style={{ color: 'hsl(var(--color-primary))' }} /> AI Rule Builder
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
              Compose automated rules in natural English (e.g. <i>"If clinic wait time &gt; 20 mins in Zone A, deploy emergency patrols"</i>).
            </p>
            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={rulePrompt}
                onChange={(e) => setRulePrompt(e.target.value)}
                placeholder="Type your natural language automation rule..."
                style={{
                  width: '100%',
                  height: '70px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
                disabled={compiling}
              />
              <button
                type="submit"
                disabled={compiling || !rulePrompt.trim()}
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)), #4f46e5)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  opacity: compiling ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                }}
              >
                {compiling ? 'Compiling with Gemini...' : 'Compile & Save Rule'}
              </button>
            </form>
          </div>

          {/* Execution Log Terminal */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'hsl(var(--color-teal))' }} /> Event Log Terminal
            </h3>

            <div
              style={{
                height: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: 'hsl(var(--text-secondary))',
              }}
            >
              {evaluationLogs.length > 0 ? (
                evaluationLogs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      background: log.type === 'trigger' ? 'rgba(240, 40, 80, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      borderLeft: log.type === 'trigger' ? '3px solid hsl(var(--color-rose))' : '3px solid hsl(var(--color-teal))',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ color: log.type === 'trigger' ? 'hsl(var(--color-rose))' : 'hsl(var(--color-teal))', fontWeight: '600' }}>
                        {log.type === 'trigger' ? '[RULE TRIGGERED]' : '[INFO]'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    {log.type === 'trigger' ? (
                      <div>
                        <div>Rule: <strong>{log.ruleName}</strong></div>
                        <div>Zone: <strong>{log.zone}</strong></div>
                        <div style={{ color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>Payload: {log.detail}</div>
                      </div>
                    ) : (
                      <div>{log.detail}</div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'hsl(var(--text-muted))', textAlign: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                  <span>[Terminal Idle]</span>
                  <span style={{ fontSize: '0.7rem' }}>Click "Evaluate Rules" to test active triggers.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

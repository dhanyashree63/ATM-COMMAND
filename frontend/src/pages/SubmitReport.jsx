import React, { useState, useEffect } from 'react';
import { 
  FilePlus, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  Binary, 
  Send, 
  RefreshCw, 
  Info,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';

export default function SubmitReport() {
  const [formData, setFormData] = useState({
    reporter_name: '',
    branch_name: '',
    contact: '',
    email: '',
    atm_id: '',
    error_code: '',
    description: '',
    notes: '',
    urgency: 'Medium',
    incident_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });

  const [liveValidation, setLiveValidation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Quick preset loader for convenient testing
  const presets = [
    { label: 'Bangalore Hardware (E12H)', atm_id: 'ATMBLR1234', error_code: 'E12H', branch: 'MG Road Bangalore', desc: 'Card reader transport motor failed.' },
    { label: 'Mysore Cash-Handling (E31C)', atm_id: 'ATMMYS1234', error_code: 'E31C', branch: 'Sayyaji Rao Mysore', desc: 'Dispenser note shutter jam detected during payout.' },
    { label: 'Mangaluru Network (E25N)', atm_id: 'ATMMNG1234', error_code: 'E25N', branch: 'Hampankatta Mangaluru', desc: 'Host gateway connection timeout on switch.' },
    { label: 'Hubballi Software (E45S)', atm_id: 'ATMHUB1234', error_code: 'E45S', branch: 'Koppikar Hubballi', desc: 'Terminal OS kernel exception and freeze.' },
    { label: 'Emergency Security (E90X)', atm_id: 'ATMBLR1234', error_code: 'E90X', branch: 'Indiranagar Bangalore', desc: 'Anti-skimmer optical sensor tripped on card bezel.' },
    { label: 'Unmapped Prefix Fallback', atm_id: 'ATMDEL1234', error_code: 'E12H', branch: 'Test Delhi Terminal', desc: 'Testing unmapped prefix exception routing.' },
  ];

  const applyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      atm_id: preset.atm_id,
      error_code: preset.error_code,
      branch_name: preset.branch,
      description: preset.desc,
      reporter_name: prev.reporter_name || 'Rajesh Branch Officer',
      contact: prev.contact || '+91 98450 12345',
      email: prev.email || 'ops.branch@bank.com'
    }));
  };

  // Perform live validation debounced
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.atm_id || formData.error_code) {
        try {
          const res = await api.liveValidate({
            atm_id: formData.atm_id,
            error_code: formData.error_code,
            description: formData.description
          });
          setLiveValidation(res);
        } catch (err) {
          console.error("Live validation failed:", err);
        }
      } else {
        setLiveValidation(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [formData.atm_id, formData.error_code, formData.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmissionResult(null);
    setSubmitting(true);

    try {
      const res = await api.submitReport(formData);
      setSubmissionResult(res);
      // Reset form on success except reporter details
      setFormData(prev => ({
        ...prev,
        atm_id: '',
        error_code: '',
        description: '',
        notes: '',
        urgency: 'Medium'
      }));
    } catch (err) {
      setSubmitError(err.message || "Failed to submit ATM incident report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Submit ATM Error Report
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Automated DFA validation, regex cross-checking, 5-category classification, and Bellman-Ford dispatch
        </p>
      </div>

      {/* Preset Buttons for Demo */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Demo Presets:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => applyPreset(p)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', padding: '4px 10px' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Form on Left, Live Validation & Result on Right */}
      <div className="grid-2">
        {/* Form Column */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* SECTION A - REPORTER INFORMATION */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Section A — Reporter Information
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Reporter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={formData.reporter_name}
                    onChange={e => setFormData({ ...formData, reporter_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala Bangalore"
                    value={formData.branch_name}
                    onChange={e => setFormData({ ...formData, branch_name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98450 12345"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. branch.ops@bank.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B - ATM IDENTIFIERS */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Section B — ATM &amp; Error Identifiers
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    ATM ID * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(ATM + 3 alpha + 4 digits)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. ATMBLR1234"
                    value={formData.atm_id}
                    onChange={e => setFormData({ ...formData, atm_id: e.target.value.toUpperCase() })}
                    className={`form-input ${
                      liveValidation?.atm_id?.value ? (liveValidation.atm_id.dfa_valid ? 'is-valid' : 'is-invalid') : ''
                    }`}
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.5px' }}
                  />
                  <span className="form-hint">Regex: ^ATM[A-Z]&#123;3&#125;[0-9]&#123;4&#125;$</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Error Code * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(E + 2 digits + 1 alpha)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. E12H"
                    value={formData.error_code}
                    onChange={e => setFormData({ ...formData, error_code: e.target.value.toUpperCase() })}
                    className={`form-input ${
                      liveValidation?.error_code?.value ? (liveValidation.error_code.dfa_valid ? 'is-valid' : 'is-invalid') : ''
                    }`}
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.5px' }}
                  />
                  <span className="form-hint">Regex: ^E[0-9]&#123;2&#125;[A-Z]$</span>
                </div>
              </div>
            </div>

            {/* SECTION C - INCIDENT DETAILS */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Section C — Incident Information
              </div>

              <div className="form-group">
                <label className="form-label">Error Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the malfunction observed on terminal..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Urgency Level *</label>
                  <select
                    value={formData.urgency}
                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                    className="form-select"
                  >
                    <option value="Low">Low (Standard)</option>
                    <option value="Medium">Medium (Operational Impact)</option>
                    <option value="High">High (Terminal Halted)</option>
                    <option value="Critical">Critical (Immediate Emergency / Risk)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Date &amp; Time</label>
                  <input
                    type="text"
                    value={formData.incident_time}
                    onChange={e => setFormData({ ...formData, incident_time: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Operator Notes</label>
                <input
                  type="text"
                  placeholder="Optional branch supervisory notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {submitError && (
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-critical-bg)',
                color: 'var(--color-critical)',
                border: '1px solid rgba(224, 82, 82, 0.3)',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <strong>Submission Rejected:</strong> {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600 }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing DFA &amp; Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Incident &amp; Trigger Dispatch Engine</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Validation & Result Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Submission Result Banner */}
          {submissionResult && (
            <div className="card" style={{ borderColor: 'var(--color-success)', background: 'linear-gradient(180deg, rgba(37, 168, 121, 0.1) 0%, var(--bg-card) 100%)' }}>
              <div className="card-header" style={{ borderBottomColor: 'rgba(37, 168, 121, 0.3)' }}>
                <div className="card-title" style={{ color: 'var(--color-success)' }}>
                  <CheckCircle2 size={18} />
                  <span>INCIDENT LOGGED &amp; DISPATCHED SUCCESSFULLY</span>
                </div>
                <span className="code-pill" style={{ color: '#FFFFFF', backgroundColor: 'var(--color-success)' }}>
                  {submissionResult.report_id}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Category</div>
                    <div style={{ marginTop: '4px' }}><CategoryBadge category={submissionResult.classification?.category} /></div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculated Priority</div>
                    <div style={{ marginTop: '4px' }}><PriorityBadge priority={submissionResult.priority?.level} /></div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Regional Support Zone</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {submissionResult.routing?.zone}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Handler</div>
                    <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
                      {submissionResult.routing?.handler_name}
                    </div>
                  </div>
                </div>

                {/* Route visualization */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Bellman-Ford Calculated Dispatch Path (Total Cost: {submissionResult.routing?.route_cost} min)
                  </div>
                  <div className="route-trail">
                    {submissionResult.routing?.route_nodes?.map((node, i) => (
                      <React.Fragment key={i}>
                        <span className="route-node">{node}</span>
                        {i < submissionResult.routing.route_nodes.length - 1 && <span className="route-arrow">&rarr;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  {submissionResult.routing?.routing_reason}
                </div>
              </div>
            </div>
          )}

          {/* Live Validation Feedback Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Binary size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Live Automata &amp; Regex Inspection</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BCS503 Verification</span>
            </div>

            {liveValidation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* ATM ID DFA Inspection */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ATM ID DFA Machine:</span>
                    <span className={`badge ${liveValidation.atm_id.dfa_valid ? 'badge-status-resolved' : 'badge-status-pending'}`}>
                      {liveValidation.atm_id.dfa_valid ? 'ACCEPTED (q10)' : `STATE: ${liveValidation.atm_id.current_state}`}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {liveValidation.atm_id.message}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Regex Match: <strong>{liveValidation.atm_id.regex_valid ? 'YES' : 'NO'}</strong></span>
                    <span>L(M) == L(R) Agreement: <strong>{liveValidation.atm_id.agreed ? 'YES' : 'NO'}</strong></span>
                  </div>
                </div>

                {/* Error Code DFA Inspection */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Error Code DFA Machine:</span>
                    <span className={`badge ${liveValidation.error_code.dfa_valid ? 'badge-status-resolved' : 'badge-status-pending'}`}>
                      {liveValidation.error_code.dfa_valid ? 'ACCEPTED (s4)' : `STATE: ${liveValidation.error_code.current_state}`}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {liveValidation.error_code.message}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Regex Match: <strong>{liveValidation.error_code.regex_valid ? 'YES' : 'NO'}</strong></span>
                    <span>L(M) == L(R) Agreement: <strong>{liveValidation.error_code.agreed ? 'YES' : 'NO'}</strong></span>
                  </div>
                </div>

                {/* Category & Routing Deduction Preview */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Engine Deduction Preview:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Predicted Category:</div>
                      <div style={{ marginTop: '4px' }}>
                        <CategoryBadge category={liveValidation.category_preview.category} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Extracted Routing Zone:</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {liveValidation.routing_preview.zone || 'None'}
                      </div>
                    </div>
                  </div>
                  {liveValidation.category_preview.reason && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      Reason: {liveValidation.category_preview.reason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Info size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                Type an ATM ID (e.g. ATMBLR1234) and Error Code (e.g. E12H) to view live state transitions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

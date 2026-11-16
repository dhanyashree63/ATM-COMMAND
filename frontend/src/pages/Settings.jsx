import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Save, 
  RefreshCw, 
  Layers, 
  Binary, 
  MapPin, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';
import { api } from '../api';
import { CategoryBadge } from '../components/Badges';

export default function Settings() {
  const [mappings, setMappings] = useState([]);
  const [routingTable, setRoutingTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Mapping Modal
  const [showAddMapModal, setShowAddMapModal] = useState(false);
  const [newCodeForm, setNewCodeForm] = useState({
    error_code: '',
    category: 'Hardware',
    name: '',
    description: ''
  });
  const [savingCode, setSavingCode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mapData, routeData] = await Promise.all([
        api.getErrorMappings(),
        api.getRoutingTable()
      ]);
      setMappings(mapData);
      setRoutingTable(routeData);
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCode = async (e) => {
    e.preventDefault();
    try {
      setSavingCode(true);
      await api.addErrorMapping(newCodeForm);
      await fetchData();
      setShowAddMapModal(false);
      setNewCodeForm({ error_code: '', category: 'Hardware', name: '', description: '' });
    } catch (err) {
      alert("Failed to save error code mapping: " + err.message);
    } finally {
      setSavingCode(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Settings &amp; Rule Configuration
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            BCS503 error code classification taxonomies and BCS502 regional routing rules
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Rules</span>
        </button>
      </div>

      {/* Section 1: Configurable Error Code Mappings (Section 8) */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Binary size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Configurable Error Code Taxonomy (BCS503 Five Categories)</span>
          </div>
          <button onClick={() => setShowAddMapModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Add Error Code</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Error Code</th>
                <th>Category</th>
                <th>Subsystem Fault Name</th>
                <th>Technical Diagnostics Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(m => (
                <tr key={m.error_code}>
                  <td><span className="code-pill" style={{ fontWeight: 700 }}>{m.error_code}</span></td>
                  <td><CategoryBadge category={m.category} /></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.description}</td>
                  <td><span className="badge badge-status-resolved">ACTIVE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Regional Zone Parameters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <MapPin size={16} style={{ color: 'var(--accent-secondary)' }} />
            <span>Karnataka Support Zones &amp; Active Prefixes (BCS502)</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Karnataka Support Grid</span>
        </div>

        <div className="grid-2" style={{ gap: '16px' }}>
          {[
            { zone: 'Zone 1 — Bangalore', prefixes: 'BLR, BNG', primary: 'Bangalore Support', backup: 'Bangalore Backup', manager: 'Bangalore Regional Manager' },
            { zone: 'Zone 2 — Mysore', prefixes: 'MYS', primary: 'Mysore Support', backup: 'Mysore Backup', manager: 'Mysore Regional Manager' },
            { zone: 'Zone 3 — Mangaluru', prefixes: 'MNG, MLR', primary: 'Mangaluru Support', backup: 'Mangaluru Backup', manager: 'Mangaluru Regional Manager' },
            { zone: 'Zone 4 — Hubballi', prefixes: 'HUB', primary: 'Hubballi Support', backup: 'Hubballi Backup', manager: 'Hubballi Regional Manager' },
          ].map(z => (
            <div key={z.zone} style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {z.zone}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Configured Prefixes: <strong style={{ color: 'var(--accent-primary)' }}>{z.prefixes}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Primary Team: <strong>{z.primary}</strong> | Backup: <strong>{z.backup}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Escalation Authority: {z.manager}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Priority Engine Rules Reference */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sliders size={16} style={{ color: '#E9A23B' }} />
            <span>Deterministic Priority &amp; Security Override Matrix</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <div>
            &bull; <strong style={{ color: 'var(--color-critical)' }}>Security Override Rule:</strong> Any incident classified as Security is automatically assigned <strong>P1 - Critical</strong> and bypassed directly to Central Security Desk.
          </div>
          <div>
            &bull; <strong style={{ color: '#F59E0B' }}>Cash-Handling Escalation Rule:</strong> Cash dispensing or vault cassette faults with High urgency are elevated to <strong>P1 - Critical</strong> to prevent monetary loss and cash starvation.
          </div>
          <div>
            &bull; <strong style={{ color: 'var(--accent-secondary)' }}>Hardware &amp; Network Rule:</strong> Hardware or network disruptions with High urgency are assigned <strong>P2 - High</strong>, utilizing secondary backup handlers if primary is full.
          </div>
          <div>
            &bull; <strong style={{ color: '#94A3B8' }}>Deterministic Queue Ordering:</strong> P1 &gt; P2 &gt; P3 &gt; P4 &rarr; created_at ASC &rarr; report_id ASC.
          </div>
        </div>
      </div>

      {/* Add Error Code Modal */}
      {showAddMapModal && (
        <div className="modal-overlay" onClick={() => setShowAddMapModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Add Configurable Error Code Mapping
            </h3>
            <form onSubmit={handleAddCode}>
              <div className="form-group">
                <label className="form-label">Error Code * (Format: E + 2 digits + 1 alpha)</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. E50N"
                  value={newCodeForm.error_code}
                  onChange={e => setNewCodeForm({ ...newCodeForm, error_code: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Category *</label>
                <select
                  value={newCodeForm.category}
                  onChange={e => setNewCodeForm({ ...newCodeForm, category: e.target.value })}
                  className="form-select"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Network">Network</option>
                  <option value="Cash-Handling">Cash-Handling</option>
                  <option value="Software">Software</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subsystem Fault Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical Cash Escrow Jam"
                  value={newCodeForm.name}
                  onChange={e => setNewCodeForm({ ...newCodeForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Diagnostic Description</label>
                <textarea
                  rows={3}
                  placeholder="Technical diagnostics and failure symptoms..."
                  value={newCodeForm.description}
                  onChange={e => setNewCodeForm({ ...newCodeForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddMapModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingCode} className="btn btn-primary">
                  {savingCode ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Error Mapping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Sliders, 
  UserCheck, 
  Layers,
  ArrowUpRight,
  Send,
  X
} from 'lucide-react';
import { api } from '../api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';

export default function HandlerManagement() {
  const [handlers, setHandlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHandler, setNewHandler] = useState({
    employee_id: '',
    name: '',
    team: 'Bangalore Support',
    zone: 'Bangalore',
    capacity: 5,
    supported_categories: 'Hardware,Network,Cash-Handling,Software'
  });
  const [savingHandler, setSavingHandler] = useState(false);

  // Edit Capacity Modal
  const [editingCapacityHandler, setEditingCapacityHandler] = useState(null);
  const [capacityVal, setCapacityVal] = useState(5);

  // Resolve Assignment Modal for a Handler
  const [selectedHandlerForResolve, setSelectedHandlerForResolve] = useState(null);
  const [handlerReports, setHandlerReports] = useState([]);
  const [resolveReportId, setResolveReportId] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchHandlers = async () => {
    try {
      setLoading(true);
      const data = await api.getHandlers();
      setHandlers(data);
    } catch (err) {
      console.error("Failed to load handlers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandlers();
  }, []);

  const toggleAvailability = async (handler) => {
    try {
      const newAvail = handler.availability === 1 ? 0 : 1;
      await api.updateHandler(handler.employee_id, { availability: newAvail });
      fetchHandlers();
    } catch (err) {
      alert("Failed to toggle availability: " + err.message);
    }
  };

  const handleCapacitySave = async () => {
    if (!editingCapacityHandler) return;
    try {
      await api.updateHandler(editingCapacityHandler.employee_id, { capacity: parseInt(capacityVal) });
      fetchHandlers();
      setEditingCapacityHandler(null);
    } catch (err) {
      alert("Failed to update capacity: " + err.message);
    }
  };

  const handleAddHandler = async (e) => {
    e.preventDefault();
    try {
      setSavingHandler(true);
      await api.addHandler(newHandler);
      fetchHandlers();
      setShowAddModal(false);
      setNewHandler({
        employee_id: '',
        name: '',
        team: 'Bangalore Support',
        zone: 'Bangalore',
        capacity: 5,
        supported_categories: 'Hardware,Network,Cash-Handling,Software'
      });
    } catch (err) {
      alert("Failed to add handler: " + err.message);
    } finally {
      setSavingHandler(false);
    }
  };

  const openResolveDialog = async (handler) => {
    setSelectedHandlerForResolve(handler);
    try {
      const reports = await api.getReports({ search: handler.employee_id });
      const active = reports.filter(r => r.assigned_handler === handler.employee_id && r.status !== 'Resolved');
      setHandlerReports(active);
      if (active.length > 0) setResolveReportId(active[0].report_id);
      setResolveNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const submitResolveReport = async () => {
    if (!resolveReportId) return;
    try {
      setResolving(true);
      await api.updateReportStatus(resolveReportId, {
        status: 'Resolved',
        resolution_notes: resolveNotes || 'Incident verified and marked Resolved by regional engineer.',
        updated_by: selectedHandlerForResolve.name
      });
      // Refresh handler reports
      const reports = await api.getReports({ search: selectedHandlerForResolve.employee_id });
      const active = reports.filter(r => r.assigned_handler === selectedHandlerForResolve.employee_id && r.status !== 'Resolved');
      setHandlerReports(active);
      fetchHandlers();
      if (active.length === 0) setSelectedHandlerForResolve(null);
    } catch (err) {
      alert("Resolution failed: " + err.message);
    } finally {
      setResolving(false);
    }
  };

  const filteredHandlers = selectedZone
    ? handlers.filter(h => h.zone === selectedZone)
    : handlers;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Regional Handler &amp; Capacity Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Primary, backup, and security handler workloads, availability toggles, and incident resolution
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchHandlers} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Handlers</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Add Support Handler</span>
          </button>
        </div>
      </div>

      {/* Zone Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['', 'Bangalore', 'Mysore', 'Mangaluru', 'Hubballi', 'Central'].map(z => (
          <button
            key={z}
            onClick={() => setSelectedZone(z)}
            className={`btn btn-sm ${selectedZone === z ? 'btn-primary' : 'btn-secondary'}`}
          >
            {z || 'All Zones'}
          </button>
        ))}
      </div>

      {/* Handler Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {filteredHandlers.map(h => {
          const isFull = h.current_load >= h.capacity;
          const loadPercent = Math.min(100, Math.round((h.current_load / h.capacity) * 100));

          return (
            <div key={h.employee_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {h.name}
                    </h4>
                    <span className="code-pill" style={{ fontSize: '11px' }}>{h.employee_id}</span>
                  </div>

                  <button
                    onClick={() => toggleAvailability(h)}
                    className={`badge ${h.availability === 1 ? 'badge-status-resolved' : 'badge-p1'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                    title="Click to toggle availability"
                  >
                    {h.availability === 1 ? (
                      <><CheckCircle2 size={12} /> Available</>
                    ) : (
                      <><XCircle size={12} /> Unavailable</>
                    )}
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Team: <strong style={{ color: 'var(--text-primary)' }}>{h.team}</strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Zone: <strong>{h.zone}</strong>
                </div>

                {/* Capacity & Workload Bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Workload Capacity</span>
                    <span style={{ fontWeight: 600, color: isFull ? 'var(--color-critical)' : 'var(--text-primary)' }}>
                      {h.current_load} / {h.capacity} Incidents ({loadPercent}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${loadPercent}%`,
                      backgroundColor: isFull ? 'var(--color-critical)' : (loadPercent > 60 ? 'var(--color-warning)' : 'var(--accent-primary)'),
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Supported categories */}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Categories: {h.supported_categories}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  onClick={() => {
                    setEditingCapacityHandler(h);
                    setCapacityVal(h.capacity);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Sliders size={13} />
                  <span>Capacity</span>
                </button>

                <button
                  onClick={() => openResolveDialog(h)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  disabled={h.current_load === 0}
                >
                  <CheckCircle2 size={13} />
                  <span>Resolve ({h.current_load})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Handler Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Add Regional Support Handler
            </h3>
            <form onSubmit={handleAddHandler}>
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-BLR-04"
                  value={newHandler.employee_id}
                  onChange={e => setNewHandler({ ...newHandler, employee_id: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Handler Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vinay Hegde"
                  value={newHandler.name}
                  onChange={e => setNewHandler({ ...newHandler, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Regional Support Zone *</label>
                  <select
                    value={newHandler.zone}
                    onChange={e => {
                      const z = e.target.value;
                      setNewHandler({ ...newHandler, zone: z, team: `${z} Support` });
                    }}
                    className="form-select"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mysore">Mysore</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi">Hubballi</option>
                    <option value="Central">Central</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Support Team *</label>
                  <input
                    type="text"
                    required
                    value={newHandler.team}
                    onChange={e => setNewHandler({ ...newHandler, team: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Max Incident Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newHandler.capacity}
                  onChange={e => setNewHandler({ ...newHandler, capacity: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supported Categories (comma separated)</label>
                <input
                  type="text"
                  value={newHandler.supported_categories}
                  onChange={e => setNewHandler({ ...newHandler, supported_categories: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingHandler} className="btn btn-primary">
                  {savingHandler ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Save Handler</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Capacity Modal */}
      {editingCapacityHandler && (
        <div className="modal-overlay" onClick={() => setEditingCapacityHandler(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              Configure Handler Capacity
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Adjust maximum active incident workload for <strong>{editingCapacityHandler.name}</strong> ({editingCapacityHandler.employee_id}).
            </p>

            <div className="form-group">
              <label className="form-label">Maximum Workload Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                value={capacityVal}
                onChange={e => setCapacityVal(e.target.value)}
                className="form-input"
              />
              <span className="form-hint">Current active load: {editingCapacityHandler.current_load}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingCapacityHandler(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCapacitySave} className="btn btn-primary">
                Save Capacity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Handler Report Modal */}
      {selectedHandlerForResolve && (
        <div className="modal-overlay" onClick={() => setSelectedHandlerForResolve(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Resolve Incident Assignment
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Engineer: {selectedHandlerForResolve.name} ({selectedHandlerForResolve.employee_id})
                </div>
              </div>
              <button onClick={() => setSelectedHandlerForResolve(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            {handlerReports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Active Incident to Resolve</label>
                  <select
                    value={resolveReportId}
                    onChange={e => setResolveReportId(e.target.value)}
                    className="form-select"
                  >
                    {handlerReports.map(r => (
                      <option key={r.report_id} value={r.report_id}>
                        {r.report_id} — {r.atm_id} ({r.category}) [{r.priority}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Engineer Resolution Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cleared note jam in cash diverter and calibrated sensor..."
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(37, 168, 121, 0.1)',
                  fontSize: '12px',
                  color: 'var(--color-success)'
                }}>
                  Resolving this incident will free 1 capacity unit on {selectedHandlerForResolve.name} and automatically trigger the waiting queue auto-dispatcher!
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => setSelectedHandlerForResolve(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button onClick={submitResolveReport} disabled={resolving} className="btn btn-success">
                    {resolving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Mark Incident Resolved</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No active unresolved incidents assigned to this handler currently.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

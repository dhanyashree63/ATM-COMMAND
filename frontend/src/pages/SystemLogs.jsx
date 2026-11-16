import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  RefreshCw, 
  Search, 
  Clock, 
  Activity, 
  FileText,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../components/Badges';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemLogs(100);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.report_id?.toLowerCase().includes(q) ||
      log.atm_id?.toLowerCase().includes(q) ||
      log.updated_by?.toLowerCase().includes(q) ||
      log.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Audit Logs &amp; Telemetry Feed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Immutable event audit trail tracking every validation, classification, dispatch, and state transition
          </p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search audit trail by Report ID, ATM ID, or actor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Report ID</th>
                <th>ATM ID</th>
                <th>Zone</th>
                <th>Category</th>
                <th>State Transition</th>
                <th>Updated By</th>
                <th>Operational Audit Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {l.timestamp}
                    </td>
                    <td><span className="code-pill">{l.report_id}</span></td>
                    <td style={{ fontWeight: 600 }}>{l.atm_id}</td>
                    <td>{l.zone_name || 'Central'}</td>
                    <td><CategoryBadge category={l.category} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{l.previous_status || 'Start'}</span>
                        <ArrowRight size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ color: 'var(--color-success)' }}>{l.new_status}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {l.updated_by}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {l.notes || 'Status updated'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No audit records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  MapPin, 
  User, 
  FileText,
  Calendar,
  Layers,
  Shield,
  Activity,
  Send
} from 'lucide-react';
import { api } from '../api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';

export default function IncidentManagement() {
  const getInitialParam = (key) => {
    if (typeof window === 'undefined') return '';
    const hashQuery = (window.location.hash.split('?')[1] || '');
    const params = new URLSearchParams(hashQuery || window.location.search);
    return params.get(key) || '';
  };

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => getInitialParam('search'));
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState(() => getInitialParam('priority'));

  // Selected report for inspection modal
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports({
        search,
        status: statusFilter,
        category: categoryFilter,
        zone: zoneFilter,
        priority: priorityFilter
      });
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter, zoneFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const openReportDetail = async (id) => {
    setSelectedReportId(id);
    try {
      setModalLoading(true);
      const detail = await api.getReportDetail(id);
      setSelectedReportDetail(detail);
      setNewStatus(detail.report.status === 'Resolved' ? 'Resolved' : 'In Progress');
      setResolutionNotes(detail.report.resolution_notes || '');
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedReportId) return;
    try {
      setUpdatingStatus(true);
      await api.updateReportStatus(selectedReportId, {
        status: newStatus,
        resolution_notes: resolutionNotes,
        updated_by: 'Regional Incident Handler'
      });
      // Refresh detail and report list
      const updated = await api.getReportDetail(selectedReportId);
      setSelectedReportDetail(updated);
      fetchReports();
    } catch (err) {
      alert("Status update failed: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Incident Management &amp; Tracking
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Comprehensive audit record, status tracking, and handler lifecycle for Karnataka ATM terminals
          </p>
        </div>
        <button onClick={fetchReports} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Report ID, ATM ID, branch, reporter, or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending Manual Correction">Manual Review</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Zones</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mysore">Mysore</option>
              <option value="Mangaluru">Mangaluru</option>
              <option value="Hubballi">Hubballi</option>
              <option value="Central">Central (Security)</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Network">Network</option>
              <option value="Cash-Handling">Cash-Handling</option>
              <option value="Software">Software</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div style={{ width: '140px' }}>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Priorities</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>ATM ID</th>
                <th>Branch &amp; Reporter</th>
                <th>Error</th>
                <th>Category</th>
                <th>Zone</th>
                <th>Priority</th>
                <th>Assigned Handler</th>
                <th>Status</th>
                <th>Logged At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map(rep => (
                  <tr key={rep.report_id}>
                    <td><span className="code-pill">{rep.report_id}</span></td>
                    <td style={{ fontWeight: 600 }}>{rep.atm_id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{rep.branch}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rep.reporter_name}</div>
                    </td>
                    <td>
                      <span className="code-pill" style={{ color: 'var(--accent-primary)' }}>{rep.error_code}</span>
                    </td>
                    <td><CategoryBadge category={rep.category} /></td>
                    <td><span style={{ fontWeight: 500 }}>{rep.zone_name}</span></td>
                    <td><PriorityBadge priority={rep.priority} /></td>
                    <td style={{ fontSize: '12px' }}>
                      {rep.assigned_handler ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{rep.assigned_handler}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{rep.assigned_team}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Waiting Queue</span>
                      )}
                    </td>
                    <td><StatusBadge status={rep.status} /></td>
                    <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{rep.created_at}</td>
                    <td>
                      <button
                        onClick={() => openReportDetail(rep.report_id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No incident reports match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal / Drawer */}
      {selectedReportId && (
        <div className="modal-overlay" onClick={() => setSelectedReportId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Incident Detail — {selectedReportId}
                  </h3>
                  {selectedReportDetail?.report && <StatusBadge status={selectedReportDetail.report.status} />}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Submitted on {selectedReportDetail?.report?.created_at}
                </div>
              </div>
              <button onClick={() => setSelectedReportId(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            {modalLoading || !selectedReportDetail ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--accent-primary)' }} />
                <div>Loading incident records and DFA traces...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Section: Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ATM Terminal</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selectedReportDetail.report.atm_id}
                    </div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Category</div>
                    <div style={{ marginTop: '4px' }}><CategoryBadge category={selectedReportDetail.report.category} /></div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Priority</div>
                    <div style={{ marginTop: '4px' }}><PriorityBadge priority={selectedReportDetail.report.priority} /></div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Regional Zone</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selectedReportDetail.report.zone_name}
                    </div>
                  </div>
                </div>

                {/* Section: Reporter and Error Details */}
                <div className="grid-2" style={{ gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                      Reporter &amp; Branch Information
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                      <div>Branch: <strong>{selectedReportDetail.report.branch}</strong></div>
                      <div>Reporter: <strong>{selectedReportDetail.report.reporter_name}</strong></div>
                      <div>Contact: <strong>{selectedReportDetail.report.contact || 'N/A'}</strong></div>
                      <div>Email: <strong>{selectedReportDetail.report.email || 'N/A'}</strong></div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                      Validation &amp; Classification Analysis
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div>Validation: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>PASSED (DFA q10 / Regex Match)</span></div>
                      <div>Error Code: <span className="code-pill">{selectedReportDetail.report.error_code}</span></div>
                      <div style={{ color: 'var(--text-secondary)' }}>Reason: {selectedReportDetail.report.classification_reason}</div>
                    </div>
                  </div>
                </div>

                {/* Section: Description */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Incident Description:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {selectedReportDetail.report.description}
                  </div>
                </div>

                {/* Section: Bellman-Ford Route */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Bellman-Ford Dispatch Path:
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Routing Cost: {selectedReportDetail.report.route_cost} min
                    </span>
                  </div>
                  <div className="route-trail">
                    {selectedReportDetail.report.route ? (
                      selectedReportDetail.report.route.split(' -> ').map((node, idx, arr) => (
                        <React.Fragment key={idx}>
                          <span className="route-node">{node}</span>
                          {idx < arr.length - 1 && <span className="route-arrow">&rarr;</span>}
                        </React.Fragment>
                      ))
                    ) : (
                      <span>Direct Route</span>
                    )}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Assigned Handler: <strong style={{ color: 'var(--text-primary)' }}>{selectedReportDetail.handler?.name || selectedReportDetail.report.assigned_handler || 'Unassigned'}</strong> ({selectedReportDetail.report.assigned_team || 'Waiting Queue'})
                  </div>
                </div>

                {/* Section: Complete History Audit Log */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Incident Event Audit History:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedReportDetail.history?.map((h, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderLeft: '3px solid var(--accent-primary)',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.previous_status} &rarr; {h.new_status}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>by {h.updated_by}</span>
                          {h.notes && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.notes}</div>}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Handler Status Updater */}
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(25, 167, 160, 0.08)', border: '1px solid rgba(25, 167, 160, 0.25)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                    Update Incident Status &amp; Resolution
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ width: '180px' }}>
                      <label className="form-label">New Status</label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="form-select"
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved (Frees Handler)</option>
                      </select>
                    </div>

                    <div style={{ flex: '1', minWidth: '240px' }}>
                      <label className="form-label">Resolution / Progress Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Technician replaced jammed cassette roller..."
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button
                      onClick={handleStatusUpdate}
                      disabled={updatingStatus}
                      className="btn btn-primary"
                      style={{ height: '38px' }}
                    >
                      {updatingStatus ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

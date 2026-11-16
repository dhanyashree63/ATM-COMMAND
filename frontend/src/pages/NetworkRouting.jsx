import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Play, 
  RotateCcw, 
  MapPin, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Edit2,
  Save,
  Plus,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { api } from '../api';

export default function NetworkRouting() {
  const [topology, setTopology] = useState({ nodes: [], edges: [] });
  const [routingTable, setRoutingTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bellman-Ford Simulation State
  const [sourceNode, setSourceNode] = useState('ATMBLR1234');
  const [targetNode, setTargetNode] = useState('EMP-BLR-01');
  const [bfResult, setBfResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Prefix Management Modal
  const [editingPrefix, setEditingPrefix] = useState(null);
  const [prefixForm, setPrefixForm] = useState({ prefix: '', zone_id: 1, primary_team: '', backup_team: '', escalation_authority: '' });
  const [savingPrefix, setSavingPrefix] = useState(false);

  // Edge Weight Editor
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [newWeight, setNewWeight] = useState(5.0);
  const [updatingWeight, setUpdatingWeight] = useState(false);

  const fetchRoutingData = async () => {
    try {
      setLoading(true);
      const [topData, tableData] = await Promise.all([
        api.getNetworkTopology(),
        api.getRoutingTable()
      ]);
      setTopology(topData);
      setRoutingTable(tableData);
    } catch (err) {
      console.error("Failed to load network routing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutingData();
  }, []);

  const runBellmanFord = async () => {
    try {
      setCalculating(true);
      const result = await api.calculateBellmanFord({
        source: sourceNode,
        destination: targetNode
      });
      setBfResult(result);
    } catch (err) {
      alert("Bellman-Ford calculation error: " + err.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleUpdateEdge = async () => {
    if (!selectedEdge) return;
    try {
      setUpdatingWeight(true);
      await api.updateEdgeWeight(selectedEdge.edge_id, newWeight);
      await fetchRoutingData();
      if (bfResult) runBellmanFord();
      setSelectedEdge(null);
    } catch (err) {
      alert("Failed to update edge weight: " + err.message);
    } finally {
      setUpdatingWeight(false);
    }
  };

  const handleSavePrefix = async (e) => {
    e.preventDefault();
    try {
      setSavingPrefix(true);
      await api.updateRoutingPrefix(prefixForm);
      await fetchRoutingData();
      setEditingPrefix(null);
    } catch (err) {
      alert("Failed to save prefix mapping: " + err.message);
    } finally {
      setSavingPrefix(false);
    }
  };

  const isHighlightedNode = (nodeId) => {
    return bfResult?.shortest_path?.includes(nodeId);
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            BCS502 – Network Routing &amp; Dispatch Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Bellman-Ford dynamic programming shortest path routing across Karnataka ATM support topology
          </p>
        </div>
        <button onClick={fetchRoutingData} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Topology</span>
        </button>
      </div>

      {/* Bellman-Ford Interactive Execution Panel */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Cpu size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Bellman-Ford Shortest-Path Algorithm Execution Console</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Graph G = (V, E) | Negative Cycle Detection</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ width: '220px' }}>
            <label className="form-label">Source Node (ATM / Terminal)</label>
            <select
              value={sourceNode}
              onChange={e => setSourceNode(e.target.value)}
              className="form-select"
            >
              <option value="ATMBLR1234">ATMBLR1234 (Bangalore)</option>
              <option value="ATMMYS1234">ATMMYS1234 (Mysore)</option>
              <option value="ATMMNG1234">ATMMNG1234 (Mangaluru)</option>
              <option value="ATMHUB1234">ATMHUB1234 (Hubballi)</option>
              <option value="ATM_SOURCE">ATM_SOURCE (Generic)</option>
            </select>
          </div>

          <div style={{ width: '260px' }}>
            <label className="form-label">Target Destination Node</label>
            <select
              value={targetNode}
              onChange={e => setTargetNode(e.target.value)}
              className="form-select"
            >
              <optgroup label="Bangalore Handlers">
                <option value="EMP-BLR-01">EMP-BLR-01 (Rajesh Rao - Primary)</option>
                <option value="EMP-BLR-03">EMP-BLR-03 (Chetan Kumar - Backup)</option>
              </optgroup>
              <optgroup label="Mysore Handlers">
                <option value="EMP-MYS-01">EMP-MYS-01 (Ananya Urs - Primary)</option>
                <option value="EMP-MYS-02">EMP-MYS-02 (Pradeep Gowda - Backup)</option>
              </optgroup>
              <optgroup label="Mangaluru Handlers">
                <option value="EMP-MNG-01">EMP-MNG-01 (Ashwin D'Souza - Primary)</option>
                <option value="EMP-MNG-02">EMP-MNG-02 (Divya Bhat - Backup)</option>
              </optgroup>
              <optgroup label="Hubballi Handlers">
                <option value="EMP-HUB-01">EMP-HUB-01 (Manjunath Patil - Primary)</option>
                <option value="EMP-HUB-02">EMP-HUB-02 (Sharanappa Bellad - Backup)</option>
              </optgroup>
              <optgroup label="Central Desks">
                <option value="EMP-SEC-01">EMP-SEC-01 (Central Security Desk)</option>
                <option value="EMP-REV-01">EMP-REV-01 (Central Routing Review)</option>
              </optgroup>
            </select>
          </div>

          <button
            onClick={runBellmanFord}
            disabled={calculating}
            className="btn btn-primary"
            style={{ height: '38px' }}
          >
            {calculating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>Execute Bellman-Ford</span>
          </button>
        </div>

        {/* Bellman-Ford Live Result Display */}
        {bfResult && (
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-primary)' }}>
                Shortest Path Calculated: {bfResult.total_cost} min total dispatch cost
              </div>
              <div>
                {bfResult.has_negative_cycle ? (
                  <span className="badge badge-p1"><AlertTriangle size={12} /> NEGATIVE CYCLE DETECTED</span>
                ) : (
                  <span className="badge badge-status-resolved"><CheckCircle2 size={12} /> NO NEGATIVE CYCLE (CONVERGED)</span>
                )}
              </div>
            </div>

            {/* Path Trail */}
            <div className="route-trail" style={{ marginBottom: '16px' }}>
              {bfResult.shortest_path?.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="route-node" style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-glow)' }}>
                    {node}
                  </span>
                  {i < bfResult.shortest_path.length - 1 && <span className="route-arrow">&rarr;</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Relaxation Iteration Log Table */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Dynamic Programming Edge Relaxations (|V| - 1 Iteration Passes):
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '11.5px' }}>
                <thead>
                  <tr>
                    <th>Pass</th>
                    <th>Edge Relaxed (u &rarr; v)</th>
                    <th>Edge Weight</th>
                    <th>Old Distance d[v]</th>
                    <th>Updated Distance d[u] + w</th>
                    <th>New Predecessor &pi;[v]</th>
                  </tr>
                </thead>
                <tbody>
                  {bfResult.iterations?.flatMap(iter => 
                    iter.updates.map((u, ui) => (
                      <tr key={`${iter.iteration}-${ui}`}>
                        <td>Pass #{iter.iteration}</td>
                        <td><span className="code-pill">{u.edge}</span></td>
                        <td>{u.weight}</td>
                        <td>{u.old_distance}</td>
                        <td><strong style={{ color: 'var(--color-success)' }}>{u.new_distance}</strong></td>
                        <td>{u.new_predecessor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Network Topology Visual Diagram */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Network size={16} style={{ color: 'var(--accent-secondary)' }} />
            <span>Karnataka ATM Network Routing Topology</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interactive Directed Weighted Graph</span>
        </div>

        {/* SVG Network Visualizer */}
        <div style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '24px 12px',
          overflowX: 'auto'
        }}>
          <svg width="860" height="340" viewBox="0 0 860 340">
            {/* Pipelines and Branches */}
            <defs>
              <marker id="topo-arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
              </marker>
              <marker id="topo-arrow-active" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#19A7A0" />
              </marker>
            </defs>

            {/* Ingestion spine lines */}
            <line x1="70" y1="160" x2="190" y2="160" stroke="#4D8DE0" strokeWidth="2" markerEnd="url(#topo-arrow)" />
            <line x1="190" y1="160" x2="310" y2="160" stroke="#4D8DE0" strokeWidth="2" markerEnd="url(#topo-arrow)" />
            <line x1="310" y1="160" x2="430" y2="160" stroke="#4D8DE0" strokeWidth="2" markerEnd="url(#topo-arrow)" />

            {/* Security Direct Bypass (Rule 11) */}
            <path d="M 310 160 Q 380 40 560 40" fill="none" stroke="#E05252" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="40" x2="720" y2="40" stroke="#E05252" strokeWidth="2.5" markerEnd="url(#topo-arrow)" />

            {/* Central Routing Review Fallback */}
            <path d="M 430 160 Q 480 300 560 300" fill="none" stroke="#FB7185" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="300" x2="720" y2="300" stroke="#FB7185" strokeWidth="2" markerEnd="url(#topo-arrow)" />

            {/* Regional Fan-out from Routing Engine */}
            {/* Bangalore */}
            <path d="M 430 160 L 560 100" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="100" x2="720" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />

            {/* Mysore */}
            <path d="M 430 160 L 560 145" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="145" x2="720" y2="145" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />

            {/* Mangaluru */}
            <path d="M 430 160 L 560 190" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="190" x2="720" y2="190" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />

            {/* Hubballi */}
            <path d="M 430 160 L 560 235" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />
            <line x1="560" y1="235" x2="720" y2="235" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#topo-arrow)" />

            {/* Nodes */}
            {/* ATM Sources */}
            <rect x="20" y="140" width="100" height="40" rx="6" fill="#1D2D45" stroke="#4D8DE0" strokeWidth="2" />
            <text x="70" y="164" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">ATM SOURCE</text>

            {/* Engines */}
            <rect x="140" y="140" width="100" height="40" rx="6" fill="#1D2D45" stroke="#19A7A0" strokeWidth="2" />
            <text x="190" y="164" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">VALIDATION</text>

            <rect x="260" y="140" width="100" height="40" rx="6" fill="#1D2D45" stroke="#19A7A0" strokeWidth="2" />
            <text x="310" y="164" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">CLASSIFY</text>

            <rect x="380" y="140" width="100" height="40" rx="6" fill="#1D2D45" stroke="#19A7A0" strokeWidth="2" />
            <text x="430" y="164" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">ROUTER</text>

            {/* Security Direct Desk (Rule 11) */}
            <rect x="510" y="22" width="120" height="36" rx="6" fill="#1D2D45" stroke="#E05252" strokeWidth="2" />
            <text x="570" y="44" fill="#E05252" fontSize="10.5" fontWeight="700" textAnchor="middle">SECURITY DESK</text>
            <rect x="670" y="22" width="130" height="36" rx="6" fill="#1D2D45" stroke="#E05252" strokeWidth="1.5" />
            <text x="735" y="44" fill="#FFFFFF" fontSize="10.5" fontWeight="600" textAnchor="middle">EMP-SEC-01</text>

            {/* Regional Zone Nodes */}
            <rect x="510" y="82" width="110" height="32" rx="4" fill="#1D2D45" stroke="#19A7A0" strokeWidth="1.5" />
            <text x="565" y="102" fill="#FFFFFF" fontSize="10.5" fontWeight="600" textAnchor="middle">Bangalore Support</text>
            <rect x="670" y="82" width="130" height="32" rx="4" fill="#1D2D45" stroke="rgba(255,255,255,0.2)" />
            <text x="735" y="102" fill="var(--text-secondary)" fontSize="10.5" textAnchor="middle">EMP-BLR-01/03</text>

            <rect x="510" y="127" width="110" height="32" rx="4" fill="#1D2D45" stroke="#4D8DE0" strokeWidth="1.5" />
            <text x="565" y="147" fill="#FFFFFF" fontSize="10.5" fontWeight="600" textAnchor="middle">Mysore Support</text>
            <rect x="670" y="127" width="130" height="32" rx="4" fill="#1D2D45" stroke="rgba(255,255,255,0.2)" />
            <text x="735" y="147" fill="var(--text-secondary)" fontSize="10.5" textAnchor="middle">EMP-MYS-01/02</text>

            <rect x="510" y="172" width="110" height="32" rx="4" fill="#1D2D45" stroke="#25A879" strokeWidth="1.5" />
            <text x="565" y="192" fill="#FFFFFF" fontSize="10.5" fontWeight="600" textAnchor="middle">Mangaluru Support</text>
            <rect x="670" y="172" width="130" height="32" rx="4" fill="#1D2D45" stroke="rgba(255,255,255,0.2)" />
            <text x="735" y="192" fill="var(--text-secondary)" fontSize="10.5" textAnchor="middle">EMP-MNG-01/02</text>

            <rect x="510" y="217" width="110" height="32" rx="4" fill="#1D2D45" stroke="#E9A23B" strokeWidth="1.5" />
            <text x="565" y="237" fill="#FFFFFF" fontSize="10.5" fontWeight="600" textAnchor="middle">Hubballi Support</text>
            <rect x="670" y="217" width="130" height="32" rx="4" fill="#1D2D45" stroke="rgba(255,255,255,0.2)" />
            <text x="735" y="237" fill="var(--text-secondary)" fontSize="10.5" textAnchor="middle">EMP-HUB-01/02</text>

            {/* Central Routing Review Fallback */}
            <rect x="510" y="282" width="120" height="34" rx="4" fill="#1D2D45" stroke="#FB7185" strokeWidth="1.5" />
            <text x="570" y="303" fill="#FB7185" fontSize="10" fontWeight="600" textAnchor="middle">Routing Review</text>
            <rect x="670" y="282" width="130" height="34" rx="4" fill="#1D2D45" stroke="rgba(255,255,255,0.2)" />
            <text x="735" y="303" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">EMP-REV-01</text>
          </svg>
        </div>
      </div>

      {/* Karnataka Regional Routing Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Karnataka Regional Routing Table (Part B Configuration)</span>
          </div>
          <button
            onClick={() => {
              setPrefixForm({ prefix: '', zone_id: 1, primary_team: 'Bangalore Support', backup_team: 'Bangalore Backup', escalation_authority: 'Bangalore Regional Manager' });
              setEditingPrefix(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Add Prefix Mapping</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ATM Prefix</th>
                <th>Assigned Zone</th>
                <th>Headquarter City</th>
                <th>Primary Regional Team</th>
                <th>Secondary Backup Team</th>
                <th>Escalation Authority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routingTable.map((row) => (
                <tr key={row.prefix}>
                  <td><span className="code-pill" style={{ fontWeight: 700 }}>{row.prefix}</span></td>
                  <td><strong style={{ color: 'var(--accent-primary)' }}>{row.zone_name}</strong></td>
                  <td>{row.city}</td>
                  <td>{row.primary_team}</td>
                  <td>{row.backup_team}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.escalation_authority}</td>
                  <td><span className="badge badge-status-resolved">ACTIVE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Prefix Modal */}
      {editingPrefix && (
        <div className="modal-overlay" onClick={() => setEditingPrefix(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Add / Modify ATM Prefix Mapping
            </h3>
            <form onSubmit={handleSavePrefix}>
              <div className="form-group">
                <label className="form-label">ATM 3-Letter Prefix *</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  placeholder="e.g. BLR"
                  value={prefixForm.prefix}
                  onChange={e => setPrefixForm({ ...prefixForm, prefix: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Regional Support Zone *</label>
                <select
                  value={prefixForm.zone_id}
                  onChange={e => setPrefixForm({ ...prefixForm, zone_id: parseInt(e.target.value) })}
                  className="form-select"
                >
                  <option value={1}>Bangalore (Zone 1)</option>
                  <option value={2}>Mysore (Zone 2)</option>
                  <option value={3}>Mangaluru (Zone 3)</option>
                  <option value={4}>Hubballi (Zone 4)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Regional Support Team *</label>
                <input
                  type="text"
                  required
                  value={prefixForm.primary_team}
                  onChange={e => setPrefixForm({ ...prefixForm, primary_team: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Backup Team *</label>
                <input
                  type="text"
                  required
                  value={prefixForm.backup_team}
                  onChange={e => setPrefixForm({ ...prefixForm, backup_team: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Escalation Authority</label>
                <input
                  type="text"
                  value={prefixForm.escalation_authority}
                  onChange={e => setPrefixForm({ ...prefixForm, escalation_authority: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingPrefix(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingPrefix} className="btn btn-primary">
                  {savingPrefix ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Mapping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

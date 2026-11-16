import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight, 
  RefreshCw,
  MapPin,
  Cpu,
  Wifi,
  Shield,
  Layers
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';

const CATEGORY_COLORS = {
  'Hardware': '#3B82F6',
  'Network': '#10B981',
  'Cash-Handling': '#F59E0B',
  'Software': '#8B5CF6',
  'Security': '#EF4444'
};

const REGION_COLORS = {
  'Bangalore': '#19A7A0',
  'Mysore': '#4D8DE0',
  'Mangaluru': '#25A879',
  'Hubballi': '#E9A23B'
};

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData, reportsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAnalytics(),
        api.getReports()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setRecentReports(reportsData.slice(0, 7));
      setCriticalAlerts(reportsData.filter(r => r.priority?.includes('P1') || r.category === 'Security' && r.status !== 'Resolved').slice(0, 4));
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper">
      {/* Top Banner / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Karnataka ATM Network Operations Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Real-time incident dispatching, Bellman-Ford shortest-path routing, and DFA verification
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link to="/submit" className="btn btn-primary btn-sm">
            <span>+ Submit ATM Error</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-secondary)' }}>
          <div className="kpi-label">
            <span>Total Reports</span>
            <FileText size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.total_reports : '--'}</div>
          <div className="kpi-subtext">Across 4 regional zones</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#E9A23B' }}>
          <div className="kpi-label">
            <span>Pending Review</span>
            <Clock size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.pending : '--'}</div>
          <div className="kpi-subtext">Awaiting handler allocation</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#4D8DE0' }}>
          <div className="kpi-label">
            <span>Assigned</span>
            <UserCheck size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.assigned : '--'}</div>
          <div className="kpi-subtext">Dispatched to regional team</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#C084FC' }}>
          <div className="kpi-label">
            <span>In Progress</span>
            <Activity size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.in_progress : '--'}</div>
          <div className="kpi-subtext">Technician resolving onsite</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-success)' }}>
          <div className="kpi-label">
            <span>Resolved</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.resolved : '--'}</div>
          <div className="kpi-subtext">Normal operations restored</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-critical)' }}>
          <div className="kpi-label">
            <span>Critical / Security</span>
            <ShieldAlert size={16} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-critical)' }}>
            {stats ? stats.critical_incidents : '--'}
          </div>
          <div className="kpi-subtext">P1 &amp; Security desk alerts</div>
        </div>
      </div>

      {/* Critical Alerts Panel (Component F) */}
      {criticalAlerts.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(224, 82, 82, 0.4)', background: 'linear-gradient(180deg, rgba(224, 82, 82, 0.08) 0%, var(--bg-card) 100%)' }}>
          <div className="card-header" style={{ borderBottomColor: 'rgba(224, 82, 82, 0.2)' }}>
            <div className="card-title" style={{ color: 'var(--color-critical)' }}>
              <ShieldAlert size={18} />
              <span>ACTIVE CRITICAL INCIDENTS &amp; SECURITY PROTOCOLS</span>
            </div>
            <Link to="/incidents?priority=P1" style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}>
              View all critical &rarr;
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {criticalAlerts.map(alert => (
              <div key={alert.report_id} style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(224, 82, 82, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="code-pill">{alert.report_id}</span>
                  <PriorityBadge priority={alert.priority} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {alert.atm_id} • {alert.branch}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {alert.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Dest: <strong style={{ color: 'var(--text-primary)' }}>{alert.routing_destination}</strong></span>
                  <StatusBadge status={alert.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Component A: Incident Activity Over Time */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Incident Activity Timeline</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Today', '7 Days', '30 Days'].map((filter, i) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter.toLowerCase())}
                  className={`btn btn-sm ${timeFilter === filter.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {analytics?.timeline && analytics.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reports" 
                    name="Incidents Reported" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3} 
                    dot={{ fill: 'var(--accent-primary)', r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No activity data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Component B: Regional Incident Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={16} style={{ color: 'var(--accent-secondary)' }} />
              <span>Regional Zone Breakdown</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 Support Zones</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {analytics?.reports_by_region ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.reports_by_region}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="zone" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
                    {analytics.reports_by_region.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.zone] || 'var(--accent-primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Component C & D: Category and Priority Breakdown */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Component C: Category Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={16} style={{ color: '#10B981' }} />
              <span>Five-Category Distribution</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BCS503 Taxonomy</span>
          </div>
          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center' }}>
            {analytics?.reports_by_category ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.reports_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.reports_by_category.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[entry.name] || '#38BDF8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Component D: Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={16} style={{ color: '#E9A23B' }} />
              <span>Priority Levels</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>P1 to P4 Queue</span>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            {analytics?.priority_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.priority_distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="priority" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                    {analytics.priority_distribution.map((entry, index) => {
                      const p = entry.priority || '';
                      const color = p.includes('P1') ? 'var(--color-critical)' :
                                    p.includes('P2') ? 'var(--color-warning)' :
                                    p.includes('P3') ? 'var(--accent-secondary)' : '#94A3B8';
                      return <Cell key={`prio-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Component E: Recent Incident Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Recent Incident Stream</span>
          </div>
          <Link to="/incidents" className="btn btn-secondary btn-sm">
            <span>View All Incidents</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>ATM ID</th>
                <th>Error Code</th>
                <th>Category</th>
                <th>Zone</th>
                <th>Priority</th>
                <th>Assigned Handler</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.length > 0 ? (
                recentReports.map(rep => (
                  <tr key={rep.report_id}>
                    <td>
                      <span className="code-pill">{rep.report_id}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{rep.atm_id}</td>
                    <td><span className="code-pill" style={{ color: 'var(--accent-primary)' }}>{rep.error_code}</span></td>
                    <td><CategoryBadge category={rep.category} /></td>
                    <td><span style={{ fontWeight: 500 }}>{rep.zone_name}</span></td>
                    <td><PriorityBadge priority={rep.priority} /></td>
                    <td style={{ fontSize: '12px' }}>{rep.assigned_handler || 'Waiting Queue'}</td>
                    <td><StatusBadge status={rep.status} /></td>
                    <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{rep.created_at}</td>
                    <td>
                      <Link to={`/incidents?search=${rep.report_id}`} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px' }}>
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No incident reports logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component G: System Dispatch Workflow Blueprint */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Automated Incident Dispatch Architecture (Karnataka Grid)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '10px 0' }}>
          {[
            { step: '1', title: 'ATM Ingestion', desc: 'ATMBLR1234 + E31C' },
            { step: '2', title: 'DFA Validation', desc: 'q0 to q10 & s0 to s4' },
            { step: '3', title: 'Regex Equivalence', desc: 'L(M) == L(R) check' },
            { step: '4', title: '5-Category Classify', desc: 'Hardware, Net, Cash, Soft, Sec' },
            { step: '5', title: 'Prefix Extraction', desc: 'Extract BLR, MYS, MNG, HUB' },
            { step: '6', title: 'Bellman-Ford', desc: 'Lowest-cost dispatch route' },
            { step: '7', title: 'Handler Allocation', desc: 'Primary -> Backup -> Queue' },
            { step: '8', title: 'SQLite Audit Trail', desc: 'Status tracking to Resolved' },
          ].map((item, idx) => (
            <div key={item.step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  STEP {item.step}
                </div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
              {idx < 7 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Layers,
  Filter
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../api';

const CATEGORY_COLORS = {
  'Hardware': '#3B82F6',
  'Network': '#10B981',
  'Cash-Handling': '#F59E0B',
  'Software': '#8B5CF6',
  'Security': '#EF4444'
};

const ZONE_COLORS = {
  'Bangalore': '#19A7A0',
  'Mysore': '#4D8DE0',
  'Mangaluru': '#25A879',
  'Hubballi': '#E9A23B'
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, statsData] = await Promise.all([
        api.getAnalytics(),
        api.getDashboardStats()
      ]);
      setAnalytics(analyticsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mostAffectedZone = analytics?.reports_by_region?.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), { zone: 'Bangalore', count: 0 });
  const mostCommonCategory = analytics?.reports_by_category?.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), { name: 'Hardware', value: 0 });

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analytics &amp; Operational Reports
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Live analytical insights, resolution rates, regional load distribution, and category telemetry
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Analytics KPI Summary Cards (Section 17) */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-primary)' }}>
          <div className="kpi-label">
            <span>Total Logged</span>
            <Layers size={16} />
          </div>
          <div className="kpi-value">{stats ? stats.total_reports : '--'}</div>
          <div className="kpi-subtext">Total historical ATM incidents</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-success)' }}>
          <div className="kpi-label">
            <span>Resolution Rate</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
            {analytics ? `${analytics.resolution_rate}%` : '--'}
          </div>
          <div className="kpi-subtext">{stats ? `${stats.resolved} of ${stats.total_reports} resolved` : ''}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-secondary)' }}>
          <div className="kpi-label">
            <span>Avg Resolution Time</span>
            <Clock size={16} />
          </div>
          <div className="kpi-value">{analytics ? `${analytics.avg_resolution_hours}h` : '--'}</div>
          <div className="kpi-subtext">Mean time to repair (MTTR)</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#E9A23B' }}>
          <div className="kpi-label">
            <span>Most Affected Zone</span>
            <MapPin size={16} />
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '6px' }}>
            {mostAffectedZone?.zone || 'Bangalore'}
          </div>
          <div className="kpi-subtext">{mostAffectedZone?.count || 0} incidents recorded</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#8B5CF6' }}>
          <div className="kpi-label">
            <span>Top Category</span>
            <BarChart3 size={16} />
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '6px' }}>
            {mostCommonCategory?.name || 'Cash-Handling'}
          </div>
          <div className="kpi-subtext">{mostCommonCategory?.value || 0} incidents recorded</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-critical)' }}>
          <div className="kpi-label">
            <span>Critical Incidents</span>
            <ShieldAlert size={16} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-critical)' }}>
            {stats ? stats.critical_incidents : '--'}
          </div>
          <div className="kpi-subtext">Immediate escalation required</div>
        </div>
      </div>

      {/* Row 1: Zone-wise distribution & Category-wise distribution */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Chart 1: Zone-wise incident distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Zone-Wise Incident Distribution</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Karnataka 4 Regions</span>
          </div>
          <div style={{ height: '260px' }}>
            {analytics?.reports_by_region ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.reports_by_region}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="zone" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                    {analytics.reports_by_region.map((entry, index) => (
                      <Cell key={`zone-cell-${index}`} fill={ZONE_COLORS[entry.zone] || 'var(--accent-primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Chart 2: Category-wise distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <PieIcon size={16} style={{ color: '#10B981' }} />
              <span>Category-Wise Telemetry Distribution</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>5 System Categories</span>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center' }}>
            {analytics?.reports_by_category ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.reports_by_category}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.reports_by_category.map((entry, index) => (
                      <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#38BDF8'} />
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
      </div>

      {/* Row 2: Daily Incident Trends & Priority Distribution */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Chart 4: Daily Incident Trends */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Daily Incident Volume Trend</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Timeline Telemetry</span>
          </div>
          <div style={{ height: '260px' }}>
            {analytics?.timeline ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reports" 
                    name="Daily Reports" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3} 
                    dot={{ fill: 'var(--accent-primary)', r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Chart 3: Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={16} style={{ color: 'var(--color-critical)' }} />
              <span>Priority Level Distribution (P1 to P4)</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deterministic Queue</span>
          </div>
          <div style={{ height: '260px' }}>
            {analytics?.priority_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.priority_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="priority" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                    {analytics.priority_distribution.map((entry, index) => {
                      const p = entry.priority || '';
                      const color = p.includes('P1') ? 'var(--color-critical)' :
                                    p.includes('P2') ? 'var(--color-warning)' :
                                    p.includes('P3') ? 'var(--accent-secondary)' : '#94A3B8';
                      return <Cell key={`p-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Row 3: Handler Workload Capacity vs Current Load */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={16} style={{ color: 'var(--accent-secondary)' }} />
            <span>Regional Handler Workload vs Maximum Capacity</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacity Balancing &amp; Queue Management</span>
        </div>
        <div style={{ height: '280px' }}>
          {analytics?.handler_workload ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.handler_workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="load" name="Current Active Load" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Maximum Capacity" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  AlertCircle, 
  Binary, 
  Network, 
  Users, 
  BarChart3, 
  FlaskConical, 
  ScrollText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/submit', label: 'Submit Error Report', icon: FilePlus },
    { to: '/incidents', label: 'Incident Management', icon: AlertCircle },
    { to: '/automata-lab', label: 'Automata Lab (DFA)', icon: Binary },
    { to: '/routing', label: 'Network Routing & Dispatch', icon: Network },
    { to: '/handlers', label: 'Handler Management', icon: Users },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/testing', label: 'Testing Console', icon: FlaskConical },
    { to: '/logs', label: 'System Logs', icon: ScrollText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #19A7A0, #4D8DE0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontSize: '15px'
            }}>
              CC
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', letterSpacing: '0.4px' }}>
                ATM COMMAND
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                KARNATAKA NOC
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px', minWidth: '32px', borderRadius: '6px' }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ minWidth: '18px' }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span className="status-pulse"></span>
            <span style={{ fontWeight: 600 }}>Active Grid: 4 Zones</span>
          </div>
          <div>Bangalore • Mysore • Mangaluru • Hubballi</div>
          <div style={{ marginTop: '4px', fontSize: '10px' }}>BCS503 / BCS502 Full-Stack</div>
        </div>
      )}
    </aside>
  );
}

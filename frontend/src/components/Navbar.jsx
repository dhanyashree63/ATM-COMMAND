import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilePlus, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Radio, 
  Activity, 
  UserCheck 
} from 'lucide-react';

export default function Navbar({ theme, toggleTheme, stats }) {
  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.2px' }}>
            ATM COMMAND CENTER
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Intelligent ATM Incident Management &amp; Dispatch Platform
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: 'rgba(37, 168, 121, 0.1)',
          border: '1px solid rgba(37, 168, 121, 0.25)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--color-success)'
        }}>
          <span className="status-pulse"></span>
          <span>ONLINE • KARNATAKA SUPPORT GRID</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {stats && stats.critical_incidents > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-critical-bg)',
            color: 'var(--color-critical)',
            border: '1px solid rgba(224, 82, 82, 0.4)',
            fontSize: '11.5px',
            fontWeight: 700
          }}>
            <ShieldAlert size={15} />
            <span>{stats.critical_incidents} CRITICAL / SECURITY</span>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <Link to="/submit" className="btn btn-primary btn-sm">
          <FilePlus size={15} />
          <span>Submit Error</span>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-color)',
          fontSize: '12px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700
          }}>
            A
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>Ops Admin</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Central NOC</div>
          </div>
        </div>
      </div>
    </header>
  );
}

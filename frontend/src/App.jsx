import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import SubmitReport from './pages/SubmitReport';
import IncidentManagement from './pages/IncidentManagement';
import AutomataLab from './pages/AutomataLab';
import NetworkRouting from './pages/NetworkRouting';
import HandlerManagement from './pages/HandlerManagement';
import Analytics from './pages/Analytics';
import TestingConsole from './pages/TestingConsole';
import SystemLogs from './pages/SystemLogs';
import Settings from './pages/Settings';
import { api } from './api';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [dashboardStats, setDashboardStats] = useState(null);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  };

  useEffect(() => {
    // Poll stats periodically for top alert pill
    const loadStats = async () => {
      try {
        const stats = await api.getDashboardStats();
        setDashboardStats(stats);
      } catch (e) {
        // quiet fail
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HashRouter>
      <div className="app-container">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="main-content">
          <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            stats={dashboardStats} 
          />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/submit" element={<SubmitReport />} />
              <Route path="/incidents" element={<IncidentManagement />} />
              <Route path="/automata-lab" element={<AutomataLab />} />
              <Route path="/routing" element={<NetworkRouting />} />
              <Route path="/handlers" element={<HandlerManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/testing" element={<TestingConsole />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

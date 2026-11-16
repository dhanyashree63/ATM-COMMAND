import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Layers,
  Filter,
  Search
} from 'lucide-react';
import { api } from '../api';

export default function TestingConsole() {
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'PASS', 'FAIL'
  const [searchQuery, setSearchQuery] = useState('');

  const executeAllTests = async () => {
    try {
      setRunning(true);
      const res = await api.runTests();
      setTestResults(res);
    } catch (err) {
      alert("Test suite execution failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const filteredTests = testResults?.tests ? testResults.tests.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) : [];

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Automated Testing Console (28 Test Cases)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Real-time execution of BCS503 &amp; BCS502 test suite covering DFA validation, Bellman-Ford routing, and capacity constraints
          </p>
        </div>

        <button 
          onClick={executeAllTests}
          disabled={running}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontWeight: 600 }}
        >
          {running ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          <span>{running ? "Executing Suite..." : "Run All 28 Tests"}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-secondary)' }}>
          <div className="kpi-label">
            <span>Total Test Cases</span>
            <Layers size={16} />
          </div>
          <div className="kpi-value">{testResults ? testResults.total : 28}</div>
          <div className="kpi-subtext">BCS503 &amp; BCS502 Test Suite</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-success)' }}>
          <div className="kpi-label">
            <span>Tests Passed</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
            {testResults ? testResults.passed : '--'}
          </div>
          <div className="kpi-subtext">Verification successful</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-critical)' }}>
          <div className="kpi-label">
            <span>Tests Failed</span>
            <XCircle size={16} />
          </div>
          <div className="kpi-value" style={{ color: testResults?.failed > 0 ? 'var(--color-critical)' : 'var(--text-muted)' }}>
            {testResults ? testResults.failed : '--'}
          </div>
          <div className="kpi-subtext">Zero failures tolerated</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-primary)' }}>
          <div className="kpi-label">
            <span>Pass Rate</span>
            <ShieldCheck size={16} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>
            {testResults ? `${testResults.pass_rate}%` : '--'}
          </div>
          <div className="kpi-subtext">Last Run: {testResults ? testResults.timestamp : 'Not executed yet'}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Status:</span>
          {['ALL', 'PASS', 'FAIL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '260px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search test descriptions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Test Results Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th style={{ width: '220px' }}>Test Case Name</th>
                <th>Scenario Description</th>
                <th style={{ width: '220px' }}>Expected Outcome</th>
                <th style={{ width: '220px' }}>Actual Outcome</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length > 0 ? (
                filteredTests.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="code-pill">#{t.id.toString().padStart(2, '0')}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.description}</td>
                    <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {t.expected}
                    </td>
                    <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: t.status === 'PASS' ? 'var(--color-success)' : 'var(--color-critical)' }}>
                      {t.actual}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${t.status === 'PASS' ? 'badge-status-resolved' : 'badge-p1'}`}>
                        {t.status === 'PASS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {running ? (
                      <div>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--accent-primary)' }} />
                        <div>Executing 28 automated test scenarios...</div>
                      </div>
                    ) : (
                      <div>
                        <FlaskConical size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                        <div>Click "Run All 28 Tests" to execute the full academic test harness.</div>
                      </div>
                    )}
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

/**
 * ATM COMMAND CENTER - API Client
 * Centralized client with automatic fallback to client-side engine (localEngine)
 * when running on GitHack, GitHub Pages, or without the Python Flask server.
 */

import { localEngine } from './localEngine';

const BASE_URL = '/api';

let backendState = null; // null = unknown, true = Flask online, false = standalone mode
let healthCheckPromise = null;

async function isFlaskAvailable() {
  if (backendState !== null) return backendState;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    const proto = window.location.protocol || '';
    if (
      proto === 'file:' ||
      host.includes('githack.com') ||
      host.includes('github.io') ||
      host.includes('githubusercontent.com')
    ) {
      backendState = false;
      return false;
    }
  }

  if (!healthCheckPromise) {
    healthCheckPromise = (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            backendState = true;
            return true;
          }
        }
      } catch (e) {
        // Backend offline -> use standalone browser engine
      }
      backendState = false;
      return false;
    })();
  }
  return healthCheckPromise;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function callWithFallback(remoteCall, localCall) {
  const useFlask = await isFlaskAvailable();
  if (!useFlask) {
    return localCall();
  }
  try {
    return await remoteCall();
  } catch (err) {
    // If it's an intentional HTTP validation error from Flask (400/404/422), rethrow it
    if (err && err.status) {
      throw err;
    }
    // Network drop -> fallback to standalone engine
    backendState = false;
    return localCall();
  }
}

export const api = {
  // Health check
  checkHealth: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/health`).then(handleResponse),
      () => localEngine.checkHealth()
    ),

  // Dashboard Stats
  getDashboardStats: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/dashboard/stats`).then(handleResponse),
      () => localEngine.getDashboardStats()
    ),

  // Reports
  getReports: (params = {}) =>
    callWithFallback(
      () => {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.category) query.append('category', params.category);
        if (params.priority) query.append('priority', params.priority);
        if (params.zone) query.append('zone', params.zone);
        if (params.search) query.append('search', params.search);
        return fetch(`${BASE_URL}/reports?${query.toString()}`).then(handleResponse);
      },
      () => localEngine.getReports(params)
    ),

  getReportDetail: (id) =>
    callWithFallback(
      () => fetch(`${BASE_URL}/reports/${id}`).then(handleResponse),
      () => localEngine.getReportDetail(id)
    ),

  submitReport: (reportData) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        }).then(handleResponse),
      () => localEngine.submitReport(reportData)
    ),

  updateReportStatus: (id, payload) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/reports/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(handleResponse),
      () => localEngine.updateReportStatus(id, payload)
    ),

  // Live Validation
  liveValidate: (data) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/validate/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(handleResponse),
      () => localEngine.liveValidate(data)
    ),

  // Handlers
  getHandlers: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/handlers`).then(handleResponse),
      () => localEngine.getHandlers()
    ),

  addHandler: (data) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/handlers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(handleResponse),
      () => localEngine.addHandler(data)
    ),

  updateHandler: (employeeId, data) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/handlers/${employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(handleResponse),
      () => localEngine.updateHandler(employeeId, data)
    ),

  deleteHandler: (employeeId) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/handlers/${employeeId}`, {
          method: 'DELETE',
        }).then(handleResponse),
      () => localEngine.deleteHandler(employeeId)
    ),

  // Routing & Topology
  getRoutingTable: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/routing/table`).then(handleResponse),
      () => localEngine.getRoutingTable()
    ),

  updateRoutingPrefix: (data) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/routing/table`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(handleResponse),
      () => localEngine.updateRoutingPrefix(data)
    ),

  getNetworkTopology: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/routing/network`).then(handleResponse),
      () => localEngine.getNetworkTopology()
    ),

  updateEdgeWeight: (edgeId, weight) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/routing/edges/${edgeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight }),
        }).then(handleResponse),
      () => localEngine.updateEdgeWeight(edgeId, weight)
    ),

  calculateBellmanFord: (payload) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/routing/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(handleResponse),
      () => localEngine.calculateBellmanFord(payload)
    ),

  // Analytics
  getAnalytics: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/analytics`).then(handleResponse),
      () => localEngine.getAnalytics()
    ),

  // Mappings & Logs
  getErrorMappings: () =>
    callWithFallback(
      () => fetch(`${BASE_URL}/mappings`).then(handleResponse),
      () => localEngine.getErrorMappings()
    ),

  addErrorMapping: (data) =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/mappings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(handleResponse),
      () => localEngine.addErrorMapping(data)
    ),

  getSystemLogs: (limit = 50) =>
    callWithFallback(
      () => fetch(`${BASE_URL}/logs?limit=${limit}`).then(handleResponse),
      () => localEngine.getSystemLogs(limit)
    ),

  // Automated Testing
  runTests: () =>
    callWithFallback(
      () =>
        fetch(`${BASE_URL}/tests/run`, {
          method: 'POST',
        }).then(handleResponse),
      () => localEngine.runTests()
    ),
};

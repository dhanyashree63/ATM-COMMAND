-- ATM COMMAND CENTER
-- Intelligent ATM Incident Management & Dispatch Platform
-- SQLite Database Schema

CREATE TABLE IF NOT EXISTS USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator' -- 'admin', 'operator', 'handler'
);

CREATE TABLE IF NOT EXISTS ZONES (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_name TEXT NOT NULL UNIQUE, -- 'Bangalore', 'Mysore', 'Mangaluru', 'Hubballi'
    city TEXT NOT NULL,
    region TEXT NOT NULL,           -- 'South Karnataka', 'Coastal Karnataka', 'North Karnataka'
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ROUTING_TABLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prefix TEXT NOT NULL UNIQUE,   -- 'BLR', 'BNG', 'MYS', 'MNG', 'MLR', 'HUB'
    zone_id INTEGER NOT NULL,
    primary_team TEXT NOT NULL,
    backup_team TEXT NOT NULL,
    escalation_authority TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (zone_id) REFERENCES ZONES(id)
);

CREATE TABLE IF NOT EXISTS HANDLERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL, -- e.g. 'EMP-BLR-01'
    name TEXT NOT NULL,
    team TEXT NOT NULL,               -- e.g. 'Bangalore Support', 'Bangalore Backup', 'Central Security Desk'
    zone TEXT NOT NULL,               -- 'Bangalore', 'Mysore', 'Mangaluru', 'Hubballi', 'Central'
    supported_categories TEXT NOT NULL,
    availability INTEGER NOT NULL DEFAULT 1, -- 1 = Available, 0 = Unavailable
    capacity INTEGER NOT NULL DEFAULT 5,
    current_load INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ERROR_CODE_MAPPINGS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_code TEXT UNIQUE NOT NULL,  -- e.g. 'E12H', 'E25N', 'E31C', 'E45S', 'E90X'
    category TEXT NOT NULL,           -- 'Hardware', 'Network', 'Cash-Handling', 'Software', 'Security'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ATM_REPORTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT UNIQUE NOT NULL,   -- e.g. 'REP-100234'
    reporter_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    atm_id TEXT NOT NULL,
    error_code TEXT NOT NULL,
    description TEXT NOT NULL,
    urgency TEXT NOT NULL,            -- 'Low', 'Medium', 'High', 'Critical'
    category TEXT NOT NULL,           -- 'Hardware', 'Network', 'Cash-Handling', 'Software', 'Security', 'UNMAPPED'
    classification_reason TEXT NOT NULL,
    dfa_result TEXT NOT NULL,
    regex_result TEXT NOT NULL,
    validation_status TEXT NOT NULL,  -- 'PASSED', 'FAILED'
    priority TEXT NOT NULL,           -- 'P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'
    zone_id INTEGER,
    zone_name TEXT,                   -- 'Bangalore', 'Mysore', 'Mangaluru', 'Hubballi', 'Central', 'Unassigned'
    routing_destination TEXT,         -- 'Bangalore Support', 'Central Security Desk', 'Central Routing Review', etc.
    assigned_handler TEXT,            -- Employee ID or Handler Name
    assigned_team TEXT,
    route TEXT,                       -- Calculated route string
    route_cost REAL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Pending Manual Correction'
    resolution_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES ZONES(id)
);

CREATE TABLE IF NOT EXISTS ASSIGNMENTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id TEXT UNIQUE NOT NULL,
    report_id TEXT NOT NULL,
    handler_id TEXT NOT NULL,
    team TEXT NOT NULL,
    route TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Reassigned', 'Cancelled'
    assigned_at TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES ATM_REPORTS(report_id)
);

CREATE TABLE IF NOT EXISTS REPORT_HISTORY (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    notes TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES ATM_REPORTS(report_id)
);

CREATE TABLE IF NOT EXISTS NETWORK_NODES (
    node_id TEXT PRIMARY KEY,
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL, -- 'atm', 'zone', 'support_team', 'depot', 'handler', 'central_desk', 'escalation'
    zone TEXT
);

CREATE TABLE IF NOT EXISTS NETWORK_EDGES (
    edge_id TEXT PRIMARY KEY,
    source_node TEXT NOT NULL,
    destination_node TEXT NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY (source_node) REFERENCES NETWORK_NODES(node_id),
    FOREIGN KEY (destination_node) REFERENCES NETWORK_NODES(node_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_atm_reports_status ON ATM_REPORTS(status);
CREATE INDEX IF NOT EXISTS idx_atm_reports_priority ON ATM_REPORTS(priority);
CREATE INDEX IF NOT EXISTS idx_atm_reports_zone ON ATM_REPORTS(zone_name);
CREATE INDEX IF NOT EXISTS idx_atm_reports_created ON ATM_REPORTS(created_at);
CREATE INDEX IF NOT EXISTS idx_handlers_team ON HANDLERS(team);
CREATE INDEX IF NOT EXISTS idx_handlers_zone ON HANDLERS(zone);
CREATE INDEX IF NOT EXISTS idx_assignments_rep ON ASSIGNMENTS(report_id);

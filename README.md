# ATM COMMAND CENTER
## Intelligent ATM Incident Management & Dispatch Platform
### Academic Full-Stack Engineering Project integrating BCS503 & BCS502

---

## 1. Executive Summary & Objective

**ATM Command Center** is an enterprise-grade incident management, validation, routing, and dispatching platform built for banking operations across Karnataka. The platform models the automated lifecycle of an automated teller machine (ATM) hardware, software, network, cash-handling, or security fault:

1. **BCS503 – Automata Theory and Computability**:
   - Formal Deterministic Finite Automaton (DFA) $M_1 = (Q, \Sigma, \delta, q_0, F)$ for 10-character ATM identifiers (`ATM[A-Z]{3}[0-9]{4}`).
   - Formal Deterministic Finite Automaton (DFA) $M_2 = (S, \Sigma, \delta', s_0, F')$ for 4-character Error Codes (`E[0-9]{2}[A-Z]`).
   - Equivalent Regular Expressions ($L(M) = L(R)$) cross-verification and discrepancy rejection.
   - Deterministic 5-category classification engine with documented conflict resolution rules (`Security > Cash-Handling > Hardware > Network > Software`).

2. **BCS502 – Computer Networks**:
   - Dynamic Programming **Bellman-Ford Shortest-Path Algorithm** on weighted directed graph $G = (V, E)$.
   - Real-time iterative edge relaxation ($|V| - 1$ passes) with step-by-step history snapshots.
   - Negative-weight cycle detection and rejection of invalid topologies.
   - Four Karnataka regional support zones:
     - **Bangalore (Zone 1)**: Prefixes `BLR`, `BNG` &rarr; Bangalore Support &amp; Backup
     - **Mysore (Zone 2)**: Prefix `MYS` &rarr; Mysore Support &amp; Backup
     - **Mangaluru (Zone 3)**: Prefixes `MNG`, `MLR` &rarr; Mangaluru Support &amp; Backup
     - **Hubballi (Zone 4)**: Prefix `HUB` &rarr; Hubballi Support &amp; Backup
   - **Security Override Rule**: Bypasses all regional teams directly to the Central Security Desk.
   - **Central Fallback**: Unmapped prefixes routed to Central Routing Review (`Pending Manual Correction`).
   - **Handler Capacity Balancing & Auto-Queue Reassignment Engine**.

---

## 2. Technology Stack & Architecture

```
React.js + Vite Frontend (Control-Room Dark Theme)
       │
       ▼ (REST API / Proxy)
Python Flask Backend (app.py)
       │
       ├─► BCS503 Validation Engine (DFA + Regex Equivalence)
       ├─► BCS503 Classification Engine (5-Category Precedence)
       ├─► BCS502 Routing & Dispatch Engine (Karnataka Regional Table)
       ├─► BCS502 Bellman-Ford Shortest-Path Algorithm (Edge Relaxation)
       └─► SQLite Database (ACID Relational Storage)
```

- **Frontend**: React 19, Vite, React Router, Recharts, Lucide React, Custom Dark/Light Banking Theme.
- **Backend**: Python 3.12, Flask, Flask-CORS.
- **Database**: SQLite3 with foreign keys, transactional integrity, and indexing.
- **Testing**: Automated Python `unittest` / `pytest` test suite covering 28 test scenarios.

---

## 3. Project Directory Structure

```
atm-error-logger-dispatcher/
├── backend/
│   ├── app.py                      # REST API routes and SPA file server
│   ├── algorithms/
│   │   ├── dfa_validator.py        # Formal DFAs for ATM ID & Error Code
│   │   ├── regex_validator.py      # Regex validators and L(M) == L(R) comparator
│   │   ├── classifier.py           # 5-Category classifier & priority calculator
│   │   ├── routing_engine.py       # Karnataka regional prefix routing & dispatch
│   │   ├── bellman_ford.py         # Dynamic programming Bellman-Ford router
│   │   └── queue_manager.py        # Deterministic queue & atomic assignment
│   ├── database/
│   │   ├── schema.sql              # Relational SQLite tables & indices
│   │   ├── db.py                   # SQLite connection & query helpers
│   │   └── seed_data.py            # Karnataka support grid seeding
│   └── tests/
│       └── test_system.py          # 28 automated unit tests (100% pass)
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, Navbar, Badges
│   │   ├── pages/
│   │   │   ├── Overview.jsx        # KPIs, activity charts, regional graphs
│   │   │   ├── SubmitReport.jsx    # Live validation & submission workflow
│   │   │   ├── IncidentManagement.jsx # Full tracking & status updater
│   │   │   ├── AutomataLab.jsx     # Interactive SVG DFA simulator
│   │   │   ├── NetworkRouting.jsx  # Interactive topology & Bellman-Ford runner
│   │   │   ├── HandlerManagement.jsx # Workloads, capacity & availability toggles
│   │   │   ├── Analytics.jsx       # Recharts operational telemetry
│   │   │   ├── TestingConsole.jsx  # In-app 28-test execution harness
│   │   │   ├── SystemLogs.jsx      # Audit event history
│   │   │   └── Settings.jsx        # Error code mappings & prefix config
│   │   ├── api.js                  # Centralized fetch API client
│   │   ├── index.css               # Control-room styling system
│   │   └── App.jsx                 # Client-side router (10 views)
│   ├── package.json
│   └── vite.config.js
├── run_server.py                   # One-click unified runner
└── README.md
```

---

## 4. Academic Specifications

### A. BCS503 – Automata Theory & Computability
- **ATM ID Machine $M_1$**:
  - Alphabet: $\Sigma = \{A-Z, 0-9\}$
  - States: $Q = \{q_0, q_1, q_2, q_3, q_4, q_5, q_6, q_7, q_8, q_9, q_{10}, q_{\text{trap}}\}$
  - Transition Sequence: $q_0 \xrightarrow{'A'} q_1 \xrightarrow{'T'} q_2 \xrightarrow{'M'} q_3 \xrightarrow{[A-Z]} q_4 \xrightarrow{[A-Z]} q_5 \xrightarrow{[A-Z]} q_6 \xrightarrow{[0-9]} q_7 \dots q_{10}$
  - Accepting State: $F = \{q_{10}\}$ (Length must be exactly 10).
- **Error Code Machine $M_2$**:
  - States: $S = \{s_0, s_1, s_2, s_3, s_4, s_{\text{trap}}\}$
  - Transition Sequence: $s_0 \xrightarrow{'E'} s_1 \xrightarrow{[0-9]} s_2 \xrightarrow{[0-9]} s_3 \xrightarrow{[A-Z]} s_4$
  - Accepting State: $F' = \{s_4\}$ (Length must be exactly 4).

### B. BCS502 – Computer Networks (Bellman-Ford Algorithm)
- Evaluates shortest path on weighted directed graph $G = (V, E)$ with $|V| - 1$ edge relaxations.
- Reconstructs predecessor path: $\text{ATM} \to \text{Validation} \to \text{Classification} \to \text{Routing} \to \text{Zone} \to \text{Support Team} \to \text{Handler}$.
- Detects negative-weight cycles and rejects reachable negative cycles.

---

## 5. Quickstart & Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Method 1: Single Unified Server (Recommended)
The Flask backend directly serves the pre-built React application and all REST APIs:

```bash
cd C:\Users\SVpujar\.gemini\antigravity\scratch\atm-error-logger-dispatcher
python run_server.py
```

Open your browser to:
**http://127.0.0.1:5000**

### Method 2: Development Mode with Hot-Reloading

1. Start Flask backend:
```bash
python run_server.py
```

2. In a separate terminal, run Vite dev server:
```bash
cd frontend
npm run dev
```

Open browser to **http://localhost:5173** (API calls are automatically proxied to Flask on port 5000).

---

## 6. Running the 28 Automated Tests

You can execute the test suite in two ways:

1. **Via Command Line (pytest / unittest)**:
```bash
python -m pytest backend/tests/test_system.py
```
*Expected: 28 passed in < 0.5s (100% pass rate).*

2. **Via Web Interface (Testing Console)**:
Navigate to the **Testing Console** tab in the sidebar and click **"Run All 28 Tests"** to observe live step-by-step execution.

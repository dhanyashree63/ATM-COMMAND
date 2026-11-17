# 🏧 ATM Command Center
### Intelligent Automated ATM Incident Management, Validation & Dispatch Platform

An enterprise-grade full-stack platform designed to manage the end-to-end operational lifecycle of Automated Teller Machine (ATM) incidents. The system automates fault ingestion, real-time syntax and structural validation, multi-category classification, intelligent network routing, and workforce capacity balancing.

---

## 🚀 Key Features

### 1. Dual-Engine Real-Time Validation
- **State Machine & Pattern Matching**: Validates 10-character ATM Identifiers (`ATM[A-Z]{3}[0-9]{4}`) and 4-character Error Codes (`E[0-9]{2}[A-Z]`) through parallel deterministic finite automata (DFA) state traversal and regular expressions.
- **Cross-Verification Guarantee**: Guarantees language equivalence between structural models and reject malformed identifiers before dispatch.
- **Live Interactive Lab**: Interactive simulator providing step-by-step visual state transition traces with instant error feedback.

### 2. Intelligent Multi-Category Classifier & Priority Matrix
- **5 Fault Categories**: Accurately classifies incidents into **Security**, **Cash-Handling**, **Hardware**, **Network**, or **Software**.
- **Deterministic Conflict Resolution**: Employs mathematical precedence rules (`Security > Cash-Handling > Hardware > Network > Software`) to resolve multi-signal alerts.
- **Dynamic Priority Allocation**: Computes incident severity levels from **P1 - Critical** to **P4 - Low** based on fault category and branch operational urgency.
- **Strict Exception Handling**: Refuses automated dispatch for unmapped/uncataloged error codes, preventing silent misclassification.

### 3. Shortest-Path Network Routing & Regional Dispatch
- **Bellman-Ford Dynamic Programming Engine**: Calculates optimal, lowest-latency dispatch routes across weighted directed network topologies.
- **Negative-Cycle Detection**: Detects and flags anomalous topology configurations or negative routing loops.
- **Regional Support Hubs**: Automatically routes incidents to designated regional support teams based on ATM location prefixes:
  - **Bangalore Hub**: Prefixes `BLR`, `BNG` $\rightarrow$ Bangalore Support & Secondary Backup
  - **Mysore Hub**: Prefix `MYS` $\rightarrow$ Mysore Support & Secondary Backup
  - **Mangaluru Hub**: Prefixes `MNG`, `MLR` $\rightarrow$ Mangaluru Support & Secondary Backup
  - **Hubballi Hub**: Prefix `HUB` $\rightarrow$ Hubballi Support & Secondary Backup
- **Emergency Security Protocol**: Security incidents immediately bypass regional teams directly to the **Central Security Desk**.
- **Fallback Handling**: Unmapped location prefixes route to a **Central Routing Review** queue with status `Pending Manual Correction`.

### 4. Workforce Management & Auto-Queue Balancer
- **Real-Time Capacity Balancing**: Tracks active workloads per support engineer against configurable capacity limits.
- **Automated Spillover to Backup**: Automatically routes incidents to designated secondary backup teams when primary teams are at capacity or unavailable.
- **Deterministic Priority Queue**: Manages backlogged tickets strictly ordered by priority ($P_1 > P_2 > P_3 > P_4$) and timestamp.
- **Auto-Reassignment Engine**: Automatically scans and reallocates pending tickets the moment engineer capacity is freed upon incident resolution.

### 5. Analytics, Reporting & Audit Trail
- **Operations Dashboard**: Real-time KPI summary tracking active, pending, assigned, and resolved incidents.
- **Interactive Visual Telemetry**: Regional distribution charts, category breakdowns, daily timeline velocity, and technician capacity graphs.
- **Complete Audit Trail**: Immutable historical event log capturing all state changes, timestamps, and actor notes from submission to resolution.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, JavaScript (ES6+), React Router (HashRouter), Custom Banking Control-Room CSS Design System |
| **Data Visualization & Icons** | Recharts (Responsive SVG Charts), Lucide React (Enterprise Icons) |
| **Backend API** | Python 3.10+, Flask, Flask-CORS |
| **Algorithms & Engines** | Bellman-Ford Shortest Path Algorithm, Deterministic Finite Automata (DFA), Regex Pattern Matching Engines |
| **Database & Persistence** | SQLite3 (ACID Relational Storage, Foreign Keys, Indexes), LocalStorage (Client-Side Fallback) |
| **Testing Framework** | Automated Python `pytest` & `unittest` Suite (28 Comprehensive Scenarios), In-Browser Testing Console |

---

## 🏗️ System Architecture & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (React UI / SPA)                        │
│   Dashboard • Ingestion Form • Automata Lab • Routing & Analytics      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ REST API
┌────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION & TAXONOMY LAYER                       │
│   ├── State Transition Machine & Regex Equivalence Verifier            │
│   ├── 5-Category Classifier with Deterministic Conflict Preemption     │
│   └── Priority Calculation Engine (P1 Critical to P4 Low)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Validated Incident Metadata
┌────────────────────────────────────────────────────────────────────────┐
│                       ROUTING & DISPATCH ENGINE                        │
│   ├── Regional Prefix Router (Bangalore, Mysore, Mangaluru, Hubballi)  │
│   ├── Emergency Security Override (Direct to Central Security Desk)    │
│   ├── Bellman-Ford Shortest-Path Graph Solver                          │
│   └── Workforce Capacity Balancer & Dynamic Priority Queue             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DATABASE & AUDIT HISTORY LAYER                      │
│   SQLite3 Relational Storage / Audit Event History                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ATM-COMMAND/
├── backend/
│   ├── algorithms/
│   │   ├── bellman_ford.py        # Bellman-Ford shortest-path algorithm solver
│   │   ├── classifier.py          # 5-Category classifier & conflict resolution rules
│   │   ├── dfa_validator.py       # Formal DFA state machine validators
│   │   ├── queue_manager.py       # Deterministic priority queue & auto-reassignment
│   │   ├── regex_validator.py     # Regex validators & dual-model comparator
│   │   └── routing_engine.py      # Regional prefix routing & dispatch logic
│   ├── database/
│   │   ├── atm_dispatcher.db      # SQLite relational database
│   │   ├── db.py                  # Database connection management & helpers
│   │   ├── schema.sql             # SQL relational table schemas & indices
│   │   └── seed_data.py           # Database initial seeding script
│   ├── tests/
│   │   └── test_system.py         # 28 automated test scenarios
│   └── app.py                     # Flask REST API server
├── frontend/
│   ├── dist/                      # Standalone production distribution
│   ├── src/
│   │   ├── components/            # Header, Sidebar, Badges
│   │   ├── pages/
│   │   │   ├── Analytics.jsx      # Telemetry graphs & operational charts
│   │   │   ├── AutomataLab.jsx    # Visual DFA state transition simulator
│   │   │   ├── HandlerManagement.jsx # Engineer workloads & capacity toggles
│   │   │   ├── IncidentManagement.jsx# Ticket tracker & resolution console
│   │   │   ├── NetworkRouting.jsx # Interactive graph & Bellman-Ford runner
│   │   │   ├── Overview.jsx       # Real-time NOC control dashboard
│   │   │   ├── Settings.jsx       # Error code taxonomy & prefix configuration
│   │   │   ├── SubmitReport.jsx   # Live validation form & submission engine
│   │   │   ├── SystemLogs.jsx     # Audit event history log
│   │   │   └── TestingConsole.jsx # In-app 28-test execution harness
│   │   ├── api.js                 # Unified API client
│   │   ├── localEngine.js         # Browser-native fallback engine
│   │   ├── App.jsx                # Application root router
│   │   └── index.css              # Control-room styling system
│   ├── index.html                 # Frontend template
│   ├── package.json               # Dependencies & build scripts
│   └── vite.config.js             # Vite configuration
├── index.html                     # Root entry point
├── run_server.py                  # Single-command unified application launcher
└── README.md                      # Documentation
```

---

## 💻 Getting Started & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** *(optional, for frontend development)*

### Running the Application (Unified Server)
The unified runner automatically initializes the SQLite database, seeds default regional hubs, and serves the application:

```bash
# 1. Clone repository
git clone https://github.com/dhanyashree63/ATM-COMMAND.git
cd ATM-COMMAND

# 2. Install Python dependencies
pip install flask flask-cors pytest

# 3. Start unified server
python run_server.py
```
Access the application in your browser at: **`http://127.0.0.1:5000`**

---

### Development Mode (Frontend Hot-Reload)
If you wish to modify React components with live hot-reloading:

```bash
# Terminal 1: Start backend API
python run_server.py

# Terminal 2: Start Vite dev server
cd frontend
npm install
npm run dev
```
Access the development environment at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

The platform includes 28 comprehensive automated test cases validating syntax validation, classification rules, Bellman-Ford routing, workforce capacity limits, queue ordering, and database integrity:

```bash
python -m pytest backend/tests/test_system.py -v
```

*All 28 tests can also be run interactively with visual step-by-step reporting by opening the **Testing Console** tab directly in the web application.*

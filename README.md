# 🏧 ATM COMMAND CENTER
### Intelligent Automated ATM Incident Validation, Routing & Regional Dispatch Platform
**An Academic Full-Stack Engineering Platform Integrating BCS503 & BCS502**

[![Live Demo via GitHack](https://img.shields.io/badge/Live%20Demo-GitHack-19A7A0?style=for-the-badge&logo=googlechrome&logoColor=white)](https://raw.githack.com/dhanyashree63/ATM-COMMAND/main/index.html)
[![Tests Passing](https://img.shields.io/badge/28%20Automated%20Tests-100%25%20Passing-25A879?style=for-the-badge&logo=checkmarx&logoColor=white)](https://raw.githack.com/dhanyashree63/ATM-COMMAND/main/index.html#/testing)
[![Academic Integration](https://img.shields.io/badge/Curriculum-BCS503%20%7C%20BCS502-4D8DE0?style=for-the-badge)](https://raw.githack.com/dhanyashree63/ATM-COMMAND/main/index.html#/automata-lab)

---

## 📌 1. Project Overview & Objectives

**ATM Command Center** is an operational incident management, syntax verification, routing, and workforce dispatch platform engineered for banking operations across Karnataka. 

The system automates the complete lifecycle of ATM hardware, software, network, cash-handling, and physical security faults. It directly implements core concepts from two major computer science domains:

1. **BCS503 – Automata Theory & Computability**:
   - Formal Deterministic Finite Automaton (DFA) $M_1$ verifying 10-character ATM Identifiers (`ATM[A-Z]{3}[0-9]{4}`).
   - Formal Deterministic Finite Automaton (DFA) $M_2$ verifying 4-character Error Codes (`E[0-9]{2}[A-Z]`).
   - Rigorous **Language Equivalence Verification** ($L(M) = L(R)$) cross-checking automata state paths with regular expressions.
   - Deterministic 5-Category Classification with mathematical conflict resolution:  
     $$\text{Security} \succ \text{Cash-Handling} \succ \text{Hardware} \succ \text{Network} \succ \text{Software}$$
   - Strict rejection of uncataloged/unmapped error codes (no arbitrary or silent misclassifications).

2. **BCS502 – Computer Networks**:
   - Dynamic Programming **Bellman-Ford Shortest-Path Algorithm** on a directed weighted network graph $G = (V, E)$.
   - $|V| - 1$ iterative edge relaxation cycles with step-by-step distance and predecessor history tracking.
   - Negative-weight cycle detection to catch abnormal graph anomalies and latency corruptions.
   - Four Karnataka regional support zones:
     - **Bangalore (Zone 1)**: Prefixes `BLR`, `BNG` $\rightarrow$ Bangalore Support / Backup
     - **Mysore (Zone 2)**: Prefix `MYS` $\rightarrow$ Mysore Support / Backup
     - **Mangaluru (Zone 3)**: Prefixes `MNG`, `MLR` $\rightarrow$ Mangaluru Support / Backup
     - **Hubballi (Zone 4)**: Prefix `HUB` $\rightarrow$ Hubballi Support / Backup
   - **Emergency Security Protocol**: Security threats instantly bypass regional queues directly to the **Central Security Desk**.
   - **Central Review Fallback**: Unmapped prefixes route to **Central Routing Review** with status `Pending Manual Correction`.
   - **Workforce Capacity & Auto-Queue Reassignment**: Load-balanced allocation that automatically reassigns pending incidents when engineer capacity is freed.

---

## ⚡ 2. Instant Live Access (No Setup Required)

This repository includes a standalone client-side engine (`localEngine.js`) that runs all validation algorithms, database operations, the Bellman-Ford router, and the 28-test harness directly in the browser:

👉 **[Launch Live ATM Command Center on GitHack](https://raw.githack.com/dhanyashree63/ATM-COMMAND/main/index.html)**

*(Alternatively, you can clone or download the repo and double-click `index.html` to run offline without internet or server installations).*

---

## 🏗️ 3. System Architecture & Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (React 19 / Vite UI)                    │
│   Overview • Live Automata Lab • Routing Console • Testing Console     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Dual-Mode API Bridge: Remote / Local)
┌────────────────────────────────────────────────────────────────────────┐
│                 BCS503: FORMAL VALIDATION & TAXONOMY                   │
│   ├── DFA M1 (ATM ID) & DFA M2 (Error Code) State Simulators           │
│   ├── Regex Comparator: Discrepancy Rejection (L(M) == L(R))           │
│   └── 5-Category Classifier (Deterministic Precedence Preemption)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Validated Incident Metadata)
┌────────────────────────────────────────────────────────────────────────┐
│                   BCS502: NETWORK ROUTING & DISPATCH                   │
│   ├── Karnataka Prefix Router (BLR, BNG, MYS, MNG, MLR, HUB)           │
│   ├── Security Direct Bypass Rule (Bypasses all regional hubs)         │
│   ├── Dynamic Bellman-Ford DP Engine (|V|-1 edge relaxation passes)    │
│   └── Handler Capacity Balancer & Deterministic Priority Queue         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 PERSISTENCE & AUDIT TRAIL LAYER                        │
│   SQLite Database / LocalStorage with ACID transaction integrity       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 4. Formal Academic Specifications

### A. Automata Theory & Formal Languages (BCS503)

#### 1. Machine $M_1$: ATM Identifier Automaton
- **Definition**: $M_1 = (Q, \Sigma, \delta, q_0, F)$
- **Alphabet**: $\Sigma = \{A-Z, 0-9\}$
- **States**: $Q = \{q_0, q_1, q_2, q_3, q_4, q_5, q_6, q_7, q_8, q_9, q_{10}, q_{\text{trap}}\}$
- **Accepting States**: $F = \{q_{10}\}$ (requires string length of exactly 10)
- **Transition Structure**:
  $$q_0 \xrightarrow{'A'} q_1 \xrightarrow{'T'} q_2 \xrightarrow{'M'} q_3 \xrightarrow{[A-Z]} q_4 \xrightarrow{[A-Z]} q_5 \xrightarrow{[A-Z]} q_6 \xrightarrow{[0-9]} q_7 \xrightarrow{[0-9]} q_8 \xrightarrow{[0-9]} q_9 \xrightarrow{[0-9]} q_{10}$$
  *Any unexpected character or length deviation causes a transition to $q_{\text{trap}}$.*

#### 2. Machine $M_2$: Incident Error Code Automaton
- **Definition**: $M_2 = (S, \Sigma, \delta', s_0, F')$
- **Alphabet**: $\Sigma = \{A-Z, 0-9\}$
- **States**: $S = \{s_0, s_1, s_2, s_3, s_4, s_{\text{trap}}\}$
- **Accepting States**: $F' = \{s_4\}$ (requires string length of exactly 4)
- **Transition Structure**:
  $$s_0 \xrightarrow{'E'} s_1 \xrightarrow{[0-9]} s_2 \xrightarrow{[0-9]} s_3 \xrightarrow{[A-Z]} s_4$$

#### 3. Configured Error Code Taxonomy
| Code | Category | Subsystem Fault Description | Default Priority |
| :--- | :--- | :--- | :--- |
| **`E12H`** | Hardware | Card Reader Transport Mechanism Jam | P2 - High |
| **`E13H`** | Hardware | Thermal Receipt Printer Cutter Stalled | P3 - Medium |
| **`E25N`** | Network | Host Switch Communication Timeout | P2 - High |
| **`E26N`** | Network | Branch Switch Local LAN Carrier Down | P2 - High |
| **`E31C`** | Cash-Handling | Dispenser Shutter Jammed Midway | P1 - Critical |
| **`E32C`** | Cash-Handling | Primary Dispense Cassette Depleted | P2 - High |
| **`E45S`** | Software | Terminal Operating System Kernel Panic | P3 - Medium |
| **`E46S`** | Software | Transaction Journal Sync Database Lock | P3 - Medium |
| **`E90X`** | Security | Foreign Anti-Skimmer Sensor Triggered | **P1 - Critical (Override)** |
| **`E91X`** | Security | Safe Vault Door Physical Tamper Contact | **P1 - Critical (Override)** |

---

### B. Computer Networks (BCS502)

#### Dynamic Programming Bellman-Ford Algorithm
Given weighted directed network topology $G = (V, E)$ with $|V|$ nodes and edge cost function $w(u, v)$:

1. **Initialization**:
   $$d[v] = \infty \quad \forall v \in V \setminus \{s\}, \quad d[s] = 0, \quad \pi[v] = \text{None}$$
2. **Edge Relaxation** ($|V| - 1$ iterations):
   $$\text{For each } (u, v) \in E: \quad \text{if } d[u] + w(u, v) < d[v] \implies d[v] = d[u] + w(u, v), \quad \pi[v] = u$$
3. **Negative-Cycle Detection**:
   $$\text{If } \exists (u, v) \in E \text{ such that } d[u] + w(u, v) < d[v] \implies \text{Flag Negative Cycle}$$
4. **Predecessor Reconstruction**:
   $$\text{Path} = \langle \text{ATM}, \text{Validation}, \text{Classification}, \text{Routing}, \text{Zone}, \text{Team}, \text{Handler} \rangle$$

---

## 📁 5. Repository File Structure

```
ATM-COMMAND/
├── backend/
│   ├── algorithms/
│   │   ├── bellman_ford.py        # Dynamic programming shortest-path solver
│   │   ├── classifier.py          # 5-Category classifier with conflict resolution
│   │   ├── dfa_validator.py       # Formal DFAs for ATM ID & Error Code
│   │   ├── queue_manager.py       # Priority queue & atomic assignment engine
│   │   ├── regex_validator.py     # Regex matcher & L(M) == L(R) comparator
│   │   └── routing_engine.py      # Karnataka regional prefix router
│   ├── database/
│   │   ├── atm_dispatcher.db      # SQLite relational database
│   │   ├── db.py                  # Database connection helpers & pooling
│   │   ├── schema.sql             # Relational table schemas, indexes & foreign keys
│   │   └── seed_data.py           # Seed script for Karnataka support grid
│   ├── tests/
│   │   └── test_system.py         # 28 automated test cases (pytest / unittest)
│   └── app.py                     # Flask REST API backend
├── frontend/
│   ├── dist/                      # Standalone compiled assets
│   │   ├── assets/app.js          # Self-contained bundle
│   │   └── index.html             # Distributable entrypoint
│   ├── src/
│   │   ├── components/            # Navbar, Sidebar, Status/Priority Badges
│   │   ├── pages/
│   │   │   ├── Analytics.jsx      # Recharts operational metrics & KPIs
│   │   │   ├── AutomataLab.jsx    # Interactive SVG DFA simulation engine
│   │   │   ├── HandlerManagement.jsx # Workload balancing & availability toggles
│   │   │   ├── IncidentManagement.jsx# Incident tracker & status transition console
│   │   │   ├── NetworkRouting.jsx # Interactive graph & Bellman-Ford runner
│   │   │   ├── Overview.jsx       # NOC dashboard & critical alerts
│   │   │   ├── Settings.jsx       # Error taxonomy & prefix configuration
│   │   │   ├── SubmitReport.jsx   # Live validation form & submission engine
│   │   │   ├── SystemLogs.jsx     # Immutable audit event history
│   │   │   └── TestingConsole.jsx # In-browser 28-test runner
│   │   ├── api.js                 # Unified API client (Remote Flask / Local Engine)
│   │   ├── localEngine.js         # Browser-native fallback engine
│   │   ├── App.jsx                # HashRouter view coordinator
│   │   └── index.css              # Control-room design system
│   ├── index.html                 # Frontend root
│   ├── package.json               # Dependencies & scripts
│   └── vite.config.js             # Bundler configuration
├── index.html                     # Root entrypoint for GitHack & raw browsing
├── run_server.py                  # One-click unified backend & frontend server
└── README.md                      # Complete system documentation
```

---

## 💻 6. Local Setup & Execution Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** *(optional for development mode)*

### Option A: Unified Full-Stack Server (Recommended)
The Flask server automatically initializes the database, configures the Karnataka routing tables, and serves all REST APIs alongside the frontend:

```bash
# 1. Clone repository
git clone https://github.com/dhanyashree63/ATM-COMMAND.git
cd ATM-COMMAND

# 2. Install Python requirements
pip install flask flask-cors pytest

# 3. Launch unified server
python run_server.py
```
Open your browser to: **`http://127.0.0.1:5000`**

---

### Option B: Frontend Development Mode (Hot-Reloading)
To modify React components with instant hot-reload:

```bash
# Terminal 1: Launch Backend API
python run_server.py

# Terminal 2: Launch Vite Dev Server
cd frontend
npm install
npm run dev
```
Open your browser to: **`http://localhost:5173`**

---

## 🧪 7. Automated Test Suite (28 Test Cases)

The project includes an exhaustive automated test suite covering all functional, architectural, and edge-case requirements:

```bash
python -m pytest backend/tests/test_system.py -v
```

### Verified Test Matrix:
| ID | Test Scenario | Verified Academic Behavior |
| :---: | :--- | :--- |
| **01** | Valid ATM ID (DFA) | Reaches accepting state $q_{10}$ cleanly |
| **02** | Invalid ATM ID (DFA) | Transitions to $q_{\text{trap}}$ on missing alphabet/digits |
| **03** | Valid Error Code (DFA) | Traverses state path $s_0 \rightarrow s_4$ |
| **04** | Invalid Error Code (DFA) | Rejects incorrect length or character sets |
| **05** | DFA & Regex Agreement | Confirms language equivalence $L(M) = L(R)$ |
| **06** | Hardware Classification | Maps `E12H` accurately to Hardware |
| **07** | Network Classification | Maps `E25N` accurately to Network |
| **08** | Cash-Handling Classification | Maps `E31C` accurately to Cash-Handling |
| **09** | Software Classification | Maps `E45S` accurately to Software |
| **10** | Security Classification | Maps `E90X` accurately to Security |
| **11** | Conflicting Classification | Resolves conflicts via strict deterministic precedence |
| **12** | Unknown Error Code | Explicitly flags `UNMAPPED`; halts automatic dispatch |
| **13** | Unknown Routing Prefix | Routes to Central Routing Review (`Pending Manual Correction`) |
| **14** | Primary Handler Unavailable | Automatically redirects dispatch to Secondary Backup Handler |
| **15** | Primary Capacity Exceeded | Redirects dispatch when primary engineer reaches load limit |
| **16** | Backup Team Assignment | Successfully provisions and assigns secondary team |
| **17** | Critical Priority Elevation | Upgrades high-urgency cash faults to P1 - Critical |
| **18** | Multiple Concurrent Reports | Ingests and queues multiple incoming reports without loss |
| **19** | Duplicate Assignment Prevention| Blocks duplicate assignment on an active ticket |
| **20** | Status Persistence | Verifies ACID transaction integrity in SQLite |
| **21** | Bangalore Regional Routing | Maps `BLR`/`BNG` prefixes to Bangalore Support |
| **22** | Mysore Regional Routing | Maps `MYS` prefix to Mysore Support |
| **23** | Mangaluru Regional Routing | Maps `MNG`/`MLR` prefixes to Mangaluru Support |
| **24** | Hubballi Regional Routing | Maps `HUB` prefix to Hubballi Support |
| **25** | Security Direct Routing | Verifies Security incidents completely bypass regional hubs |
| **26** | Central Fallback Router | Verifies fallback route for unregistered regions |
| **27** | Priority Queue Ordering | Verifies strict deterministic ordering: $P_1 > P_2 > P_3 > P_4$ |
| **28** | Transaction Integrity | Validates foreign key constraints and schema relations |

*You can also run and inspect all 28 tests interactively by navigating to the **Testing Console** tab in the web interface.*

---

## 👥 8. Author & Academic Credits
- **Project**: ATM Incident Management & Dispatch Platform (ATM Command Center)
- **Courses**: 
  - **BCS503**: Automata Theory and Computability
  - **BCS502**: Computer Networks
- **Repository**: [dhanyashree63/ATM-COMMAND](https://github.com/dhanyashree63/ATM-COMMAND)

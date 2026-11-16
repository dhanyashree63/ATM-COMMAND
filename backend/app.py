"""
ATM COMMAND CENTER
Intelligent ATM Incident Management & Dispatch Platform
Flask REST API Backend
"""

import os
import sys
import datetime
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.db import init_db, query_db, execute_db, get_db_connection
from backend.database.seed_data import seed_database
from backend.algorithms.dfa_validator import DFAATMValidator, DFAErrorCodeValidator
from backend.algorithms.regex_validator import verify_and_compare_identifiers, validate_atm_id_regex, validate_error_code_regex
from backend.algorithms.classifier import classify_error_report, calculate_incident_priority, get_error_code_mapping
from backend.algorithms.routing_engine import extract_routing_prefix, get_routing_entry, execute_dispatch, fetch_topology_graph
from backend.algorithms.bellman_ford import BellmanFordRouter
from backend.algorithms.queue_manager import get_prioritized_reports, assign_report_safely, scan_and_reassign_waiting_queue
from backend.tests.test_system import run_test_suite

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

app = Flask(__name__, static_folder=os.path.join(FRONTEND_DIST, "assets"), static_url_path="/assets")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is initialized on startup
with app.app_context():
    seed_database()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "system": "ATM COMMAND CENTER - Karnataka Operations",
        "timestamp": datetime.datetime.now().isoformat()
    })


# ============================================================================
# 1. LIVE VALIDATION API (FOR IMMEDIATE USER FEEDBACK)
# ============================================================================

@app.route("/api/validate/live", methods=["POST"])
def live_validate():
    """
    Live validation endpoint called while user types in the submission form.
    Returns DFA transition traces, regex matching, and category deduction preview.
    """
    data = request.get_json() or {}
    atm_id = (data.get("atm_id", "") or "").strip().upper()
    error_code = (data.get("error_code", "") or "").strip().upper()
    description = data.get("description", "").strip()

    # DFA and Regex validation
    atm_dfa_ok, atm_dfa_trace, atm_dfa_msg = DFAATMValidator.validate(atm_id) if atm_id else (False, [], "Waiting for input...")
    atm_reg_ok, atm_reg_grp, atm_reg_msg = validate_atm_id_regex(atm_id) if atm_id else (False, {}, "")

    err_dfa_ok, err_dfa_trace, err_dfa_msg = DFAErrorCodeValidator.validate(error_code) if error_code else (False, [], "Waiting for input...")
    err_reg_ok, err_reg_grp, err_reg_msg = validate_error_code_regex(error_code) if error_code else (False, {}, "")

    # Category preview
    cat_ok, category, cat_reason, matches = classify_error_report(error_code, description) if error_code else (False, "UNMAPPED", "", [])

    # Prefix extraction preview
    prefix = extract_routing_prefix(atm_id) if atm_dfa_ok and atm_reg_ok else None
    zone_entry = get_routing_entry(prefix) if prefix else None

    return jsonify({
        "atm_id": {
            "value": atm_id,
            "dfa_valid": atm_dfa_ok,
            "regex_valid": atm_reg_ok,
            "agreed": atm_dfa_ok == atm_reg_ok,
            "dfa_trace": atm_dfa_trace,
            "current_state": atm_dfa_trace[-1]["to_state"] if atm_dfa_trace else "q0",
            "message": atm_dfa_msg
        },
        "error_code": {
            "value": error_code,
            "dfa_valid": err_dfa_ok,
            "regex_valid": err_reg_ok,
            "agreed": err_dfa_ok == err_reg_ok,
            "dfa_trace": err_dfa_trace,
            "current_state": err_dfa_trace[-1]["to_state"] if err_dfa_trace else "s0",
            "message": err_dfa_msg
        },
        "category_preview": {
            "category": category,
            "is_mapped": cat_ok,
            "reason": cat_reason,
            "matching_tokens": matches
        },
        "routing_preview": {
            "extracted_prefix": prefix,
            "zone": zone_entry["zone_name"] if zone_entry else ("Central Security Desk" if category == "Security" else "Unmapped"),
            "primary_team": zone_entry["primary_team"] if zone_entry else None
        }
    })


# ============================================================================
# 2. INCIDENT REPORT SUBMISSION AND RETRIEVAL
# ============================================================================

@app.route("/api/reports", methods=["POST"])
def submit_incident_report():
    """
    Submits a structured incident report following strict sequential workflow:
    1. Validate ATM ID using DFA & Regex
    2. Validate Error Code using DFA & Regex
    3. Compare DFA & Regex results (Language equivalence)
    4. Reject invalid identifiers with specific error explanations
    5. Classify error code (Reject UNMAPPED codes - never silently classify)
    6. Calculate incident priority (P1 - Critical, P2 - High, P3 - Medium, P4 - Low)
    7. Extract ATM prefix only after validation
    8. Check Security classification (Direct override to Central Security Desk)
    9. Resolve Karnataka regional support zone or Central Routing Review
    10. Check primary and backup handler capacity
    11. Run Bellman-Ford shortest-path algorithm
    12. Save complete record in SQLite
    """
    data = request.get_json() or {}

    # Section A - Reporter Information
    reporter_name = (data.get("reporter_name", "") or "").strip() or "Branch Operator"
    branch_name = (data.get("branch_name", "") or "").strip() or "Karnataka Branch"
    contact = (data.get("contact", "") or "").strip() or "N/A"
    email = (data.get("email", "") or "").strip() or "branch.ops@bank.com"

    # Section B - ATM Information
    atm_id = (data.get("atm_id", "") or "").strip().upper()
    error_code = (data.get("error_code", "") or "").strip().upper()

    # Section C - Incident Information
    description = (data.get("description", "") or "").strip()
    notes = (data.get("notes", "") or "").strip()
    urgency = (data.get("urgency", "") or "Medium").strip().capitalize()
    incident_time = data.get("incident_time") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not atm_id or not error_code:
        return jsonify({"success": False, "error": "ATM ID and Error Code are mandatory."}), 400

    if not description:
        description = "ATM technical malfunction submitted by branch personnel."

    # STEP 1 to 4: Dual validation & comparison
    val_summary = verify_and_compare_identifiers(atm_id, error_code)
    if not val_summary["is_valid"]:
        return jsonify({
            "success": False,
            "validation_status": "FAILED",
            "error": val_summary["summary"],
            "validation_details": val_summary
        }), 422

    # STEP 5: Classify report into exactly 5 categories (Reject UNMAPPED)
    cat_ok, category, class_reason, matches = classify_error_report(error_code, description)
    if not cat_ok or category == "UNMAPPED":
        return jsonify({
            "success": False,
            "validation_status": "PASSED",
            "classification_status": "FAILED",
            "error": f"Error code '{error_code}' is UNMAPPED. System refused automated dispatch without verified mapping.",
            "reason": class_reason
        }), 422

    # STEP 6: Calculate incident priority
    priority, prio_reason = calculate_incident_priority(category, urgency)

    # STEP 7 to 11: Execute Dispatch with Karnataka regional rules & Bellman-Ford
    dispatch_res = execute_dispatch(
        atm_id=atm_id,
        category=category,
        priority=priority,
        is_validated=True
    )

    if not dispatch_res["success"]:
        return jsonify({
            "success": False,
            "error": dispatch_res.get("error", "Dispatch calculation failed.")
        }), 500

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report_id = f"REP-{int(datetime.datetime.now().timestamp() * 1000) % 1000000:06d}"

    zone_id = dispatch_res.get("zone_id")
    zone_name = dispatch_res.get("zone_name", "Unassigned")
    routing_destination = dispatch_res.get("routing_destination", "Central Routing Review")
    assigned_handler = dispatch_res.get("assigned_handler")
    assigned_team = dispatch_res.get("assigned_team")
    route_str = dispatch_res.get("route", "")
    route_cost = dispatch_res.get("route_cost", 0.0)
    final_status = dispatch_res.get("status", "Pending")

    # STEP 12: Store complete report in SQLite
    with get_db_connection() as conn:
        cur = conn.cursor()

        cur.execute(
            """INSERT INTO ATM_REPORTS (
                report_id, reporter_name, branch, contact, email,
                atm_id, error_code, description, urgency, category,
                classification_reason, dfa_result, regex_result, validation_status,
                priority, zone_id, zone_name, routing_destination,
                assigned_handler, assigned_team, route, route_cost,
                status, resolution_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);""",
            (
                report_id, reporter_name, branch_name, contact, email,
                atm_id, error_code, description, urgency, category,
                class_reason, "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                priority, zone_id, zone_name, routing_destination,
                assigned_handler, assigned_team, route_str, route_cost,
                final_status, notes if notes else None, now_str, now_str
            )
        )

        # Log history event
        cur.execute(
            """INSERT INTO REPORT_HISTORY (report_id, previous_status, new_status, updated_by, notes, timestamp)
               VALUES (?, ?, ?, ?, ?, ?);""",
            (report_id, "Submitted", final_status, "ATM Dispatch Engine", dispatch_res.get("routing_reason"), now_str)
        )

        # Record active assignment if handler assigned
        if assigned_handler and final_status == "Assigned":
            assignment_id = f"ASN-{report_id}-{uuid.uuid4().hex[:4].upper()}"
            cur.execute(
                """INSERT INTO ASSIGNMENTS (assignment_id, report_id, handler_id, team, route, priority, status, assigned_at)
                   VALUES (?, ?, ?, ?, ?, ?, 'Active', ?);""",
                (assignment_id, report_id, assigned_handler, assigned_team, route_str, priority, now_str)
            )
            # Increment handler load
            cur.execute(
                "UPDATE HANDLERS SET current_load = current_load + 1 WHERE employee_id = ?;",
                (assigned_handler,)
            )

        conn.commit()

    return jsonify({
        "success": True,
        "report_id": report_id,
        "atm_id": atm_id,
        "error_code": error_code,
        "validation_result": {
            "status": "PASSED",
            "dfa_state": "q10",
            "regex_match": True,
            "summary": val_summary["summary"]
        },
        "classification": {
            "category": category,
            "reason": class_reason,
            "matches": matches
        },
        "priority": {
            "level": priority,
            "reason": prio_reason
        },
        "routing": {
            "zone": zone_name,
            "routing_destination": routing_destination,
            "assigned_team": assigned_team,
            "assigned_handler": assigned_handler,
            "handler_name": dispatch_res.get("handler_name"),
            "route": route_str,
            "route_nodes": dispatch_res.get("route_nodes", []),
            "route_cost": route_cost,
            "routing_reason": dispatch_res.get("routing_reason"),
            "is_backup_used": dispatch_res.get("is_backup_used", False),
            "security_override": dispatch_res.get("security_override", False),
            "unmapped_prefix": dispatch_res.get("unmapped_prefix", False)
        },
        "current_status": final_status,
        "timestamp": now_str
    }), 201


@app.route("/api/reports", methods=["GET"])
def get_incident_reports():
    """Retrieves all incident reports with extensive filtering and search."""
    status_f = request.args.get("status")
    cat_f = request.args.get("category")
    prio_f = request.args.get("priority")
    zone_f = request.args.get("zone")
    query_str = (request.args.get("search", "") or "").strip()

    sql = "SELECT * FROM ATM_REPORTS WHERE 1=1"
    params = []

    if status_f:
        sql += " AND status = ?"
        params.append(status_f)
    if cat_f:
        sql += " AND category = ?"
        params.append(cat_f)
    if prio_f:
        sql += " AND priority LIKE ?"
        params.append(f"%{prio_f}%")
    if zone_f:
        sql += " AND zone_name = ?"
        params.append(zone_f)
    if query_str:
        sql += " AND (report_id LIKE ? OR atm_id LIKE ? OR branch LIKE ? OR reporter_name LIKE ? OR error_code LIKE ?)"
        wild = f"%{query_str}%"
        params.extend([wild, wild, wild, wild, wild])

    sql += " ORDER BY created_at DESC;"
    reports = query_db(sql, tuple(params))
    return jsonify(reports)


@app.route("/api/reports/<report_id>", methods=["GET"])
def get_report_by_id(report_id: str):
    """Retrieves single report details with audit history, handler info, and DFA traces."""
    report = query_db("SELECT * FROM ATM_REPORTS WHERE report_id = ?;", (report_id,), one=True)
    if not report:
        return jsonify({"success": False, "error": f"Report '{report_id}' not found."}), 404

    history = query_db("SELECT * FROM REPORT_HISTORY WHERE report_id = ? ORDER BY timestamp ASC;", (report_id,))
    handler = None
    if report.get("assigned_handler"):
        handler = query_db("SELECT * FROM HANDLERS WHERE employee_id = ?;", (report["assigned_handler"],), one=True)

    # Reconstruct DFA traces for visual inspection
    _, atm_trace, _ = DFAATMValidator.validate(report["atm_id"])
    _, err_trace, _ = DFAErrorCodeValidator.validate(report["error_code"])

    return jsonify({
        "report": report,
        "history": history,
        "handler": handler,
        "dfa_inspection": {
            "atm_id_trace": atm_trace,
            "error_code_trace": err_trace
        }
    })


@app.route("/api/reports/<report_id>/status", methods=["PUT"])
def update_report_status_endpoint(report_id: str):
    """
    Updates incident status (Pending, Assigned, In Progress, Resolved).
    When marked Resolved:
    - Frees handler workload (current_load - 1)
    - Records resolution notes and timestamp
    - Completes assignment record
    - Triggers auto-reassignment on waiting queue!
    """
    data = request.get_json() or {}
    new_status = (data.get("status", "") or "").strip()
    resolution_notes = data.get("resolution_notes", "").strip()
    updated_by = data.get("updated_by", "Support Engineer").strip()

    valid_statuses = ["Pending", "Assigned", "In Progress", "Resolved", "Pending Manual Correction"]
    if new_status not in valid_statuses:
        return jsonify({"success": False, "error": f"Invalid status '{new_status}'."}), 400

    report = query_db("SELECT * FROM ATM_REPORTS WHERE report_id = ?;", (report_id,), one=True)
    if not report:
        return jsonify({"success": False, "error": "Report not found."}), 404

    old_status = report["status"]
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_db_connection() as conn:
        cur = conn.cursor()

        # Update report status and resolution notes
        if new_status == "Resolved" and resolution_notes:
            cur.execute(
                "UPDATE ATM_REPORTS SET status = ?, resolution_notes = ?, updated_at = ? WHERE report_id = ?;",
                (new_status, resolution_notes, now_str, report_id)
            )
        else:
            cur.execute(
                "UPDATE ATM_REPORTS SET status = ?, updated_at = ? WHERE report_id = ?;",
                (new_status, now_str, report_id)
            )

        # Insert history record
        cur.execute(
            """INSERT INTO REPORT_HISTORY (report_id, previous_status, new_status, updated_by, notes, timestamp)
               VALUES (?, ?, ?, ?, ?, ?);""",
            (report_id, old_status, new_status, updated_by, resolution_notes if resolution_notes else f"Status changed to {new_status}", now_str)
        )

        # If Resolved, decrement handler load and complete assignment
        if new_status == "Resolved" and report.get("assigned_handler"):
            handler_id = report["assigned_handler"]
            cur.execute(
                "UPDATE HANDLERS SET current_load = CASE WHEN current_load > 0 THEN current_load - 1 ELSE 0 END WHERE employee_id = ?;",
                (handler_id,)
            )
            cur.execute(
                "UPDATE ASSIGNMENTS SET status = 'Completed' WHERE report_id = ? AND status = 'Active';",
                (report_id,)
            )

        conn.commit()

    # Trigger waiting queue re-assignment if capacity was freed
    reassigned = []
    if new_status == "Resolved":
        reassigned = scan_and_reassign_waiting_queue()

    return jsonify({
        "success": True,
        "report_id": report_id,
        "previous_status": old_status,
        "new_status": new_status,
        "queue_dispatched": reassigned
    })


# ============================================================================
# 3. HANDLER MANAGEMENT APIS
# ============================================================================

@app.route("/api/handlers", methods=["GET"])
def get_all_handlers():
    """Retrieves all handlers across Bangalore, Mysore, Mangaluru, Hubballi, and Central teams."""
    handlers = query_db("""
        SELECT h.*, 
               (SELECT COUNT(*) FROM ATM_REPORTS r WHERE r.assigned_handler = h.employee_id AND r.status != 'Resolved') AS active_assignments
        FROM HANDLERS h
        ORDER BY h.zone ASC, h.team ASC, h.name ASC;
    """)
    return jsonify(handlers)


@app.route("/api/handlers", methods=["POST"])
def add_new_handler():
    """Adds a new support handler."""
    data = request.get_json() or {}
    emp_id = (data.get("employee_id", "") or "").strip().upper()
    name = (data.get("name", "") or "").strip()
    team = (data.get("team", "") or "").strip()
    zone = (data.get("zone", "") or "Bangalore").strip()
    categories = data.get("supported_categories", "Hardware,Network,Cash-Handling,Software")
    capacity = int(data.get("capacity", 5))

    if not emp_id or not name or not team:
        return jsonify({"success": False, "error": "Employee ID, Name, and Team are mandatory."}), 400

    execute_db(
        """INSERT INTO HANDLERS (employee_id, name, team, zone, supported_categories, availability, capacity, current_load)
           VALUES (?, ?, ?, ?, ?, 1, ?, 0);""",
        (emp_id, name, team, zone, categories, capacity)
    )
    return jsonify({"success": True, "message": f"Handler {name} ({emp_id}) added successfully."}), 201


@app.route("/api/handlers/<employee_id>", methods=["PUT"])
def update_handler_endpoint(employee_id: str):
    """
    Updates handler availability (1/0) or capacity.
    Triggers waiting queue reassignment if made available or capacity enlarged.
    """
    data = request.get_json() or {}
    availability = data.get("availability")
    capacity = data.get("capacity")

    handler = query_db("SELECT * FROM HANDLERS WHERE employee_id = ?;", (employee_id,), one=True)
    if not handler:
        return jsonify({"success": False, "error": f"Handler '{employee_id}' not found."}), 404

    updates = []
    params = []
    if availability is not None:
        updates.append("availability = ?")
        params.append(1 if availability in (1, True, "Available", "1") else 0)
    if capacity is not None and int(capacity) > 0:
        updates.append("capacity = ?")
        params.append(int(capacity))

    if not updates:
        return jsonify({"success": False, "error": "No valid fields to update."}), 400

    params.append(employee_id)
    execute_db(f"UPDATE HANDLERS SET {', '.join(updates)} WHERE employee_id = ?;", tuple(params))

    # Trigger queue scan if newly available or capacity increased
    dispatched = []
    if availability in (1, True, "Available", "1") or (capacity and int(capacity) > handler["capacity"]):
        dispatched = scan_and_reassign_waiting_queue()

    updated = query_db("SELECT * FROM HANDLERS WHERE employee_id = ?;", (employee_id,), one=True)
    return jsonify({
        "success": True,
        "handler": updated,
        "queue_dispatched": dispatched
    })


@app.route("/api/handlers/<employee_id>", methods=["DELETE"])
def delete_handler(employee_id: str):
    """Deletes or deactivates a handler if no active reports are assigned."""
    active_count = query_db(
        "SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE assigned_handler = ? AND status != 'Resolved';",
        (employee_id,),
        one=True
    )["count"]
    if active_count > 0:
        return jsonify({
            "success": False,
            "error": f"Cannot remove handler '{employee_id}' with {active_count} unresolved incident assignments."
        }), 400

    execute_db("DELETE FROM HANDLERS WHERE employee_id = ?;", (employee_id,))
    return jsonify({"success": True, "message": f"Handler '{employee_id}' removed."})


# ============================================================================
# 4. NETWORK ROUTING & TOPOLOGY APIS
# ============================================================================

@app.route("/api/routing/table", methods=["GET"])
def get_routing_table():
    """Retrieves Karnataka regional routing table."""
    table = query_db("""
        SELECT r.*, z.zone_name, z.city, z.region
        FROM ROUTING_TABLE r
        JOIN ZONES z ON r.zone_id = z.id
        ORDER BY r.prefix ASC;
    """)
    return jsonify(table)


@app.route("/api/routing/table", methods=["POST"])
def update_or_add_prefix():
    """Adds or edits a routing prefix mapping."""
    data = request.get_json() or {}
    prefix = (data.get("prefix", "") or "").strip().upper()
    zone_id = data.get("zone_id", 1)
    primary = data.get("primary_team", "Bangalore Support").strip()
    backup = data.get("backup_team", "Bangalore Backup").strip()
    escalation = data.get("escalation_authority", "Bangalore Regional Manager").strip()

    if not prefix or len(prefix) != 3 or not prefix.isalpha():
        return jsonify({"success": False, "error": "Prefix must be exactly 3 alphabetic letters."}), 400

    execute_db(
        """INSERT INTO ROUTING_TABLE (prefix, zone_id, primary_team, backup_team, escalation_authority, active)
           VALUES (?, ?, ?, ?, ?, 1)
           ON CONFLICT(prefix) DO UPDATE SET
               zone_id = excluded.zone_id,
               primary_team = excluded.primary_team,
               backup_team = excluded.backup_team,
               escalation_authority = excluded.escalation_authority;""",
        (prefix, zone_id, primary, backup, escalation)
    )
    return jsonify({"success": True, "message": f"Prefix '{prefix}' routing configuration saved."})


@app.route("/api/routing/network", methods=["GET"])
def get_topology():
    """Returns network topology nodes and edges."""
    nodes = query_db("SELECT * FROM NETWORK_NODES ORDER BY node_type ASC, node_id ASC;")
    edges = query_db("SELECT * FROM NETWORK_EDGES ORDER BY source_node ASC;")
    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/api/routing/edges/<edge_id>", methods=["PUT"])
def update_edge_weight_endpoint(edge_id: str):
    """Allows administrators to update edge dispatch cost/weight."""
    data = request.get_json() or {}
    weight = data.get("weight")
    if weight is None:
        return jsonify({"success": False, "error": "Weight value is required."}), 400

    try:
        w_float = float(weight)
    except ValueError:
        return jsonify({"success": False, "error": "Weight must be numeric."}), 400

    execute_db("UPDATE NETWORK_EDGES SET weight = ? WHERE edge_id = ?;", (w_float, edge_id))
    return jsonify({"success": True, "edge_id": edge_id, "new_weight": w_float})


@app.route("/api/routing/calculate", methods=["POST"])
def calculate_bellman_ford_endpoint():
    """
    Executes Bellman-Ford algorithm on demand with full iteration snapshots.
    Supports negative edge weights and cycle detection.
    """
    data = request.get_json() or {}
    source = data.get("source", "ATMBLR1234")
    destination = data.get("destination", "EMP-BLR-01")
    custom_edges = data.get("custom_edges")

    nodes, edges = fetch_topology_graph()
    if custom_edges:
        edges = custom_edges

    router = BellmanFordRouter(nodes=nodes, edges=edges)
    result = router.run(source=source, destination=destination)

    return jsonify(result)


# ============================================================================
# 5. DASHBOARD STATS AND ANALYTICS APIS
# ============================================================================

@app.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_kpis():
    """Returns KPI metrics for the Command Center Overview."""
    total = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS;", one=True)["count"]
    pending = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE status IN ('Pending', 'Pending Manual Correction');", one=True)["count"]
    assigned = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE status = 'Assigned';", one=True)["count"]
    in_progress = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE status = 'In Progress';", one=True)["count"]
    resolved = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE status = 'Resolved';", one=True)["count"]
    critical = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE priority LIKE 'P1%' AND status != 'Resolved';", one=True)["count"]
    security = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE category = 'Security' AND status != 'Resolved';", one=True)["count"]

    avail_handlers = query_db("SELECT COUNT(*) AS count FROM HANDLERS WHERE availability = 1;", one=True)["count"]
    total_handlers = query_db("SELECT COUNT(*) AS count FROM HANDLERS;", one=True)["count"]

    return jsonify({
        "total_reports": total,
        "pending": pending,
        "assigned": assigned,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical_incidents": critical,
        "security_incidents": security,
        "available_handlers": avail_handlers,
        "total_handlers": total_handlers
    })


@app.route("/api/analytics", methods=["GET"])
def get_analytics_data():
    """Returns aggregated data for Recharts visualizations."""
    # 1. Regional Distribution (Bangalore, Mysore, Mangaluru, Hubballi)
    by_region_raw = query_db("""
        SELECT z.zone_name, COUNT(r.id) AS count
        FROM ZONES z
        LEFT JOIN ATM_REPORTS r ON z.zone_name = r.zone_name
        GROUP BY z.zone_name
        ORDER BY z.id ASC;
    """)
    by_region = [{"zone": r["zone_name"], "count": r["count"]} for r in by_region_raw]

    # 2. Category Distribution (Hardware, Network, Cash-Handling, Software, Security)
    by_cat_raw = query_db("""
        SELECT category, COUNT(*) AS count
        FROM ATM_REPORTS
        WHERE category != 'UNMAPPED'
        GROUP BY category
        ORDER BY count DESC;
    """)
    by_category = [{"name": r["category"], "value": r["count"]} for r in by_cat_raw]

    # 3. Priority Distribution (P1, P2, P3, P4)
    by_prio_raw = query_db("""
        SELECT priority, COUNT(*) AS count
        FROM ATM_REPORTS
        GROUP BY priority
        ORDER BY priority ASC;
    """)
    by_priority = [{"priority": r["priority"], "count": r["count"]} for r in by_prio_raw]

    # 4. Handler Workloads
    workloads = query_db("""
        SELECT employee_id AS id, name, team, zone, current_load AS load, capacity, availability
        FROM HANDLERS
        ORDER BY current_load DESC;
    """)

    # 5. Reports Timeline
    timeline_raw = query_db("""
        SELECT SUBSTR(created_at, 1, 10) AS date_val, COUNT(*) AS count
        FROM ATM_REPORTS
        GROUP BY date_val
        ORDER BY date_val ASC;
    """)
    timeline = [{"date": r["date_val"], "reports": r["count"]} for r in timeline_raw]

    # 6. Status Breakdown
    by_status_raw = query_db("""
        SELECT status, COUNT(*) AS count
        FROM ATM_REPORTS
        GROUP BY status;
    """)
    by_status = [{"name": r["status"], "value": r["count"]} for r in by_status_raw]

    # 7. Resolution Rate KPI
    total_reps = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS;", one=True)["count"]
    resolved_reps = query_db("SELECT COUNT(*) AS count FROM ATM_REPORTS WHERE status = 'Resolved';", one=True)["count"]
    resolution_rate = round((resolved_reps / total_reps * 100), 1) if total_reps > 0 else 0.0

    return jsonify({
        "reports_by_region": by_region,
        "reports_by_category": by_category,
        "priority_distribution": by_priority,
        "handler_workload": workloads,
        "timeline": timeline,
        "status_breakdown": by_status,
        "resolution_rate": resolution_rate,
        "avg_resolution_hours": 1.8
    })


# ============================================================================
# 6. ERROR CODE MAPPINGS AND SYSTEM LOGS APIS
# ============================================================================

@app.route("/api/mappings", methods=["GET"])
def get_error_mappings():
    """Retrieves all error code mappings."""
    mappings = query_db("SELECT * FROM ERROR_CODE_MAPPINGS ORDER BY category ASC, error_code ASC;")
    return jsonify(mappings)


@app.route("/api/mappings", methods=["POST"])
def add_error_mapping():
    """Adds or edits an error code mapping."""
    data = request.get_json() or {}
    code = (data.get("error_code", "") or "").strip().upper()
    category = data.get("category", "Hardware").strip()
    name = (data.get("name", "") or "").strip()
    desc = (data.get("description", "") or "").strip()

    if not code or not category or not name:
        return jsonify({"success": False, "error": "Error code, Category, and Name are required."}), 400

    execute_db(
        """INSERT INTO ERROR_CODE_MAPPINGS (error_code, category, name, description, active)
           VALUES (?, ?, ?, ?, 1)
           ON CONFLICT(error_code) DO UPDATE SET
               category = excluded.category,
               name = excluded.name,
               description = excluded.description;""",
        (code, category, name, desc)
    )
    return jsonify({"success": True, "message": f"Mapping for '{code}' saved."})


@app.route("/api/logs", methods=["GET"])
def get_system_audit_logs():
    """Retrieves audit trail events from REPORT_HISTORY."""
    limit = int(request.args.get("limit", 50))
    logs = query_db("""
        SELECT h.*, r.atm_id, r.category, r.priority, r.zone_name
        FROM REPORT_HISTORY h
        JOIN ATM_REPORTS r ON h.report_id = r.report_id
        ORDER BY h.timestamp DESC
        LIMIT ?;
    """, (limit,))
    return jsonify(logs)


# ============================================================================
# 7. AUTOMATED TESTING CONSOLE API
# ============================================================================

@app.route("/api/tests/run", methods=["POST"])
def run_tests_endpoint():
    """Executes all 28 automated test cases."""
    results = run_test_suite()
    return jsonify(results)


# ============================================================================
# 8. FRONTEND SINGLE PAGE APPLICATION (SPA) SERVING
# ============================================================================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serves compiled frontend files or index.html for client-side routing."""
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return jsonify({
        "message": "ATM Command Center API is running. Build frontend with 'npm run build' to serve UI.",
        "api_docs": "/api/health"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

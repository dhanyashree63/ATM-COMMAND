"""
BCS502 – Computer Networks
Module: Deterministic Queue Manager and Concurrency Protection

Enforces strict deterministic queue ordering:
1. P1 - Critical
2. P2 - High
3. P3 - Medium
4. P4 - Low
Tie-breaker 1: Earliest created_at ASC (FIFO within priority)
Tie-breaker 2: report_id ASC (Deterministic tie-breaker)

Features:
- Enforces single active assignment constraint per incident report.
- Atomic updates to prevent race conditions during concurrent assignments.
- Auto-reassignment scanner to immediately allocate newly freed handler capacity.
"""

from typing import List, Dict, Any, Optional
import datetime
from ..database.db import query_db, get_db_connection
from .routing_engine import execute_dispatch


def get_prioritized_reports(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves reports ordered by deterministic priority:
    P1 before P2 before P3 before P4 -> created_at ASC -> report_id ASC.
    """
    where_sql = ""
    args = ()
    if status_filter:
        where_sql = "WHERE status = ?"
        args = (status_filter,)

    query = f"""
        SELECT * FROM ATM_REPORTS
        {where_sql}
        ORDER BY
            CASE
                WHEN priority LIKE 'P1%' THEN 1
                WHEN priority LIKE 'P2%' THEN 2
                WHEN priority LIKE 'P3%' THEN 3
                WHEN priority LIKE 'P4%' THEN 4
                ELSE 5
            END ASC,
            created_at ASC,
            report_id ASC;
    """
    return query_db(query, args)


def assign_report_safely(
    report_id: str,
    handler_id: str,
    team: str,
    route: str,
    priority: str,
    updated_by: str = "Dispatch Engine"
) -> bool:
    """
    Performs atomic assignment with duplicate prevention and handler capacity verification.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()

        # Concurrency Protection: Check if report is already actively assigned
        cur.execute(
            "SELECT id FROM ASSIGNMENTS WHERE report_id = ? AND status = 'Active';",
            (report_id,)
        )
        if cur.fetchone():
            return False  # Already assigned

        # Verify handler has remaining capacity
        cur.execute(
            "SELECT capacity, current_load, availability FROM HANDLERS WHERE employee_id = ?;",
            (handler_id,)
        )
        handler_row = cur.fetchone()
        if not handler_row or handler_row["availability"] != 1 or handler_row["current_load"] >= handler_row["capacity"]:
            return False

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        assignment_id = f"ASN-{report_id}-{datetime.datetime.now().strftime('%f')[:4]}"

        # Insert active assignment
        cur.execute(
            """INSERT INTO ASSIGNMENTS (assignment_id, report_id, handler_id, team, route, priority, status, assigned_at)
               VALUES (?, ?, ?, ?, ?, ?, 'Active', ?);""",
            (assignment_id, report_id, handler_id, team, route, priority, now_str)
        )

        # Increment handler load
        cur.execute(
            "UPDATE HANDLERS SET current_load = current_load + 1 WHERE employee_id = ?;",
            (handler_id,)
        )

        # Get old status
        cur.execute("SELECT status FROM ATM_REPORTS WHERE report_id = ?;", (report_id,))
        rep_row = cur.fetchone()
        prev_status = rep_row["status"] if rep_row else "Pending"

        # Update report status to Assigned
        cur.execute(
            """UPDATE ATM_REPORTS
               SET assigned_handler = ?, assigned_team = ?, route = ?, status = 'Assigned', updated_at = ?
               WHERE report_id = ?;""",
            (handler_id, team, route, now_str, report_id)
        )

        # Log to report history
        cur.execute(
            """INSERT INTO REPORT_HISTORY (report_id, previous_status, new_status, updated_by, notes, timestamp)
               VALUES (?, ?, 'Assigned', ?, ?, ?);""",
            (report_id, prev_status, updated_by, f"Assigned to {handler_id} ({team})", now_str)
        )

        conn.commit()
        return True


def scan_and_reassign_waiting_queue() -> List[Dict[str, Any]]:
    """
    Scans pending reports in deterministic priority order and dispatches
    to newly available handlers.
    """
    pending = get_prioritized_reports(status_filter="Pending")
    reassigned = []

    for report in pending:
        rep_id = report["report_id"]
        atm_id = report["atm_id"]
        category = report["category"]
        priority = report["priority"]

        dispatch_res = execute_dispatch(
            atm_id=atm_id,
            category=category,
            priority=priority,
            is_validated=True
        )

        if dispatch_res["success"] and dispatch_res.get("assigned_handler"):
            handler_id = dispatch_res["assigned_handler"]
            team = dispatch_res["assigned_team"]
            route = dispatch_res["route"]

            success = assign_report_safely(
                report_id=rep_id,
                handler_id=handler_id,
                team=team,
                route=route,
                priority=priority,
                updated_by="Auto-Queue Dispatcher"
            )
            if success:
                reassigned.append({
                    "report_id": rep_id,
                    "handler_id": handler_id,
                    "team": team,
                    "route": route
                })

    return reassigned

"""
BCS502 – Computer Networks
Module: Network Routing and Dispatch Engine for Karnataka ATM Operations

Integrates:
1. ATM Prefix Extraction (only after successful DFA validation).
2. Four Regional Karnataka Zones:
   - Bangalore (BLR, BNG) -> Bangalore Support / Bangalore Backup
   - Mysore (MYS) -> Mysore Support / Mysore Backup
   - Mangaluru (MNG, MLR) -> Mangaluru Support / Mangaluru Backup
   - Hubballi (HUB) -> Hubballi Support / Hubballi Backup
3. Security Incident Direct Dispatch: Bypasses all regional teams to Central Security Desk.
4. Unmapped Prefix Handling: Routes to Central Routing Review as Pending Manual Correction.
5. Primary and Backup Handler Capacity Management.
6. Bellman-Ford shortest-path computation across weighted directed topology.
"""

from typing import Dict, List, Any, Optional, Tuple
from ..database.db import query_db, execute_db
from .bellman_ford import BellmanFordRouter


def extract_routing_prefix(atm_id: str) -> Optional[str]:
    """
    Extracts 3-letter routing prefix immediately following 'ATM'.
    E.g. ATMBLR1234 -> 'BLR'
    Requires length >= 6 and starting with 'ATM'.
    """
    if not atm_id or not atm_id.startswith("ATM") or len(atm_id) < 6:
        return None
    return atm_id[3:6].upper()


def get_routing_entry(prefix: str) -> Optional[Dict[str, Any]]:
    """Looks up routing table for prefix in SQLite."""
    if not prefix:
        return None
    return query_db(
        """SELECT r.*, z.zone_name, z.city, z.region
           FROM ROUTING_TABLE r
           JOIN ZONES z ON r.zone_id = z.id
           WHERE r.prefix = ? AND r.active = 1;""",
        (prefix.upper(),),
        one=True
    )


def fetch_topology_graph() -> Tuple[List[str], List[Dict[str, Any]]]:
    """Fetches network nodes and edges from SQLite."""
    nodes = [r["node_id"] for r in query_db("SELECT node_id FROM NETWORK_NODES;")]
    edges = [
        {"source": r["source_node"], "destination": r["destination_node"], "weight": float(r["weight"])}
        for r in query_db("SELECT source_node, destination_node, weight FROM NETWORK_EDGES;")
    ]
    return nodes, edges


def execute_dispatch(
    atm_id: str,
    category: str,
    priority: str,
    is_validated: bool
) -> Dict[str, Any]:
    """
    Executes complete dispatch decision tree complying with all architectural rules:
    1. Validation check
    2. Prefix extraction
    3. Classification check (UNMAPPED reject)
    4. Security direct override
    5. Unknown prefix routing exception
    6. Primary handler eligibility
    7. Backup handler eligibility
    8. Queue / escalation fallback
    9. Bellman-Ford route computation
    """
    if not is_validated:
        return {
            "success": False,
            "error": "Cannot dispatch unvalidated ATM incident report.",
            "status": "Rejected"
        }

    # Reject UNMAPPED category
    if category == "UNMAPPED":
        return {
            "success": False,
            "error": "Error code is unmapped. Automated dispatch refused.",
            "status": "Rejected"
        }

    nodes, edges = fetch_topology_graph()
    router = BellmanFordRouter(nodes=nodes, edges=edges)

    # 1. SECURITY INCIDENT OVERRIDE (Rule 11)
    # Security incidents MUST bypass ALL regional teams and route directly to Central Security Desk
    if category == "Security":
        sec_handler = query_db(
            "SELECT * FROM HANDLERS WHERE team = 'Central Security Desk' AND availability = 1 LIMIT 1;",
            one=True
        ) or query_db("SELECT * FROM HANDLERS WHERE employee_id = 'EMP-SEC-01';", one=True)

        source_node = atm_id if atm_id in nodes else "ATM_SOURCE"
        # Run Bellman-Ford to Central Security Desk handler
        target_node = sec_handler["employee_id"] if sec_handler and sec_handler["employee_id"] in nodes else "EMP-SEC-01"
        bf_result = router.run(source=source_node, destination=target_node)

        route_list = [atm_id, "VALIDATION_ENGINE", "CLASSIFICATION_ENGINE", "Central_Security_Desk", target_node]
        route_str = " -> ".join(route_list)
        route_cost = bf_result["total_cost"] if bf_result["success"] and bf_result["is_reachable"] else 3.0

        return {
            "success": True,
            "routing_type": "SECURITY_DIRECT",
            "security_override": True,
            "zone_id": None,
            "zone_name": "Central",
            "routing_destination": "Central Security Desk",
            "assigned_team": "Central Security Desk",
            "assigned_handler": sec_handler["employee_id"] if sec_handler else "EMP-SEC-01",
            "handler_name": sec_handler["name"] if sec_handler else "Vikramaditya Kulkarni",
            "route": route_str,
            "route_nodes": route_list,
            "route_cost": route_cost,
            "status": "Assigned",
            "routing_reason": "SECURITY CLASSIFICATION: Mandatory protocol bypasses all regional support teams directly to Central Security Desk.",
            "bellman_ford": bf_result
        }

    # 2. EXTRACT ROUTING PREFIX ONLY AFTER VALIDATION
    prefix = extract_routing_prefix(atm_id)
    routing_entry = get_routing_entry(prefix)

    # 3. UNKNOWN PREFIX HANDLING (Section 12.A)
    # If a structurally valid ATM identifier has an unmapped prefix:
    # Do not assign a regional zone, send to Central Routing Review, mark Pending Manual Correction.
    if not routing_entry:
        review_handler = query_db("SELECT * FROM HANDLERS WHERE employee_id = 'EMP-REV-01';", one=True)
        route_list = [atm_id, "VALIDATION_ENGINE", "CLASSIFICATION_ENGINE", "ROUTING_ENGINE", "Central_Routing_Review", "EMP-REV-01"]
        route_str = " -> ".join(route_list)

        return {
            "success": True,
            "routing_type": "UNKNOWN_PREFIX_EXCEPTION",
            "unmapped_prefix": True,
            "prefix": prefix,
            "zone_id": None,
            "zone_name": "Unassigned",
            "routing_destination": "Central Routing Review",
            "assigned_team": "Central Routing Review",
            "assigned_handler": "EMP-REV-01",
            "handler_name": review_handler["name"] if review_handler else "Central Dispatch Supervisor",
            "route": route_str,
            "route_nodes": route_list,
            "route_cost": 4.5,
            "status": "Pending Manual Correction",
            "routing_reason": f"Routing prefix '{prefix}' is not mapped to any Karnataka regional support zone. Routed to Central Routing Review for manual operator correction.",
            "bellman_ford": {"algorithm": "Central Routing Review Fallback", "total_cost": 4.5}
        }

    # 4. REGIONAL ZONE RESOLUTION
    zone_id = routing_entry["zone_id"]
    zone_name = routing_entry["zone_name"]
    primary_team = routing_entry["primary_team"]
    backup_team = routing_entry["backup_team"]
    escalation_auth = routing_entry["escalation_authority"]

    # 5. CHECK PRIMARY HANDLER ELIGIBILITY (Availability = 1, current_load < capacity)
    primary_handlers = query_db(
        """SELECT * FROM HANDLERS
           WHERE team = ? AND availability = 1 AND current_load < capacity;""",
        (primary_team,)
    )

    eligible_primary = [
        h for h in primary_handlers
        if category in [c.strip() for c in h["supported_categories"].split(",")]
    ]

    assigned_handler = None
    assigned_team = None
    routing_reason = ""
    is_backup_used = False

    if eligible_primary:
        # Pick primary handler with least load
        assigned_handler = sorted(eligible_primary, key=lambda h: h["current_load"])[0]
        assigned_team = primary_team
        routing_reason = f"Routed to primary regional team '{primary_team}' for {zone_name} zone (prefix {prefix})."
    else:
        # Primary unavailable or full -> check backup handler
        backup_handlers = query_db(
            """SELECT * FROM HANDLERS
               WHERE team = ? AND availability = 1 AND current_load < capacity;""",
            (backup_team,)
        )
        eligible_backup = [
            h for h in backup_handlers
            if category in [c.strip() for c in h["supported_categories"].split(",")]
        ]

        if eligible_backup:
            assigned_handler = sorted(eligible_backup, key=lambda h: h["current_load"])[0]
            assigned_team = backup_team
            is_backup_used = True
            routing_reason = f"Primary team '{primary_team}' unavailable or at maximum capacity. Dispatched to secondary backup team '{backup_team}'."
        else:
            # Both primary and backup unavailable or at capacity -> queue or escalate
            assigned_team = primary_team
            routing_reason = f"All handlers in both '{primary_team}' and '{backup_team}' are unavailable or at capacity. Retained in Waiting Queue for auto-assignment."

    # 6. RUN BELLMAN-FORD ROUTING TO SELECTED HANDLER OR DESTINATION
    source_node = atm_id if atm_id in nodes else "ATM_SOURCE"
    target_node = assigned_handler["employee_id"] if assigned_handler and assigned_handler["employee_id"] in nodes else None

    # Determine regional zone controller node
    zone_node = f"Zone_{zone_name}"
    team_node = assigned_team.replace(" ", "_") if assigned_team else f"{zone_name}_Support"

    if assigned_handler and target_node:
        bf_result = router.run(source=source_node, destination=target_node)
        if bf_result["success"] and bf_result["is_reachable"]:
            route_nodes = [atm_id if n == source_node else n for n in bf_result["shortest_path"]]
            route_cost = bf_result["total_cost"]
        else:
            route_nodes = [atm_id, "VALIDATION_ENGINE", "CLASSIFICATION_ENGINE", "ROUTING_ENGINE", zone_node, team_node, target_node]
            route_cost = 10.0
    else:
        route_nodes = [atm_id, "VALIDATION_ENGINE", "CLASSIFICATION_ENGINE", "ROUTING_ENGINE", zone_node, team_node, "WAITING_QUEUE"]
        route_cost = 7.0
        bf_result = {"algorithm": "Bellman-Ford", "status": "Enqueued", "total_cost": 7.0}

    route_str = " -> ".join(route_nodes)
    final_status = "Assigned" if assigned_handler else "Pending"

    return {
        "success": True,
        "routing_type": "REGIONAL_DISPATCH",
        "prefix": prefix,
        "zone_id": zone_id,
        "zone_name": zone_name,
        "routing_destination": assigned_team,
        "assigned_team": assigned_team,
        "assigned_handler": assigned_handler["employee_id"] if assigned_handler else None,
        "handler_name": assigned_handler["name"] if assigned_handler else "Unassigned (Waiting Queue)",
        "is_backup_used": is_backup_used,
        "escalation_authority": escalation_auth,
        "route": route_str,
        "route_nodes": route_nodes,
        "route_cost": route_cost,
        "status": final_status,
        "routing_reason": routing_reason,
        "bellman_ford": bf_result
    }

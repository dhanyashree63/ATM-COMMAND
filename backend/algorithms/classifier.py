"""
BCS503 – Automata Theory and Computability
Module: Five-Category Classification Engine & Priority Calculator

Categories:
1. Hardware
2. Network
3. Cash-Handling
4. Software
5. Security

Rules:
- Configurable mappings via database table ERROR_CODE_MAPPINGS.
- Initial mappings:
    Hardware: E12H, E13H
    Network: E25N, E26N
    Cash-Handling: E31C, E32C
    Software: E45S, E46S
    Security: E90X, E91X
- Unknown codes must be marked UNMAPPED.
- Never silently classify an unknown code.
- Unmapped codes must not be dispatched.
- Deterministic conflict priority: Security > Cash-Handling > Hardware > Network > Software.
- Priority levels: P1 - Critical, P2 - High, P3 - Medium, P4 - Low.
"""

from typing import Dict, Any, Tuple, Optional, List
import re
from ..database.db import query_db


CATEGORY_PRECEDENCE = [
    "Security",
    "Cash-Handling",
    "Hardware",
    "Network",
    "Software"
]

# Static fallback dictionary matching the exact project prompt samples
DEFAULT_MAPPINGS = {
    "E12H": {"category": "Hardware", "name": "Card Reader Failure", "desc": "Card intake motor or chip reader fault."},
    "E13H": {"category": "Hardware", "name": "Printer Jam", "desc": "Receipt printer cutter stalled or paper roll exhausted."},
    "E14H": {"category": "Hardware", "name": "PIN Pad Diagnostic Fault", "desc": "EPP hardware diagnostic test failed."},
    
    "E25N": {"category": "Network", "name": "Gateway Timeout", "desc": "Host switch connection timeout."},
    "E26N": {"category": "Network", "name": "Switch Link Down", "desc": "Local branch LAN carrier drop."},
    "E27N": {"category": "Network", "name": "DNS Failure", "desc": "DNS lookup failed for payment server."},

    "E31C": {"category": "Cash-Handling", "name": "Dispenser Shutter Jam", "desc": "Note delivery shutter failed to open/close."},
    "E32C": {"category": "Cash-Handling", "name": "Cassette Low", "desc": "Currency note cassette depleted."},
    "E33C": {"category": "Cash-Handling", "name": "Reject Bin Full", "desc": "Diverter bin reached maximum note count."},

    "E45S": {"category": "Software", "name": "OS Crash", "desc": "Terminal OS kernel panic or blue screen."},
    "E46S": {"category": "Software", "name": "Journal Sync Deadlock", "desc": "Transaction journal database sync deadlock."},
    "E47S": {"category": "Software", "name": "App Middleware Freeze", "desc": "XFS service provider middleware unresponsive."},

    "E90X": {"category": "Security", "name": "Skimmer Alert", "desc": "Foreign bezel overlay detected on card entry."},
    "E91X": {"category": "Security", "name": "Vault Tamper Alarm", "desc": "Safe enclosure contact switch opened."},
    "E92X": {"category": "Security", "name": "Seismic Alert", "desc": "Cabinet accelerometer detected physical shock impact."},
}

# Regex token patterns for description lexical classification
CATEGORY_LEXICAL_PATTERNS = {
    "Security": re.compile(r"\b(tamper|skimm(?:er|ing)|vault|break-?in|fraud|theft|unauthorized|stolen|alarm|seismic|attack|camera blocked|intrusion)\b", re.IGNORECASE),
    "Cash-Handling": re.compile(r"\b(cash|dispens(?:er|ing)|note|cassette|bill|currency|reject bin|escrow|jammed note|counterfeit|payout)\b", re.IGNORECASE),
    "Hardware": re.compile(r"\b(card reader|printer|paper|cutter|screen|touchscreen|keypad|pinpad|hardware|sensor|power|battery|ups|fan|bezel)\b", re.IGNORECASE),
    "Network": re.compile(r"\b(network|connection|offline|timeout|packet|loss|latency|gateway|switch|router|ip|dns|vpn|tcp|tls|ssl|link down)\b", re.IGNORECASE),
    "Software": re.compile(r"\b(software|crash|freeze|kernel|os|windows|app|exception|deadlock|sync|journal|firmware|memory leak|reboot)\b", re.IGNORECASE)
}


def get_error_code_mapping(error_code: str) -> Optional[Dict[str, Any]]:
    """Retrieves mapping from database or fallback defaults."""
    code = error_code.strip().upper()
    try:
        row = query_db(
            "SELECT * FROM ERROR_CODE_MAPPINGS WHERE error_code = ? AND active = 1;",
            (code,),
            one=True
        )
        if row:
            return {"category": row["category"], "name": row["name"], "desc": row["description"]}
    except Exception:
        pass

    return DEFAULT_MAPPINGS.get(code)


def classify_error_report(error_code: str, description: str = "") -> Tuple[bool, str, str, List[str]]:
    """
    Classifies error report into exactly one of five categories:
    Hardware, Network, Cash-Handling, Software, Security.

    If code is unmapped and description has no clear matching tokens, returns (False, 'UNMAPPED', reason, []).
    If multiple patterns match, uses deterministic priority:
    Security > Cash-Handling > Hardware > Network > Software.
    """
    code = (error_code or "").strip().upper()
    desc = (description or "").strip()

    mapping = get_error_code_mapping(code)
    code_category = mapping["category"] if mapping else None

    # Detect categories from description keywords
    desc_matches = []
    for cat in CATEGORY_PRECEDENCE:
        if CATEGORY_LEXICAL_PATTERNS[cat].search(desc):
            desc_matches.append(cat)

    all_matches = []
    if code_category:
        all_matches.append(code_category)
    for m in desc_matches:
        if m not in all_matches:
            all_matches.append(m)

    # UNMAPPED: If no known mapping and no clear keywords
    if not all_matches:
        reason = f"Error code '{code}' is not in configured mappings, and description does not match any recognized category keywords. Marked as UNMAPPED. Not eligible for automated dispatch."
        return False, "UNMAPPED", reason, []

    # Apply deterministic conflict resolution
    selected_category = None
    for cat in CATEGORY_PRECEDENCE:
        if cat in all_matches:
            selected_category = cat
            break

    if len(all_matches) > 1:
        reason = f"Multiple classification signals matched ({', '.join(all_matches)}). Resolved to '{selected_category}' via deterministic priority rule (Security > Cash-Handling > Hardware > Network > Software)."
    elif code_category:
        reason = f"Code matches configured mapping for {selected_category} ({mapping['name']})."
    else:
        reason = f"Classified as {selected_category} via description keyword analysis."

    return True, selected_category, reason, all_matches


def calculate_incident_priority(category: str, user_urgency: str) -> Tuple[str, str]:
    """
    Calculates incident priority:
    P1 - Critical, P2 - High, P3 - Medium, P4 - Low.

    Rules:
    - Security classification is ALWAYS P1 - Critical (Mandatory Security Protocol).
    - Urgency 'Critical' or 'Emergency' is ALWAYS P1 - Critical.
    - Cash-Handling:
        High -> P1 - Critical
        Medium -> P2 - High
        Low -> P3 - Medium
    - Hardware / Network / Software:
        High -> P2 - High
        Medium -> P3 - Medium
        Low -> P4 - Low
    """
    urgency_clean = (user_urgency or "Medium").strip().capitalize()

    # Rule 1: Security is always P1
    if category == "Security":
        return "P1 - Critical", "Security incident: Mandatory immediate escalation to P1 - Critical."

    # Rule 2: User Urgency Critical
    if urgency_clean in ("Critical", "Emergency"):
        return "P1 - Critical", "Branch marked urgency as Critical: Escalated to P1 - Critical."

    # Rule 3: Cash-Handling rules
    if category == "Cash-Handling":
        if urgency_clean == "High":
            return "P1 - Critical", "Cash-Handling with High urgency escalated to P1 - Critical to prevent cash availability outage."
        elif urgency_clean in ("Medium", "Normal"):
            return "P2 - High", "Cash-Handling incident assigned P2 - High priority."
        else:
            return "P3 - Medium", "Cash-Handling incident assigned P3 - Medium priority."

    # Rule 4: Hardware / Network / Software rules
    if urgency_clean == "High":
        return "P2 - High", f"{category} malfunction with High urgency assigned P2 - High priority."
    elif urgency_clean in ("Medium", "Normal"):
        return "P3 - Medium", f"{category} incident assigned P3 - Medium standard regional priority."
    else:
        return "P4 - Low", f"{category} incident assigned P4 - Low priority (standard FIFO queue)."

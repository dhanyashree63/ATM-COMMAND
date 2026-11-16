"""
ATM COMMAND CENTER
Database Seeder for Karnataka ATM Support Infrastructure
"""

import datetime
from .db import get_db_connection, init_db


def seed_database(force: bool = False):
    """Initializes and seeds database with Karnataka banking zones, handlers, and mappings."""
    init_db()

    with get_db_connection() as conn:
        cur = conn.cursor()

        # Check if already seeded
        cur.execute("SELECT COUNT(*) FROM ZONES;")
        if cur.fetchone()[0] > 0 and not force:
            return

        if force:
            cur.execute("DELETE FROM ASSIGNMENTS;")
            cur.execute("DELETE FROM REPORT_HISTORY;")
            cur.execute("DELETE FROM ATM_REPORTS;")
            cur.execute("DELETE FROM NETWORK_EDGES;")
            cur.execute("DELETE FROM NETWORK_NODES;")
            cur.execute("DELETE FROM HANDLERS;")
            cur.execute("DELETE FROM ROUTING_TABLE;")
            cur.execute("DELETE FROM ERROR_CODE_MAPPINGS;")
            cur.execute("DELETE FROM ZONES;")
            cur.execute("DELETE FROM USERS;")

        # 1. Seed USERS
        users = [
            ("Admin Officer", "admin@atmcommand.bank", "pbkdf2:sha256:admin", "admin"),
            ("Bangalore Ops Lead", "ops.blr@atmcommand.bank", "pbkdf2:sha256:operator", "operator"),
            ("Karnataka Dispatch Supervisor", "dispatch@atmcommand.bank", "pbkdf2:sha256:supervisor", "admin")
        ]
        cur.executemany("INSERT INTO USERS (name, email, password_hash, role) VALUES (?, ?, ?, ?);", users)

        # 2. Seed 4 Karnataka Support Zones
        zones = [
            (1, "Bangalore", "Bangalore", "South Karnataka", 1),
            (2, "Mysore", "Mysore", "South Karnataka", 1),
            (3, "Mangaluru", "Mangaluru", "Coastal Karnataka", 1),
            (4, "Hubballi", "Hubballi", "North Karnataka", 1),
        ]
        cur.executemany("INSERT INTO ZONES (id, zone_name, city, region, active) VALUES (?, ?, ?, ?, ?);", zones)

        # 3. Seed Routing Table (Prefix to Karnataka Zone mappings)
        # Prefixes: BLR, BNG -> Bangalore; MYS -> Mysore; MNG, MLR -> Mangaluru; HUB -> Hubballi
        routing_entries = [
            ("BLR", 1, "Bangalore Support", "Bangalore Backup", "Bangalore Regional Manager", 1),
            ("BNG", 1, "Bangalore Support", "Bangalore Backup", "Bangalore Regional Manager", 1),
            ("MYS", 2, "Mysore Support", "Mysore Backup", "Mysore Regional Manager", 1),
            ("MNG", 3, "Mangaluru Support", "Mangaluru Backup", "Mangaluru Regional Manager", 1),
            ("MLR", 3, "Mangaluru Support", "Mangaluru Backup", "Mangaluru Regional Manager", 1),
            ("HUB", 4, "Hubballi Support", "Hubballi Backup", "Hubballi Regional Manager", 1),
        ]
        cur.executemany(
            """INSERT INTO ROUTING_TABLE (prefix, zone_id, primary_team, backup_team, escalation_authority, active)
               VALUES (?, ?, ?, ?, ?, ?);""",
            routing_entries
        )

        # 4. Seed Configurable Error Code Mappings (BCS503 Section 8)
        error_mappings = [
            # Hardware
            ("E12H", "Hardware", "Card Reader Transport Failure", "Magnetic stripe/EMV chip card intake mechanism stalled.", 1),
            ("E13H", "Hardware", "Thermal Receipt Printer Jam", "Paper cutter stalled or paper roll exhausted in terminal.", 1),
            ("E14H", "Hardware", "Encrypted PIN Pad Diagnostic Fault", "Cryptographic key store self-test diagnostic failure.", 1),
            
            # Network
            ("E25N", "Network", "Payment Gateway Timeout", "No response from core banking host switch within 15000ms.", 1),
            ("E26N", "Network", "Branch Switch Link Down", "Local Ethernet LAN interface carrier signal lost.", 1),
            ("E27N", "Network", "DNS Resolution Failure", "Unable to resolve banking host domain names on corporate WAN.", 1),

            # Cash-Handling
            ("E31C", "Cash-Handling", "Cash Dispenser Shutter Jam", "Dispenser exit shutter failed to close or open smoothly.", 1),
            ("E32C", "Cash-Handling", "Primary Cassette Low / Empty", "Cassette 1 currency notes depleted below dispense minimum.", 1),
            ("E33C", "Cash-Handling", "Reject Diverter Bin Full", "Counterfeit or unreadable note diverter vault reached capacity.", 1),

            # Software
            ("E45S", "Software", "ATM OS Kernel Panic / Crash", "Terminal operating system encountered unhandled fatal exception.", 1),
            ("E46S", "Software", "Transaction Journal Sync Deadlock", "Local journal sqlite database lock contention with host sync.", 1),
            ("E47S", "Software", "Client App Middleware Unresponsive", "WOSA/XFS middleware layer stopped responding to IPC calls.", 1),

            # Security
            ("E90X", "Security", "Anti-Skimmer Sensor Triggered", "Foreign electromagnetic overlay detected at card insertion slot.", 1),
            ("E91X", "Security", "Vault Door Tamper Alarm", "Safe enclosure magnetic contact switch breached without supervisory key.", 1),
            ("E92X", "Security", "Cabinet Seismic Shock Alert", "Vibration sensor detected physical drill/hammer impact on chassis.", 1),
        ]
        cur.executemany(
            """INSERT INTO ERROR_CODE_MAPPINGS (error_code, category, name, description, active)
               VALUES (?, ?, ?, ?, ?);""",
            error_mappings
        )

        # 5. Seed Regional Support Personnel and Teams
        handlers_data = [
            # Bangalore (Zone 1)
            ("EMP-BLR-01", "Rajesh Rao", "Bangalore Support", "Bangalore", "Hardware,Network,Cash-Handling,Software", 1, 5, 0),
            ("EMP-BLR-02", "Sneha Hegde", "Bangalore Support", "Bangalore", "Cash-Handling,Hardware", 1, 4, 0),
            ("EMP-BLR-03", "Chetan Kumar", "Bangalore Backup", "Bangalore", "Hardware,Network,Cash-Handling,Software", 1, 5, 0),

            # Mysore (Zone 2)
            ("EMP-MYS-01", "Ananya Urs", "Mysore Support", "Mysore", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),
            ("EMP-MYS-02", "Pradeep Gowda", "Mysore Backup", "Mysore", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),

            # Mangaluru (Zone 3)
            ("EMP-MNG-01", "Ashwin D'Souza", "Mangaluru Support", "Mangaluru", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),
            ("EMP-MNG-02", "Divya Bhat", "Mangaluru Backup", "Mangaluru", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),

            # Hubballi (Zone 4)
            ("EMP-HUB-01", "Manjunath Patil", "Hubballi Support", "Hubballi", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),
            ("EMP-HUB-02", "Sharanappa Bellad", "Hubballi Backup", "Hubballi", "Hardware,Network,Cash-Handling,Software", 1, 4, 0),

            # Central Teams
            ("EMP-SEC-01", "Vikramaditya Kulkarni", "Central Security Desk", "Central", "Security", 1, 30, 0),
            ("EMP-SEC-02", "Sunita Verma", "Central Security Desk", "Central", "Security", 1, 30, 0),
            ("EMP-REV-01", "Central Dispatch Supervisor", "Central Routing Review", "Central", "Hardware,Network,Cash-Handling,Software,Security", 1, 50, 0),
        ]
        cur.executemany(
            """INSERT INTO HANDLERS (employee_id, name, team, zone, supported_categories, availability, capacity, current_load)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?);""",
            handlers_data
        )

        # 6. Seed Network Nodes
        nodes_data = [
            # ATM Sources
            ("ATMBLR1234", "ATM BLR 1234 (MG Road Bangalore)", "atm", "Bangalore"),
            ("ATMMYS1234", "ATM MYS 1234 (Sayyaji Rao Road Mysore)", "atm", "Mysore"),
            ("ATMMNG1234", "ATM MNG 1234 (Hampankatta Mangaluru)", "atm", "Mangaluru"),
            ("ATMHUB1234", "ATM HUB 1234 (Koppikar Road Hubballi)", "atm", "Hubballi"),
            ("ATM_SOURCE", "Generic Branch ATM Terminal", "atm", "Karnataka"),

            # Engines
            ("VALIDATION_ENGINE", "DFA & Regex Validation Engine", "engine", "Central"),
            ("CLASSIFICATION_ENGINE", "Five-Category Classification Engine", "engine", "Central"),
            ("ROUTING_ENGINE", "Karnataka Network Routing Engine", "engine", "Central"),

            # Regional Zones
            ("Zone_Bangalore", "Bangalore Zone Controller", "zone", "Bangalore"),
            ("Zone_Mysore", "Mysore Zone Controller", "zone", "Mysore"),
            ("Zone_Mangaluru", "Mangaluru Zone Controller", "zone", "Mangaluru"),
            ("Zone_Hubballi", "Hubballi Zone Controller", "zone", "Hubballi"),

            # Primary and Backup Teams
            ("Bangalore_Support", "Bangalore Support Team (Primary)", "support_team", "Bangalore"),
            ("Bangalore_Backup", "Bangalore Backup Team (Secondary)", "support_team", "Bangalore"),
            ("Mysore_Support", "Mysore Support Team (Primary)", "support_team", "Mysore"),
            ("Mysore_Backup", "Mysore Backup Team (Secondary)", "support_team", "Mysore"),
            ("Mangaluru_Support", "Mangaluru Support Team (Primary)", "support_team", "Mangaluru"),
            ("Mangaluru_Backup", "Mangaluru Backup Team (Secondary)", "support_team", "Mangaluru"),
            ("Hubballi_Support", "Hubballi Support Team (Primary)", "support_team", "Hubballi"),
            ("Hubballi_Backup", "Hubballi Backup Team (Secondary)", "support_team", "Hubballi"),

            # Handlers
            ("EMP-BLR-01", "Rajesh Rao (Bangalore)", "handler", "Bangalore"),
            ("EMP-BLR-03", "Chetan Kumar (Bangalore Backup)", "handler", "Bangalore"),
            ("EMP-MYS-01", "Ananya Urs (Mysore)", "handler", "Mysore"),
            ("EMP-MYS-02", "Pradeep Gowda (Mysore Backup)", "handler", "Mysore"),
            ("EMP-MNG-01", "Ashwin D'Souza (Mangaluru)", "handler", "Mangaluru"),
            ("EMP-MNG-02", "Divya Bhat (Mangaluru Backup)", "handler", "Mangaluru"),
            ("EMP-HUB-01", "Manjunath Patil (Hubballi)", "handler", "Hubballi"),
            ("EMP-HUB-02", "Sharanappa Bellad (Hubballi Backup)", "handler", "Hubballi"),

            # Central Desks
            ("Central_Security_Desk", "Central Security Desk (Emergency Override)", "central_desk", "Central"),
            ("EMP-SEC-01", "Vikramaditya Kulkarni (Security)", "handler", "Central"),
            ("Central_Routing_Review", "Central Routing Review (Unmapped Fallback)", "central_desk", "Central"),
            ("EMP-REV-01", "Central Dispatch Supervisor", "handler", "Central")
        ]
        cur.executemany("INSERT INTO NETWORK_NODES (node_id, node_name, node_type, zone) VALUES (?, ?, ?, ?);", nodes_data)

        # 7. Seed Directed Weighted Edges (Response latency & transit cost in minutes)
        edges_data = [
            # Ingestion pipeline
            ("E_ATM_VAL", "ATM_SOURCE", "VALIDATION_ENGINE", 1.0),
            ("E_BLR_VAL", "ATMBLR1234", "VALIDATION_ENGINE", 1.0),
            ("E_MYS_VAL", "ATMMYS1234", "VALIDATION_ENGINE", 1.0),
            ("E_MNG_VAL", "ATMMNG1234", "VALIDATION_ENGINE", 1.0),
            ("E_HUB_VAL", "ATMHUB1234", "VALIDATION_ENGINE", 1.0),

            ("E_VAL_CLASS", "VALIDATION_ENGINE", "CLASSIFICATION_ENGINE", 0.5),
            ("E_CLASS_ROUTE", "CLASSIFICATION_ENGINE", "ROUTING_ENGINE", 0.5),

            # SECURITY DIRECT OVERRIDE (Rule 11: Bypasses ALL regional support teams)
            ("E_CLASS_SEC", "CLASSIFICATION_ENGINE", "Central_Security_Desk", 1.0),
            ("E_SEC_HND", "Central_Security_Desk", "EMP-SEC-01", 0.5),

            # UNMAPPED PREFIX FALLBACK (Section 12.A: Central Routing Review)
            ("E_ROUTE_REV", "ROUTING_ENGINE", "Central_Routing_Review", 2.0),
            ("E_REV_HND", "Central_Routing_Review", "EMP-REV-01", 1.0),

            # REGIONAL ROUTING PATHS
            # Bangalore
            ("E_ROUTE_BLR", "ROUTING_ENGINE", "Zone_Bangalore", 2.0),
            ("E_BLR_PRI", "Zone_Bangalore", "Bangalore_Support", 3.0),
            ("E_BLR_BAK", "Zone_Bangalore", "Bangalore_Backup", 5.5),
            ("E_PRI_HBLR1", "Bangalore_Support", "EMP-BLR-01", 2.5),
            ("E_BAK_HBLR3", "Bangalore_Backup", "EMP-BLR-03", 3.0),

            # Mysore
            ("E_ROUTE_MYS", "ROUTING_ENGINE", "Zone_Mysore", 2.5),
            ("E_MYS_PRI", "Zone_Mysore", "Mysore_Support", 3.5),
            ("E_MYS_BAK", "Zone_Mysore", "Mysore_Backup", 6.0),
            ("E_PRI_HMYS1", "Mysore_Support", "EMP-MYS-01", 3.0),
            ("E_BAK_HMYS2", "Mysore_Backup", "EMP-MYS-02", 3.5),

            # Mangaluru
            ("E_ROUTE_MNG", "ROUTING_ENGINE", "Zone_Mangaluru", 2.8),
            ("E_MNG_PRI", "Zone_Mangaluru", "Mangaluru_Support", 4.0),
            ("E_MNG_BAK", "Zone_Mangaluru", "Mangaluru_Backup", 6.5),
            ("E_PRI_HMNG1", "Mangaluru_Support", "EMP-MNG-01", 3.0),
            ("E_BAK_HMNG2", "Mangaluru_Backup", "EMP-MNG-02", 3.5),

            # Hubballi
            ("E_ROUTE_HUB", "ROUTING_ENGINE", "Zone_Hubballi", 3.0),
            ("E_HUB_PRI", "Zone_Hubballi", "Hubballi_Support", 4.0),
            ("E_HUB_BAK", "Zone_Hubballi", "Hubballi_Backup", 6.5),
            ("E_PRI_HHUB1", "Hubballi_Support", "EMP-HUB-01", 3.0),
            ("E_BAK_HHUB2", "Hubballi_Backup", "EMP-HUB-02", 3.5),
        ]
        cur.executemany("INSERT INTO NETWORK_EDGES (edge_id, source_node, destination_node, weight) VALUES (?, ?, ?, ?);", edges_data)

        # 8. Seed Sample Historical Reports for Command Center Dashboard
        now = datetime.datetime.now()
        reports_sample = [
            (
                "REP-100201", "Praveen Rao", "MG Road Branch", "+91 98450 11223", "praveen.rao@bank.com",
                "ATMBLR1234", "E31C", "Cash shutter door stuck midway during customer dispensing cycle.",
                "High", "Cash-Handling", "Matches configured Cash-Handling code E31C",
                "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                "P1 - Critical", 1, "Bangalore", "Bangalore Support", "EMP-BLR-01", "Bangalore Support",
                "ATMBLR1234 -> VALIDATION_ENGINE -> CLASSIFICATION_ENGINE -> ROUTING_ENGINE -> Zone_Bangalore -> Bangalore_Support -> EMP-BLR-01",
                9.5, "In Progress", None,
                (now - datetime.timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            (
                "REP-100202", "Archana Murthy", "Jayalakshmipuram Branch", "+91 94480 33445", "archana.m@bank.com",
                "ATMMYS1234", "E12H", "Card reader motor grinding noise; chip cards rejected upon insert.",
                "Medium", "Hardware", "Matches configured Hardware code E12H",
                "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                "P3 - Medium", 2, "Mysore", "Mysore Support", "EMP-MYS-01", "Mysore Support",
                "ATMMYS1234 -> VALIDATION_ENGINE -> CLASSIFICATION_ENGINE -> ROUTING_ENGINE -> Zone_Mysore -> Mysore_Support -> EMP-MYS-01",
                11.0, "Assigned", None,
                (now - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
                (now - datetime.timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            (
                "REP-100203", "Kishore Shenoy", "Hampankatta Branch", "+91 97410 55667", "kishore.s@bank.com",
                "ATMMNG1234", "E90X", "Foreign skimmer bezel device detected over card slot by optical sensor.",
                "Critical", "Security", "Matches configured Security code E90X (Security Override Triggered)",
                "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                "P1 - Critical", 3, "Mangaluru", "Central Security Desk", "EMP-SEC-01", "Central Security Desk",
                "ATMMNG1234 -> VALIDATION_ENGINE -> CLASSIFICATION_ENGINE -> Central_Security_Desk -> EMP-SEC-01",
                3.0, "In Progress", None,
                (now - datetime.timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
                (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            (
                "REP-100204", "Basavaraj G", "Vidyanagar Hubballi Branch", "+91 99000 77889", "basavaraj.g@bank.com",
                "ATMHUB1234", "E25N", "Host switch response timeout on corporate WAN link.",
                "High", "Network", "Matches configured Network code E25N",
                "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                "P2 - High", 4, "Hubballi", "Hubballi Support", "EMP-HUB-01", "Hubballi Support",
                "ATMHUB1234 -> VALIDATION_ENGINE -> CLASSIFICATION_ENGINE -> ROUTING_ENGINE -> Zone_Hubballi -> Hubballi_Support -> EMP-HUB-01",
                12.0, "Resolved", "Branch network interface restarted; latency returned to 14ms.",
                (now - datetime.timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
                (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            (
                "REP-100205", "Rashmi Nayak", "Kadur Branch", "+91 98800 22334", "rashmi.n@bank.com",
                "ATMBLR1234", "E45S", "Operating system blue screen crash during cash withdrawal transaction.",
                "Medium", "Software", "Matches configured Software code E45S",
                "Accepted at q10", "Matched ^ATM[A-Z]{3}[0-9]{4}$", "PASSED",
                "P3 - Medium", 1, "Bangalore", "Bangalore Support", "EMP-BLR-01", "Bangalore Support",
                "ATMBLR1234 -> VALIDATION_ENGINE -> CLASSIFICATION_ENGINE -> ROUTING_ENGINE -> Zone_Bangalore -> Bangalore_Support -> EMP-BLR-01",
                9.5, "Resolved", "Client OS rebooted and XFS stack re-initialized successfully.",
                (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
                (now - datetime.timedelta(hours=18)).strftime("%Y-%m-%d %H:%M:%S")
            )
        ]

        cur.executemany(
            """INSERT INTO ATM_REPORTS (
                report_id, reporter_name, branch, contact, email,
                atm_id, error_code, description, urgency, category,
                classification_reason, dfa_result, regex_result, validation_status,
                priority, zone_id, zone_name, routing_destination,
                assigned_handler, assigned_team, route, route_cost,
                status, resolution_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);""",
            reports_sample
        )

        # Set handler initial loads for active reports
        cur.execute("UPDATE HANDLERS SET current_load = 1 WHERE employee_id IN ('EMP-BLR-01', 'EMP-MYS-01', 'EMP-SEC-01');")

        # Initial assignments & audit log
        assignments = [
            ("ASN-100201", "REP-100201", "EMP-BLR-01", "Bangalore Support", "ATMBLR1234 -> Bangalore_Support -> EMP-BLR-01", "P1 - Critical", "Active", (now - datetime.timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S")),
            ("ASN-100202", "REP-100202", "EMP-MYS-01", "Mysore Support", "ATMMYS1234 -> Mysore_Support -> EMP-MYS-01", "P3 - Medium", "Active", (now - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")),
            ("ASN-100203", "REP-100203", "EMP-SEC-01", "Central Security Desk", "ATMMNG1234 -> Central_Security_Desk -> EMP-SEC-01", "P1 - Critical", "Active", (now - datetime.timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")),
            ("ASN-100204", "REP-100204", "EMP-HUB-01", "Hubballi Support", "ATMHUB1234 -> Hubballi_Support -> EMP-HUB-01", "P2 - High", "Completed", (now - datetime.timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S")),
        ]
        cur.executemany("INSERT INTO ASSIGNMENTS (assignment_id, report_id, handler_id, team, route, priority, status, assigned_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", assignments)

        history_rows = [
            ("REP-100201", "Submitted", "Assigned", "Auto-Dispatcher", "Assigned to primary team Bangalore Support", (now - datetime.timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100201", "Assigned", "In Progress", "Rajesh Rao", "Engineer en-route to MG Road Branch", (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100202", "Submitted", "Assigned", "Auto-Dispatcher", "Assigned to primary team Mysore Support", (now - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100203", "Submitted", "Assigned", "Security Dispatch Protocol", "Direct dispatch to Central Security Desk (Bypassed regional teams)", (now - datetime.timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100203", "Assigned", "In Progress", "Vikramaditya Kulkarni", "Lockdown command initiated; local police alerted", (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100204", "Submitted", "Assigned", "Auto-Dispatcher", "Assigned to Hubballi Support", (now - datetime.timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S")),
            ("REP-100204", "Assigned", "Resolved", "Manjunath Patil", "Interface rebooted and verified online", (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")),
        ]
        cur.executemany("INSERT INTO REPORT_HISTORY (report_id, previous_status, new_status, updated_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?);", history_rows)

        conn.commit()


if __name__ == "__main__":
    seed_database(force=True)
    print("Database seeded with Karnataka ATM Command Center data successfully.")

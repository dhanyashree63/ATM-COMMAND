"""
ATM COMMAND CENTER
Intelligent ATM Incident Management & Dispatch Platform
Unified Entry Point Runner
"""

import os
import sys

# Ensure project root is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from backend.app import app
from backend.database.seed_data import seed_database

if __name__ == "__main__":
    print("==========================================================")
    print("  ATM COMMAND CENTER - KARNATAKA SUPPORT GRID")
    print("  BCS503: Automata Theory & Computability (DFA & Regex)")
    print("  BCS502: Computer Networks (Bellman-Ford & Dispatch)")
    print("==========================================================")
    print("  Initializing SQLite database & Karnataka routing table...")
    seed_database()
    print("  Server running at: http://127.0.0.1:5000")
    print("  REST APIs available at: http://127.0.0.1:5000/api")
    print("==========================================================")
    app.run(host="0.0.0.0", port=5000, debug=True)

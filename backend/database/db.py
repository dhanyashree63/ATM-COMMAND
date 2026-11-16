"""
Database helper module for SQLite connection and queries.
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "atm_dispatcher.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection with row factory enabled for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initializes SQLite tables if they do not exist."""
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    with get_db_connection() as conn:
        conn.executescript(schema_sql)
        conn.commit()


def query_db(query: str, args: tuple = (), one: bool = False) -> Any:
    """Helper to query database and return dictionary representations."""
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        r = cur.fetchall()
        if one:
            return dict(r[0]) if r else None
        return [dict(row) for row in r]


def execute_db(query: str, args: tuple = ()) -> int:
    """Helper to execute an INSERT/UPDATE/DELETE query and return lastrowid or affected rows."""
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        conn.commit()
        return cur.rowcount

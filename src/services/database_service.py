import sqlite3
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import os

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for database operations"""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._ensure_directory()
        self._init_db()

    def _ensure_directory(self):
        """Ensure database directory exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

    def _get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """Initialize database tables"""
        conn = self._get_connection()
        cursor = conn.cursor()

        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                preferred_currency TEXT DEFAULT 'usd',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Portfolio table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                coin_id TEXT,
                amount REAL,
                purchase_price REAL,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')

        # Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                coin_id TEXT,
                target_price REAL,
                condition TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')

        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")

    # User operations
    def add_user(self, user_id: int, username: str = None, first_name: str = None, last_name: str = None):
        """Add or update user"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO users (user_id, username, first_name, last_name)
            VALUES (?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name))
        conn.commit()
        conn.close()

    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                'user_id': row[0],
                'username': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'preferred_currency': row[4],
                'created_at': row[5]
            }
        return None

    # Portfolio operations
    def add_portfolio_item(self, user_id: int, coin_id: str, amount: float, purchase_price: float):
        """Add item to portfolio"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO portfolio (user_id, coin_id, amount, purchase_price)
            VALUES (?, ?, ?, ?)
        ''', (user_id, coin_id, amount, purchase_price))
        conn.commit()
        conn.close()

    def get_portfolio(self, user_id: int) -> List[Dict]:
        """Get user's portfolio"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, coin_id, amount, purchase_price, purchase_date
            FROM portfolio
            WHERE user_id = ?
            ORDER BY purchase_date DESC
        ''', (user_id,))
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                'id': row[0],
                'coin_id': row[1],
                'amount': row[2],
                'purchase_price': row[3],
                'purchase_date': row[4]
            }
            for row in rows
        ]

    def remove_portfolio_item(self, item_id: int, user_id: int) -> bool:
        """Remove item from portfolio"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM portfolio WHERE id = ? AND user_id = ?', (item_id, user_id))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

    def clear_portfolio(self, user_id: int):
        """Clear user's portfolio"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM portfolio WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()

    # Alert operations
    def add_alert(self, user_id: int, coin_id: str, target_price: float, condition: str):
        """Add price alert"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO alerts (user_id, coin_id, target_price, condition)
            VALUES (?, ?, ?, ?)
        ''', (user_id, coin_id, target_price, condition))
        conn.commit()
        conn.close()

    def get_alerts(self, user_id: int) -> List[Dict]:
        """Get user's alerts"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, coin_id, target_price, condition, is_active, created_at
            FROM alerts
            WHERE user_id = ? AND is_active = 1
            ORDER BY created_at DESC
        ''', (user_id,))
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                'id': row[0],
                'coin_id': row[1],
                'target_price': row[2],
                'condition': row[3],
                'is_active': row[4],
                'created_at': row[5]
            }
            for row in rows
        ]

    def get_all_active_alerts(self) -> List[Tuple[int, Dict]]:
        """Get all active alerts with user IDs"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, id, coin_id, target_price, condition
            FROM alerts
            WHERE is_active = 1
        ''')
        rows = cursor.fetchall()
        conn.close()

        return [
            (row[0], {
                'id': row[1],
                'coin_id': row[2],
                'target_price': row[3],
                'condition': row[4]
            })
            for row in rows
        ]

    def deactivate_alert(self, alert_id: int, user_id: int) -> bool:
        """Deactivate an alert"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE alerts SET is_active = 0
            WHERE id = ? AND user_id = ?
        ''', (alert_id, user_id))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

    def remove_alert(self, alert_id: int, user_id: int) -> bool:
        """Remove an alert"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM alerts WHERE id = ? AND user_id = ?', (alert_id, user_id))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

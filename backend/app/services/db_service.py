import sqlite3
import json
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'market.db')
from app.data.stocks import STOCK_DICT

class DBService:
    def __init__(self):
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS company_cache (
                ticker TEXT PRIMARY KEY,
                summary_kr TEXT,
                details_json TEXT,
                last_updated TIMESTAMP
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS watchlist (
                ticker TEXT PRIMARY KEY,
                added_at TIMESTAMP
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS portfolio (
                ticker TEXT PRIMARY KEY,
                shares INTEGER,
                avg_price REAL,
                purchase_date TEXT,
                updated_at TIMESTAMP
            )
        ''')
        
        # Migration: Add purchase_date if not exists
        try:
            c.execute('ALTER TABLE portfolio ADD COLUMN purchase_date TEXT')
        except sqlite3.OperationalError:
            pass # Column likely exists
            
        conn.commit()
        conn.commit()
        conn.close()

    def get_company_cache(self, ticker: str):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT summary_kr, details_json, last_updated FROM company_cache WHERE ticker = ?', (ticker,))
        row = c.fetchone()
        conn.close()
        
        if row:
            return {
                "summary_kr": row[0],
                "details": json.loads(row[1]),
                "last_updated": row[2]
            }
        return None

    def save_company_cache(self, ticker: str, summary_kr: str, details: dict):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            INSERT OR REPLACE INTO company_cache (ticker, summary_kr, details_json, last_updated)
            VALUES (?, ?, ?, ?)
        ''', (ticker, summary_kr, json.dumps(details), datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def add_to_watchlist(self, ticker: str):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('INSERT OR IGNORE INTO watchlist (ticker, added_at) VALUES (?, ?)', (ticker, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def remove_from_watchlist(self, ticker: str):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('DELETE FROM watchlist WHERE ticker = ?', (ticker,))
        conn.commit()
        conn.close()

    def get_stock_name(self, ticker: str) -> str:
        # 1. Try STOCK_DICT
        stock = next((s for s in STOCK_DICT if s['ticker'] == ticker), None)
        if stock:
            return stock['name_kr']
            
        # 2. Try Cache
        cached = self.get_company_cache(ticker)
        if cached and 'details' in cached:
            return cached['details'].get('name', ticker)
            
        return ticker

    def get_watchlist(self):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT ticker FROM watchlist ORDER BY added_at DESC')
        rows = c.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            ticker = row[0]
            name = self.get_stock_name(ticker)
            result.append({"ticker": ticker, "name": name})
        return result

    def get_holdings(self):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT ticker, shares, avg_price, purchase_date FROM portfolio ORDER BY updated_at DESC')
        rows = c.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            ticker = row[0]
            name = self.get_stock_name(ticker)
            result.append({
                "ticker": ticker, 
                "name": name,
                "shares": row[1], 
                "avg_price": row[2], 
                "purchase_date": row[3]
            })
        return result

    def add_holding(self, ticker: str, shares: int, avg_price: float, purchase_date: str = None):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            INSERT OR REPLACE INTO portfolio (ticker, shares, avg_price, purchase_date, updated_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (ticker, shares, avg_price, purchase_date, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def remove_holding(self, ticker: str):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('DELETE FROM portfolio WHERE ticker = ?', (ticker,))
        conn.commit()
        conn.close()

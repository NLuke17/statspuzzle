#!/usr/bin/env python3
"""
Simple script to view database contents
Usage: python view_data.py
"""

import sqlite3
from datetime import datetime

def view_database():
    conn = sqlite3.connect('experiment.db')
    cursor = conn.cursor()
    
    # View Users
    print("=" * 80)
    print("USERS TABLE")
    print("=" * 80)
    cursor.execute("SELECT id, username, created_at FROM users")
    users = cursor.fetchall()
    if users:
        print(f"{'ID':<5} {'Username':<20} {'Created At':<30}")
        print("-" * 80)
        for user in users:
            print(f"{user[0]:<5} {user[1]:<20} {user[2]:<30}")
    else:
        print("No users yet.")
    print()
    
    # View Results
    print("=" * 80)
    print("RESULTS TABLE")
    print("=" * 80)
    cursor.execute("""
        SELECT id, username, solve_time, show_timer, completed_at 
        FROM results 
        ORDER BY completed_at DESC
    """)
    results = cursor.fetchall()
    if results:
        print(f"{'ID':<5} {'Username':<15} {'Time (ms)':<12} {'Show Timer':<12} {'Completed At':<30}")
        print("-" * 80)
        for result in results:
            timer_str = "Yes" if result[3] else "No"
            time_sec = result[2] / 1000
            print(f"{result[0]:<5} {result[1]:<15} {time_sec:<12.2f} {timer_str:<12} {result[4]:<30}")
    else:
        print("No results yet.")
    print()
    
    # Statistics
    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)
    
    cursor.execute("""
        SELECT 
            show_timer,
            COUNT(*) as count,
            AVG(solve_time) as avg_time,
            MIN(solve_time) as min_time,
            MAX(solve_time) as max_time
        FROM results
        GROUP BY show_timer
    """)
    stats = cursor.fetchall()
    
    if stats:
        for stat in stats:
            condition = "WITH timer" if stat[0] else "WITHOUT timer"
            print(f"\n{condition}:")
            print(f"  Count: {stat[1]}")
            print(f"  Average: {stat[2]/1000:.2f} seconds")
            print(f"  Min: {stat[3]/1000:.2f} seconds")
            print(f"  Max: {stat[4]/1000:.2f} seconds")
    else:
        print("No statistics available yet.")
    
    conn.close()

if __name__ == "__main__":
    try:
        view_database()
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
        print("Make sure the experiment.db file exists in the current directory.")



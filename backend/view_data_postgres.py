#!/usr/bin/env python3
"""
View PostgreSQL database contents
Usage: 
  # Local SQLite:
  python view_data.py
  
  # Remote PostgreSQL (Render):
  DATABASE_URL="your-postgres-url" python view_data_postgres.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Get database URL from environment or use SQLite default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./experiment.db")

# Handle postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    print("=" * 80)
    print("DATABASE CONTENTS")
    print("=" * 80)
    print(f"Connected to: {DATABASE_URL[:30]}...")
    print()
    
    # View Users
    print("=" * 80)
    print("USERS TABLE")
    print("=" * 80)
    result = session.execute(text("SELECT id, username, created_at FROM users ORDER BY id"))
    users = result.fetchall()
    
    if users:
        print(f"{'ID':<5} {'Username':<20} {'Created At':<30}")
        print("-" * 80)
        for user in users:
            print(f"{user[0]:<5} {user[1]:<20} {str(user[2]):<30}")
        print(f"\nTotal users: {len(users)}")
    else:
        print("No users yet.")
    print()
    
    # View Results
    print("=" * 80)
    print("RESULTS TABLE")
    print("=" * 80)
    result = session.execute(text("""
        SELECT id, username, solve_time, show_timer, completed_at 
        FROM results 
        ORDER BY completed_at DESC
    """))
    results = result.fetchall()
    
    if results:
        print(f"{'ID':<5} {'Username':<15} {'Time (sec)':<12} {'Show Timer':<12} {'Completed At':<30}")
        print("-" * 80)
        for r in results:
            timer_str = "Yes" if r[3] else "No"
            time_sec = r[2] / 1000
            print(f"{r[0]:<5} {r[1]:<15} {time_sec:<12.2f} {timer_str:<12} {str(r[4]):<30}")
        print(f"\nTotal results: {len(results)}")
    else:
        print("No results yet.")
    print()
    
    # Statistics
    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)
    
    result = session.execute(text("""
        SELECT 
            show_timer,
            COUNT(*) as count,
            AVG(solve_time) as avg_time,
            MIN(solve_time) as min_time,
            MAX(solve_time) as max_time
        FROM results
        GROUP BY show_timer
    """))
    stats = result.fetchall()
    
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
    print()
    
    # Check for paired data
    result = session.execute(text("""
        SELECT user_id, COUNT(*) as attempt_count
        FROM results
        GROUP BY user_id
        HAVING COUNT(*) = 2
    """))
    paired = result.fetchall()
    
    if paired:
        print("=" * 80)
        print(f"PAIRED DATA: {len(paired)} users completed both conditions")
        print("=" * 80)
    
    session.close()
    print("\n✅ Database query complete!\n")
    
except Exception as e:
    print(f"❌ Error connecting to database: {e}")
    print("\nMake sure DATABASE_URL is set correctly.")
    print("\nFor Render PostgreSQL:")
    print('  DATABASE_URL="postgresql://user:pass@host/db" python view_data_postgres.py')
    sys.exit(1)


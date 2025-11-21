#!/usr/bin/env python3
"""
Export database results to CSV
Usage: 
  DATABASE_URL="your-postgres-url" python export_csv.py
"""

import os
import sys
import csv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./experiment.db")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Fetch all results
    result = session.execute(text("""
        SELECT 
            r.id,
            r.username,
            r.solve_time,
            r.show_timer,
            r.completed_at,
            u.id as user_id
        FROM results r
        JOIN users u ON r.username = u.username
        ORDER BY r.completed_at
    """))
    
    results = result.fetchall()
    
    # Create CSV filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"experiment_results_{timestamp}.csv"
    
    # Write to CSV
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Header
        writer.writerow([
            'Result ID',
            'User ID', 
            'Username',
            'Solve Time (ms)',
            'Solve Time (sec)',
            'Show Timer',
            'Completed At'
        ])
        
        # Data
        for r in results:
            writer.writerow([
                r[0],  # result id
                r[5],  # user id
                r[1],  # username
                r[2],  # solve time in ms
                round(r[2] / 1000, 2),  # solve time in seconds
                'Yes' if r[3] else 'No',  # show timer
                r[4]   # completed at
            ])
    
    session.close()
    
    print(f"✅ Successfully exported {len(results)} results to {filename}")
    print(f"\nFile saved: {os.path.abspath(filename)}")
    print("\nYou can now open this file in Excel, Google Sheets, or R for analysis!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)


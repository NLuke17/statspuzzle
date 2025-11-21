#!/bin/bash

# Script to start both frontend and backend in development mode

echo "Starting Sliding Puzzle Experiment..."

# Start backend
echo "Starting backend on port 8000..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python main.py &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on port 3000..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "Services started successfully!"
echo "================================"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait



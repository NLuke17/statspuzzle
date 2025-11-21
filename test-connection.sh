#!/bin/bash

echo "================================"
echo "Connection Test"
echo "================================"
echo ""

# Test backend
echo "Testing backend on port 8000..."
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ Backend is running"
    curl -s http://localhost:8000
else
    echo "❌ Backend is NOT running"
    echo "   Start it with: cd backend && python main.py"
fi

echo ""

# Test frontend
echo "Testing frontend on port 3000..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is NOT running"
    echo "   Start it with: cd frontend && npm run dev"
fi

echo ""
echo "================================"
echo "Environment Check"
echo "================================"

# Check if .env.local exists
if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
    echo "   Contents:"
    cat frontend/.env.local
else
    echo "⚠️  frontend/.env.local not found"
    echo "   Creating it now..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
    echo "   Created! Restart frontend to apply."
fi

echo ""
echo "================================"



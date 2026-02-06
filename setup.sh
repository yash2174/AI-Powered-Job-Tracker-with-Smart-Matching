#!/bin/bash

echo "🚀 AI Job Tracker - Quick Start Setup"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Check for .env file
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "📝 IMPORTANT: Edit backend/.env and add your API keys:"
    echo "   - OPENAI_API_KEY (required for AI features)"
    echo "   - ADZUNA_APP_ID and ADZUNA_API_KEY (optional)"
    echo ""
    echo "Without API keys, the app will run with limited functionality."
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start backend:"
echo "   cd backend && npm start"
echo ""
echo "2. Start frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "Login credentials:"
echo "   Email: test@gmail.com"
echo "   Password: test@123"
echo ""
echo "🎉 Happy job hunting!"

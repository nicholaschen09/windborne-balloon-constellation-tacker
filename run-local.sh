#!/bin/bash

echo "Starting Windborne Balloon Tracker locally..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm not found. Using Python server instead..."
    python3 -m http.server 8000
else
    # Install dependencies if not already installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        echo ""
    fi

    # Start the development server
    echo "Starting development server on http://localhost:8000"
    npm run dev
fi
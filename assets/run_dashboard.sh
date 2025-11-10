#!/bin/bash
# 🌀 Helix v15.2 Dashboard Launcher
# Starts Streamlit dashboard on specified port
# Author: Claude Code + Andrew John Ward

PORT=${1:-8501}

echo "🌀 Starting Helix v15.2 Dashboard..."
echo "   Port: $PORT"
echo "   URL: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Install dependencies if needed
if ! command -v streamlit &> /dev/null; then
    echo "📦 Installing Streamlit..."
    pip install streamlit plotly pandas matplotlib
fi

# Launch dashboard
cd "$(dirname "$0")/.."
streamlit run dashboard/streamlit_app.py \
    --server.port=$PORT \
    --server.headless=true \
    --theme.base=dark \
    --theme.primaryColor="#8A2BE2" \
    --theme.backgroundColor="#1e1e1e" \
    --theme.secondaryBackgroundColor="#2e2e2e" \
    --theme.textColor="#ffffff"

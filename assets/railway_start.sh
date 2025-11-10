#!/bin/bash
# 🌀 Helix v15.2 Dashboard - Railway Startup Script
# Starts Streamlit dashboard optimized for Railway deployment
# Author: Claude Code + Andrew John Ward

echo "🌀 Starting Helix Dashboard on Railway..."
echo "   Port: $PORT"
echo ""

# Railway provides $PORT automatically
streamlit run dashboard/streamlit_app.py \
    --server.port=$PORT \
    --server.address=0.0.0.0 \
    --server.headless=true \
    --server.enableCORS=false \
    --server.enableXsrfProtection=true \
    --theme.base=dark \
    --theme.primaryColor="#8A2BE2" \
    --theme.backgroundColor="#1e1e1e" \
    --theme.secondaryBackgroundColor="#2e2e2e" \
    --theme.textColor="#ffffff" \
    --theme.font="sans serif"

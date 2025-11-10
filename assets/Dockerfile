# Helix Collective v14.5 - Backend Dockerfile (FIXED)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (only what exists in repo!)
COPY backend ./backend
COPY Shadow ./Shadow
COPY scripts ./scripts

# Create runtime directories (app will use these)
# The app creates these at startup, but we pre-create for safety
RUN mkdir -p Helix/state Helix/commands Helix/ethics Shadow/manus_archive

# Create default UCF state file
RUN echo '{"harmony":0.355,"resilience":0.82,"prana":0.67,"drishti":0.73,"klesha":0.24,"zoom":1.0}' > Helix/state/ucf_state.json

# Create default heartbeat file
RUN echo '{"timestamp":"2025-10-22T00:00:00Z","status":"initialized","phase":3}' > Helix/state/heartbeat.json

# Environment variables
ENV PYTHONUNBUFFERED=1

# Expose port (Railway will override with $PORT)
EXPOSE 8000

# Start application (app will create directories as needed)
CMD ["python", "backend/main.py"]

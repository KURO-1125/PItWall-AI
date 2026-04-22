#!/bin/bash
# Render startup script

# Use PORT environment variable or default to 10000
PORT=${PORT:-10000}

echo "========================================="
echo "Starting PitWall AI Backend"
echo "Port: $PORT"
echo "Python: $(python --version)"
echo "========================================="

# Start uvicorn with logging
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info

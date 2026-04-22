#!/bin/bash
# Render startup script

# Use PORT environment variable or default to 10000
PORT=${PORT:-10000}

echo "Starting uvicorn on port $PORT"
uvicorn app.main:app --host 0.0.0.0 --port $PORT

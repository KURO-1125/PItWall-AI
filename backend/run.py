"""
Direct server startup for Render deployment
"""
import os
import sys
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    
    print("=" * 50, flush=True)
    print(f"Starting PitWall AI Backend", flush=True)
    print(f"Port: {port}", flush=True)
    print(f"Python: {sys.version}", flush=True)
    print("=" * 50, flush=True)
    
    # Use uvicorn directly with explicit binding
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        timeout_keep_alive=120,
        workers=1,
        loop="asyncio"
    )

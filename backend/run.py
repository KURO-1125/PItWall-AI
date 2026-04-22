"""
Direct server startup for Render deployment
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    
    print("=" * 50)
    print(f"Starting PitWall AI Backend on port {port}")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        timeout_keep_alive=120
    )

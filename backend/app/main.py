"""
PitWall AI — FastAPI Main Entry Point
Configures CORS, mounts routers, and provides health check.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import races, strategy, knowledge, commentary
from app.services.llm import llm_service
from app.services.knowledge_base import knowledge_base_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="PitWall AI",
    description="Formula 1 GenAI Command Center — Strategy Advisor",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(races.router)
app.include_router(strategy.router)
app.include_router(knowledge.router)
app.include_router(commentary.router)


@app.get("/")
async def root():
    return {
        "name": "PitWall AI",
        "version": "1.0.0",
        "description": "Formula 1 GenAI Command Center",
        "endpoints": {
            "races": "/api/races",
            "strategy_ask": "/api/strategy/ask",
            "strategy_whatif": "/api/strategy/whatif",
            "strategy_overview": "/api/strategy/{session_key}/overview",
            "knowledge_search": "/api/knowledge/search",
            "knowledge_ask": "/api/knowledge/ask",
            "knowledge_ingest": "/api/knowledge/ingest",
            "health": "/health",
            "docs": "/docs",
        }
    }


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    # Ingest PDFs if knowledge base is empty
    knowledge_base_service.ingest_pdfs(force_reingest=False)


@app.get("/health")
async def health_check():
    """Check service health including LLM and Knowledge Base availability."""
    llm_status = await llm_service.health_check()
    kb_stats = knowledge_base_service.get_stats()
    
    return {
        "status": "ok",
        "llm": llm_status,
        "knowledge_base": {
            "total_chunks": kb_stats["total_chunks"],
            "status": "ready" if kb_stats["total_chunks"] > 0 else "empty"
        },
        "version": "1.0.0",
    }

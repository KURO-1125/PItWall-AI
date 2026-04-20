"""
PitWall AI — Knowledge Base API Router
Endpoints for F1 regulations search and RAG-based Q&A
"""
from fastapi import APIRouter, Query
from typing import Optional, List
from pydantic import BaseModel
from app.services.knowledge_base import knowledge_base_service
from app.services.llm import llm_service

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class SearchRequest(BaseModel):
    query: str
    year: Optional[str] = None
    type: Optional[str] = None
    n_results: int = 5


class SearchResult(BaseModel):
    text: str
    metadata: dict
    distance: Optional[float] = None


class AskRequest(BaseModel):
    question: str
    year: Optional[str] = None
    type: Optional[str] = None


class AskResponse(BaseModel):
    answer: str
    sources: List[SearchResult]


@router.post("/search", response_model=List[SearchResult])
async def search_regulations(request: SearchRequest):
    """Search F1 regulations using semantic search."""
    results = knowledge_base_service.search(
        query=request.query,
        n_results=request.n_results,
        year_filter=request.year,
        type_filter=request.type
    )
    
    return [SearchResult(**result) for result in results]


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """Ask a question about F1 regulations using RAG."""
    # Search for relevant context
    search_results = knowledge_base_service.search(
        query=request.question,
        n_results=5,
        year_filter=request.year,
        type_filter=request.type
    )
    
    if not search_results:
        return AskResponse(
            answer="I couldn't find any relevant information in the F1 regulations to answer your question.",
            sources=[]
        )
    
    # Build context from search results
    context_parts = []
    for i, result in enumerate(search_results, 1):
        meta = result['metadata']
        context_parts.append(
            f"[Source {i}: {meta['year']} {meta['type']} Regulations, Issue {meta['issue']}]\n"
            f"{result['text']}\n"
        )
    
    context = "\n\n".join(context_parts)
    
    # Generate answer using LLM
    system_prompt = """You are an expert F1 regulations advisor. Answer questions based ONLY on the provided regulation excerpts.

Rules:
1. Only use information from the provided sources
2. Cite the source (year, type, issue) when referencing specific regulations
3. If the answer isn't in the sources, say so clearly
4. Be precise and quote specific article numbers when relevant
5. Explain technical terms clearly"""
    
    user_prompt = f"""Based on the following F1 regulation excerpts, answer this question:

QUESTION: {request.question}

REGULATION EXCERPTS:
{context}

Provide a clear, accurate answer based only on the information above."""
    
    answer = await llm_service.generate(user_prompt, system=system_prompt)
    
    return AskResponse(
        answer=answer,
        sources=[SearchResult(**result) for result in search_results]
    )


@router.get("/stats")
async def get_stats():
    """Get knowledge base statistics."""
    return knowledge_base_service.get_stats()


@router.post("/ingest")
async def ingest_pdfs(force: bool = Query(False, description="Force re-ingestion")):
    """Ingest PDF files into the knowledge base."""
    knowledge_base_service.ingest_pdfs(force_reingest=force)
    stats = knowledge_base_service.get_stats()
    return {
        "status": "success",
        "message": "PDF ingestion complete",
        "stats": stats
    }


@router.get("/years")
async def get_available_years():
    """Get list of available years in the knowledge base."""
    stats = knowledge_base_service.get_stats()
    return {
        "years": list(stats["by_year"].keys())
    }


@router.get("/types")
async def get_regulation_types():
    """Get list of regulation types in the knowledge base."""
    stats = knowledge_base_service.get_stats()
    return {
        "types": list(stats["by_type"].keys())
    }

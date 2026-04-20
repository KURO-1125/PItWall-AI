"""
PitWall AI — Commentary API Router
Endpoints for AI-generated race commentary
"""
from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel
from app.services.commentary import commentary_service

router = APIRouter(prefix="/api/commentary", tags=["commentary"])


class CommentaryRequest(BaseModel):
    session_key: int
    personality: str = "professional"
    start_lap: Optional[int] = None
    end_lap: Optional[int] = None
    focus_driver: Optional[int] = None


class CommentaryResponse(BaseModel):
    commentary: str
    personality: str
    personality_name: str
    race_info: dict
    lap_range: Optional[tuple] = None
    focus_driver: Optional[int] = None
    error: Optional[str] = None


class HighlightReelRequest(BaseModel):
    session_key: int
    personality: str = "dramatic"


class PersonalitiesResponse(BaseModel):
    personalities: dict


@router.get("/personalities", response_model=PersonalitiesResponse)
async def get_personalities():
    """Get available commentary personality styles."""
    return PersonalitiesResponse(
        personalities=commentary_service.get_personalities()
    )


@router.post("/generate", response_model=CommentaryResponse)
async def generate_commentary(request: CommentaryRequest):
    """
    Generate AI-powered race commentary.
    
    Parameters:
    - session_key: Race session identifier
    - personality: Commentary style (professional, enthusiastic, technical, dramatic, humorous)
    - start_lap: Optional start lap for focused commentary
    - end_lap: Optional end lap for focused commentary
    - focus_driver: Optional driver number to focus on
    """
    lap_range = None
    if request.start_lap is not None and request.end_lap is not None:
        lap_range = (request.start_lap, request.end_lap)
    
    result = await commentary_service.generate_commentary(
        session_key=request.session_key,
        personality=request.personality,
        lap_range=lap_range,
        focus_driver=request.focus_driver
    )
    
    return CommentaryResponse(**result)


@router.post("/highlight-reel", response_model=CommentaryResponse)
async def generate_highlight_reel(request: HighlightReelRequest):
    """
    Generate a highlight reel commentary focusing on key moments.
    
    Parameters:
    - session_key: Race session identifier
    - personality: Commentary style (defaults to dramatic)
    """
    result = await commentary_service.generate_highlight_reel(
        session_key=request.session_key,
        personality=request.personality
    )
    
    return CommentaryResponse(**result)

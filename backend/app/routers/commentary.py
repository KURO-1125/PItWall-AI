"""
PitWall AI — Commentary API Router
Endpoints for AI-generated race commentary
"""
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from pydantic import BaseModel
from app.services.commentary import commentary_service
import io
import logging

logger = logging.getLogger(__name__)
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


@router.post("/text-to-speech")
async def text_to_speech(
    text: str = Query(..., description="Text to convert to speech"),
    voice: str = Query("default", description="Voice style: default, uk, au, in")
):
    """
    Convert commentary text to speech audio with natural-sounding voices.
    
    Uses pyttsx3 (offline, natural voices) or gTTS as fallback.
    
    Parameters:
    - text: Commentary text to convert
    - voice: Voice style (default=US, uk=British, au=Australian, in=Indian)
    
    Returns:
    - Audio file (MP3 format)
    """
    try:
        # Try pyttsx3 first (better quality, offline, uses system voices)
        try:
            import pyttsx3
            import tempfile
            import os
            
            # Clean text (remove markdown and improve readability)
            clean_text = text.replace("**", "")
            # Add pauses for better pacing
            clean_text = clean_text.replace("!", "!... ")
            clean_text = clean_text.replace(".", "... ")
            clean_text = clean_text.replace(",", ", ")
            
            # Initialize TTS engine
            engine = pyttsx3.init()
            
            # Configure voice properties for more natural sound
            voices = engine.getProperty('voices')
            
            # Select voice based on preference
            voice_index = 0
            if voice == "uk" and len(voices) > 1:
                # Try to find British voice
                for i, v in enumerate(voices):
                    if 'british' in v.name.lower() or 'uk' in v.name.lower():
                        voice_index = i
                        break
            elif voice == "female" and len(voices) > 1:
                # Try to find female voice
                for i, v in enumerate(voices):
                    if 'female' in v.name.lower() or 'zira' in v.name.lower():
                        voice_index = i
                        break
            
            engine.setProperty('voice', voices[voice_index].id)
            engine.setProperty('rate', 175)  # Slightly faster for excitement
            engine.setProperty('volume', 1.0)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tmp_path = tmp_file.name
            
            engine.save_to_file(clean_text, tmp_path)
            engine.runAndWait()
            
            # Read the file
            with open(tmp_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            audio_buffer = io.BytesIO(audio_data)
            audio_buffer.seek(0)
            
            return StreamingResponse(
                audio_buffer,
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=commentary.mp3"
                }
            )
            
        except Exception as pyttsx_error:
            logger.warning(f"pyttsx3 failed, falling back to gTTS: {pyttsx_error}")
            
            # Fallback to gTTS with better configuration
            from gtts import gTTS
            
            # Clean text and improve pacing
            clean_text = text.replace("**", "")
            # Add natural pauses
            clean_text = clean_text.replace("!", "!... ")
            clean_text = clean_text.replace(".", "... ")
            clean_text = clean_text.replace(",", ", ")
            
            # Map voice preferences to gTTS accents
            tld_map = {
                "default": "com",      # US English
                "uk": "co.uk",         # British English
                "au": "com.au",        # Australian English
                "in": "co.in",         # Indian English
                "ca": "ca",            # Canadian English
                "ie": "ie"             # Irish English
            }
            
            tld = tld_map.get(voice, "com")
            
            # Generate speech with slower pace for clarity
            tts = gTTS(
                text=clean_text, 
                lang='en', 
                slow=False,
                tld=tld  # Use accent variation
            )
            
            # Save to bytes buffer
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            return StreamingResponse(
                audio_buffer,
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=commentary.mp3"
                }
            )
    
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        return {"error": f"Failed to generate speech: {str(e)}"}

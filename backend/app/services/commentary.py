"""
PitWall AI — Commentary Generator Service
Generates AI-powered race commentary with different personality styles
"""
import logging
from typing import Optional, List, Dict
from app.services.llm import llm_service
from app.services.fastf1_svc import fastf1_service

logger = logging.getLogger(__name__)


class CommentaryService:
    """Generate AI-powered race commentary with personality styles."""
    
    # Commentary personality styles
    PERSONALITIES = {
        "professional": {
            "name": "Professional Broadcaster",
            "description": "Classic, informative commentary like Martin Brundle or David Croft",
            "style": "Professional, detailed, technical analysis with racing insights"
        },
        "enthusiastic": {
            "name": "Enthusiastic Fan",
            "description": "Excited, passionate commentary full of energy",
            "style": "Energetic, passionate, uses exclamations and dramatic language"
        },
        "technical": {
            "name": "Technical Expert",
            "description": "Deep technical analysis like an engineer or strategist",
            "style": "Highly technical, focuses on data, telemetry, and engineering details"
        },
        "dramatic": {
            "name": "Dramatic Storyteller",
            "description": "Cinematic, narrative-driven commentary",
            "style": "Dramatic, builds tension, focuses on storylines and rivalries"
        },
        "humorous": {
            "name": "Humorous Commentator",
            "description": "Light-hearted, witty commentary with jokes",
            "style": "Witty, humorous, makes clever observations and jokes"
        }
    }
    
    def __init__(self):
        self.personalities = self.PERSONALITIES
    
    def get_personalities(self) -> Dict[str, Dict]:
        """Get available commentary personalities."""
        return self.personalities
    
    async def generate_commentary(
        self,
        session_key: int,
        personality: str = "professional",
        lap_range: Optional[tuple] = None,
        focus_driver: Optional[int] = None
    ) -> Dict:
        """
        Generate race commentary for a session.
        
        Args:
            session_key: Race session identifier
            personality: Commentary style (professional, enthusiastic, technical, dramatic, humorous)
            lap_range: Optional tuple (start_lap, end_lap) to focus on specific laps
            focus_driver: Optional driver number to focus commentary on
        
        Returns:
            Dictionary with commentary text and metadata
        """
        try:
            # Parse session key to get year and round
            session_key_str = str(session_key)
            year = int(session_key_str[:4])
            round_num = int(session_key_str[4:])
            
            # Get race info from the races module
            from app.routers.races import RACES_BY_YEAR
            races = RACES_BY_YEAR.get(year, [])
            race = next((r for r in races if r["round"] == round_num), None)
            
            if not race:
                return {
                    "commentary": "Unable to generate commentary - race not found.",
                    "personality": personality,
                    "personality_name": self.personalities.get(personality, self.personalities["professional"])["name"],
                    "race_info": {"session_key": session_key},
                    "error": "Race not found"
                }
            
            # Load FastF1 session
            session = fastf1_service.get_session(year, race["name"], "Race")
            if not session:
                return {
                    "commentary": "Unable to generate commentary - session data not available.",
                    "personality": personality,
                    "personality_name": self.personalities.get(personality, self.personalities["professional"])["name"],
                    "race_info": {
                        "session_key": session_key,
                        "country": race["country"],
                        "circuit": race["circuit"]
                    },
                    "error": "Session data not available"
                }
            
            # Get race results
            results = fastf1_service.get_race_results(session)
            
            # Build context for commentary
            context = self._build_race_context_from_results(race, results, lap_range, focus_driver)
            
            # Get personality style
            personality_info = self.personalities.get(personality, self.personalities["professional"])
            
            # Generate commentary
            commentary_text = await self._generate_with_personality(
                context,
                personality_info,
                race,
                results,
                lap_range,
                focus_driver
            )
            
            return {
                "commentary": commentary_text,
                "personality": personality,
                "personality_name": personality_info["name"],
                "race_info": {
                    "session_key": session_key,
                    "country": race["country"],
                    "circuit": race["circuit"],
                    "total_laps": len(results) if results else 0
                },
                "lap_range": lap_range,
                "focus_driver": focus_driver
            }
            
        except Exception as e:
            logger.error(f"Error generating commentary: {e}")
            personality_info = self.personalities.get(personality, self.personalities["professional"])
            return {
                "commentary": f"Error generating commentary: {str(e)}",
                "personality": personality,
                "personality_name": personality_info["name"],
                "race_info": {"session_key": session_key},
                "error": str(e)
            }
    
    def _build_race_context_from_results(
        self,
        race: Dict,
        results: List,
        lap_range: Optional[tuple],
        focus_driver: Optional[int]
    ) -> str:
        """Build context string from race results."""
        context_parts = []
        
        # Race information
        context_parts.append(f"RACE: {race['country']} Grand Prix")
        context_parts.append(f"CIRCUIT: {race['circuit']}")
        
        # Final results (top 10)
        if results:
            pos_text = "\n".join(
                f"  P{r['position']}: {r['driver_name']} ({r['team']})"
                for r in results[:10]
            )
            context_parts.append(f"\nFINAL RESULTS:\n{pos_text}")
        
        # Lap range context
        if lap_range:
            context_parts.append(f"\nFOCUS: Laps {lap_range[0]} to {lap_range[1]}")
        
        # Focus driver context
        if focus_driver and results:
            driver_info = next((r for r in results if str(r.get('driver_number')) == str(focus_driver)), None)
            if driver_info:
                context_parts.append(f"\nFOCUS DRIVER: {driver_info['driver_name']} (P{driver_info['position']})")
        
        return "\n\n".join(context_parts)
    
    async def _generate_with_personality(
        self,
        context: str,
        personality_info: Dict,
        race: Dict,
        results: List,
        lap_range: Optional[tuple],
        focus_driver: Optional[int]
    ) -> str:
        """Generate commentary with specific personality style."""
        
        # Build system prompt based on personality
        system_prompt = f"""You are a Formula 1 race commentator with the following style:

PERSONALITY: {personality_info['name']}
STYLE: {personality_info['style']}

Your commentary should:
1. Match the personality style consistently
2. Be engaging and capture the excitement of F1 racing
3. Reference specific drivers, positions, and race events
4. Use racing terminology appropriately
5. Create a narrative flow that builds excitement
6. Be 3-5 paragraphs long (about 200-300 words)

Format your commentary with:
- Natural paragraph breaks
- Emphasis on key moments using **bold** for dramatic effect
- Racing terminology and technical details where appropriate
"""
        
        # Build user prompt
        focus_instruction = ""
        if lap_range:
            focus_instruction = f"\n\nFocus your commentary on laps {lap_range[0]} to {lap_range[1]}, describing the key events and battles during this period."
        elif focus_driver and results:
            driver_info = next((r for r in results if str(r.get('driver_number')) == str(focus_driver)), None)
            if driver_info:
                focus_instruction = f"\n\nFocus your commentary on {driver_info['driver_name']}'s race, their battles, strategy, and performance."
        
        user_prompt = f"""Generate race commentary based on this race data:

{context}
{focus_instruction}

Provide engaging, personality-driven commentary that brings this race to life for the audience."""
        
        # Generate commentary
        commentary = await llm_service.generate(user_prompt, system=system_prompt, temperature=0.8)
        
        return commentary
    
    async def generate_highlight_reel(
        self,
        session_key: int,
        personality: str = "dramatic"
    ) -> Dict:
        """
        Generate a highlight reel commentary focusing on key moments.
        
        Args:
            session_key: Race session identifier
            personality: Commentary style
        
        Returns:
            Dictionary with highlight commentary
        """
        try:
            # Parse session key to get year and round
            session_key_str = str(session_key)
            year = int(session_key_str[:4])
            round_num = int(session_key_str[4:])
            
            # Get race info from the races module
            from app.routers.races import RACES_BY_YEAR
            races = RACES_BY_YEAR.get(year, [])
            race = next((r for r in races if r["round"] == round_num), None)
            
            personality_info = self.personalities.get(personality, self.personalities["dramatic"])
            
            if not race:
                return {
                    "commentary": "Unable to generate highlights - race not found.",
                    "personality": personality,
                    "personality_name": personality_info["name"],
                    "race_info": {"session_key": session_key},
                    "type": "highlight_reel",
                    "error": "Race not found"
                }
            
            # Load FastF1 session
            session = fastf1_service.get_session(year, race["name"], "Race")
            if not session:
                return {
                    "commentary": "Unable to generate highlights - session data not available.",
                    "personality": personality,
                    "personality_name": personality_info["name"],
                    "race_info": {
                        "session_key": session_key,
                        "country": race["country"],
                        "circuit": race["circuit"]
                    },
                    "type": "highlight_reel",
                    "error": "Session data not available"
                }
            
            # Get race results
            results = fastf1_service.get_race_results(session)
            
            # Build highlights context
            context = self._build_highlights_context(race, results)
            
            system_prompt = f"""You are creating a HIGHLIGHT REEL for a Formula 1 race.

PERSONALITY: {personality_info['name']}
STYLE: {personality_info['style']}

Create an exciting highlight reel commentary that:
1. Focuses on the most dramatic moments
2. Highlights key battles and overtakes
3. Mentions the winner and podium finishers
4. Captures the excitement and drama
5. Is concise but impactful (150-200 words)
6. Uses **bold** for the most exciting moments

Format as a single flowing narrative with dramatic pacing."""
            
            user_prompt = f"""Create a highlight reel commentary for this race:

{context}

Focus on the most exciting moments, the winner, and key battles."""
            
            commentary = await llm_service.generate(user_prompt, system=system_prompt, temperature=0.9)
            
            return {
                "commentary": commentary,
                "personality": personality,
                "personality_name": personality_info["name"],
                "type": "highlight_reel",
                "race_info": {
                    "session_key": session_key,
                    "country": race["country"],
                    "circuit": race["circuit"]
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating highlight reel: {e}")
            personality_info = self.personalities.get(personality, self.personalities["dramatic"])
            return {
                "commentary": f"Error generating highlights: {str(e)}",
                "personality": personality,
                "personality_name": personality_info["name"],
                "race_info": {"session_key": session_key},
                "type": "highlight_reel",
                "error": str(e)
            }
    
    def _build_highlights_context(self, race: Dict, results: List) -> str:
        """Build context for highlight reel from race results."""
        context_parts = []
        
        context_parts.append(f"RACE: {race['country']} Grand Prix")
        context_parts.append(f"CIRCUIT: {race['circuit']}")
        
        # Final results (top 10)
        if results:
            # Winner
            winner = results[0]
            context_parts.append(f"\nWINNER: {winner['Abbreviation']} ({winner['TeamName']})")
            
            # Podium
            if len(results) >= 3:
                podium = "\n".join(
                    f"  P{r['Position']}: {r['Abbreviation']} ({r['TeamName']})"
                    for r in results[:3]
                )
                context_parts.append(f"\nPODIUM:\n{podium}")
            
            # Notable positions
            if len(results) > 3:
                others = "\n".join(
                    f"  P{r['Position']}: {r['Abbreviation']}"
                    for r in results[3:10]
                )
                context_parts.append(f"\nOTHER FINISHERS:\n{others}")
        
        return "\n\n".join(context_parts)


# Singleton
commentary_service = CommentaryService()

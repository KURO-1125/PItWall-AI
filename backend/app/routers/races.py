"""
PitWall AI — Race Data API Router
Endpoints for listing sessions and fetching race state.
"""
from fastapi import APIRouter, Query
from typing import Optional
from app.services.fastf1_svc import fastf1_service
import fastf1
import pandas as pd

router = APIRouter(prefix="/api/races", tags=["races"])


# Available races for FastF1 (2023-2025 seasons)
AVAILABLE_RACES_2023 = [
    {"round": 1, "name": "Bahrain", "country": "Bahrain", "circuit": "Sakhir"},
    {"round": 2, "name": "Saudi Arabia", "country": "Saudi Arabia", "circuit": "Jeddah"},
    {"round": 3, "name": "Australia", "country": "Australia", "circuit": "Melbourne"},
    {"round": 4, "name": "Azerbaijan", "country": "Azerbaijan", "circuit": "Baku"},
    {"round": 5, "name": "Miami", "country": "United States", "circuit": "Miami"},
    {"round": 6, "name": "Monaco", "country": "Monaco", "circuit": "Monaco"},
    {"round": 7, "name": "Spain", "country": "Spain", "circuit": "Barcelona"},
    {"round": 8, "name": "Canada", "country": "Canada", "circuit": "Montreal"},
    {"round": 9, "name": "Austria", "country": "Austria", "circuit": "Spielberg"},
    {"round": 10, "name": "Great Britain", "country": "United Kingdom", "circuit": "Silverstone"},
    {"round": 11, "name": "Hungary", "country": "Hungary", "circuit": "Budapest"},
    {"round": 12, "name": "Belgium", "country": "Belgium", "circuit": "Spa"},
    {"round": 13, "name": "Netherlands", "country": "Netherlands", "circuit": "Zandvoort"},
    {"round": 14, "name": "Italy", "country": "Italy", "circuit": "Monza"},
    {"round": 15, "name": "Singapore", "country": "Singapore", "circuit": "Singapore"},
    {"round": 16, "name": "Japan", "country": "Japan", "circuit": "Suzuka"},
    {"round": 17, "name": "Qatar", "country": "Qatar", "circuit": "Losail"},
    {"round": 18, "name": "United States", "country": "United States", "circuit": "Austin"},
    {"round": 19, "name": "Mexico", "country": "Mexico", "circuit": "Mexico City"},
    {"round": 20, "name": "Brazil", "country": "Brazil", "circuit": "Interlagos"},
    {"round": 21, "name": "Las Vegas", "country": "United States", "circuit": "Las Vegas"},
    {"round": 22, "name": "Abu Dhabi", "country": "United Arab Emirates", "circuit": "Yas Marina"},
]

AVAILABLE_RACES_2024 = [
    {"round": 1, "name": "Bahrain", "country": "Bahrain", "circuit": "Sakhir"},
    {"round": 2, "name": "Saudi Arabia", "country": "Saudi Arabia", "circuit": "Jeddah"},
    {"round": 3, "name": "Australia", "country": "Australia", "circuit": "Melbourne"},
    {"round": 4, "name": "Japan", "country": "Japan", "circuit": "Suzuka"},
    {"round": 5, "name": "China", "country": "China", "circuit": "Shanghai"},
    {"round": 6, "name": "Miami", "country": "United States", "circuit": "Miami"},
    {"round": 7, "name": "Emilia Romagna", "country": "Italy", "circuit": "Imola"},
    {"round": 8, "name": "Monaco", "country": "Monaco", "circuit": "Monaco"},
    {"round": 9, "name": "Canada", "country": "Canada", "circuit": "Montreal"},
    {"round": 10, "name": "Spain", "country": "Spain", "circuit": "Barcelona"},
    {"round": 11, "name": "Austria", "country": "Austria", "circuit": "Spielberg"},
    {"round": 12, "name": "Great Britain", "country": "United Kingdom", "circuit": "Silverstone"},
    {"round": 13, "name": "Hungary", "country": "Hungary", "circuit": "Budapest"},
    {"round": 14, "name": "Belgium", "country": "Belgium", "circuit": "Spa"},
    {"round": 15, "name": "Netherlands", "country": "Netherlands", "circuit": "Zandvoort"},
    {"round": 16, "name": "Italy", "country": "Italy", "circuit": "Monza"},
    {"round": 17, "name": "Azerbaijan", "country": "Azerbaijan", "circuit": "Baku"},
    {"round": 18, "name": "Singapore", "country": "Singapore", "circuit": "Singapore"},
    {"round": 19, "name": "United States", "country": "United States", "circuit": "Austin"},
    {"round": 20, "name": "Mexico", "country": "Mexico", "circuit": "Mexico City"},
    {"round": 21, "name": "Brazil", "country": "Brazil", "circuit": "Interlagos"},
    {"round": 22, "name": "Las Vegas", "country": "United States", "circuit": "Las Vegas"},
    {"round": 23, "name": "Qatar", "country": "Qatar", "circuit": "Losail"},
    {"round": 24, "name": "Abu Dhabi", "country": "United Arab Emirates", "circuit": "Yas Marina"},
]

AVAILABLE_RACES_2025 = [
    {"round": 1, "name": "Australia", "country": "Australia", "circuit": "Melbourne"},
    {"round": 2, "name": "China", "country": "China", "circuit": "Shanghai"},
    {"round": 3, "name": "Japan", "country": "Japan", "circuit": "Suzuka"},
    {"round": 4, "name": "Bahrain", "country": "Bahrain", "circuit": "Sakhir"},
    {"round": 5, "name": "Saudi Arabia", "country": "Saudi Arabia", "circuit": "Jeddah"},
    {"round": 6, "name": "Miami", "country": "United States", "circuit": "Miami"},
    {"round": 7, "name": "Emilia Romagna", "country": "Italy", "circuit": "Imola"},
    {"round": 8, "name": "Monaco", "country": "Monaco", "circuit": "Monaco"},
    {"round": 9, "name": "Spain", "country": "Spain", "circuit": "Barcelona"},
    {"round": 10, "name": "Canada", "country": "Canada", "circuit": "Montreal"},
    {"round": 11, "name": "Austria", "country": "Austria", "circuit": "Spielberg"},
    {"round": 12, "name": "Great Britain", "country": "United Kingdom", "circuit": "Silverstone"},
    {"round": 13, "name": "Belgium", "country": "Belgium", "circuit": "Spa"},
    {"round": 14, "name": "Hungary", "country": "Hungary", "circuit": "Budapest"},
    {"round": 15, "name": "Netherlands", "country": "Netherlands", "circuit": "Zandvoort"},
    {"round": 16, "name": "Italy", "country": "Italy", "circuit": "Monza"},
    {"round": 17, "name": "Azerbaijan", "country": "Azerbaijan", "circuit": "Baku"},
    {"round": 18, "name": "Singapore", "country": "Singapore", "circuit": "Singapore"},
    {"round": 19, "name": "United States", "country": "United States", "circuit": "Austin"},
    {"round": 20, "name": "Mexico", "country": "Mexico", "circuit": "Mexico City"},
    {"round": 21, "name": "Brazil", "country": "Brazil", "circuit": "Interlagos"},
    {"round": 22, "name": "Las Vegas", "country": "United States", "circuit": "Las Vegas"},
    {"round": 23, "name": "Qatar", "country": "Qatar", "circuit": "Losail"},
    {"round": 24, "name": "Abu Dhabi", "country": "United Arab Emirates", "circuit": "Yas Marina"},
]

AVAILABLE_RACES_2026 = [
    {"round": 1, "name": "Australia", "country": "Australia", "circuit": "Melbourne"},
    {"round": 2, "name": "China", "country": "China", "circuit": "Shanghai"},
    {"round": 3, "name": "Japan", "country": "Japan", "circuit": "Suzuka"},
    {"round": 4, "name": "Bahrain", "country": "Bahrain", "circuit": "Sakhir"},
    {"round": 5, "name": "Saudi Arabia", "country": "Saudi Arabia", "circuit": "Jeddah"},
    {"round": 6, "name": "Miami", "country": "United States", "circuit": "Miami"},
    {"round": 7, "name": "Emilia Romagna", "country": "Italy", "circuit": "Imola"},
    {"round": 8, "name": "Monaco", "country": "Monaco", "circuit": "Monaco"},
    {"round": 9, "name": "Spain", "country": "Spain", "circuit": "Barcelona"},
    {"round": 10, "name": "Canada", "country": "Canada", "circuit": "Montreal"},
    {"round": 11, "name": "Austria", "country": "Austria", "circuit": "Spielberg"},
    {"round": 12, "name": "Great Britain", "country": "United Kingdom", "circuit": "Silverstone"},
    {"round": 13, "name": "Belgium", "country": "Belgium", "circuit": "Spa"},
    {"round": 14, "name": "Hungary", "country": "Hungary", "circuit": "Budapest"},
    {"round": 15, "name": "Netherlands", "country": "Netherlands", "circuit": "Zandvoort"},
    {"round": 16, "name": "Italy", "country": "Italy", "circuit": "Monza"},
    {"round": 17, "name": "Azerbaijan", "country": "Azerbaijan", "circuit": "Baku"},
    {"round": 18, "name": "Singapore", "country": "Singapore", "circuit": "Singapore"},
    {"round": 19, "name": "United States", "country": "United States", "circuit": "Austin"},
    {"round": 20, "name": "Mexico", "country": "Mexico", "circuit": "Mexico City"},
    {"round": 21, "name": "Brazil", "country": "Brazil", "circuit": "Interlagos"},
    {"round": 22, "name": "Las Vegas", "country": "United States", "circuit": "Las Vegas"},
    {"round": 23, "name": "Qatar", "country": "Qatar", "circuit": "Losail"},
    {"round": 24, "name": "Abu Dhabi", "country": "United Arab Emirates", "circuit": "Yas Marina"},
]

RACES_BY_YEAR = {
    2023: AVAILABLE_RACES_2023,
    2024: AVAILABLE_RACES_2024,
    2025: AVAILABLE_RACES_2025,
    2026: AVAILABLE_RACES_2026,
}


@router.get("")
async def list_sessions(
    year: Optional[int] = Query(2023, description="Filter by year"),
    session_name: Optional[str] = Query("Race", description="e.g. Race, Qualifying"),
):
    """List available F1 sessions using FastF1."""
    races = RACES_BY_YEAR.get(year, [])
    
    result = []
    for race in races:
        result.append({
            "session_key": f"{year}{race['round']:02d}",  # e.g., 202301 for 2023 Round 1
            "session_name": session_name,
            "session_type": session_name,
            "country_name": race["country"],
            "circuit_short_name": race["circuit"],
            "year": year,
            "meeting_name": f"{race['name']} Grand Prix",
            "round": race["round"],
        })
    
    return result


@router.get("/meetings")
async def list_meetings(year: Optional[int] = Query(2023)):
    """List Grand Prix weekends."""
    return RACES_BY_YEAR.get(year, [])


@router.get("/{session_key}/state")
async def get_race_state(session_key: str):
    """Get complete race state for a session using FastF1."""
    # Parse session_key (format: YYYYRR, e.g., 202301)
    try:
        year = int(session_key[:4])
        round_num = int(session_key[4:])
    except:
        return {"error": "Invalid session key format"}
    
    races = RACES_BY_YEAR.get(year, [])
    race = next((r for r in races if r["round"] == round_num), None)
    if not race:
        return {"error": "Race not found"}
    
    # Check if session is live
    is_live = fastf1_service.is_session_live(year, race["name"], "Race")
    
    # Load FastF1 session with live data if applicable
    session = fastf1_service.get_session(year, race["name"], "Race", live=is_live)
    if not session:
        return {"error": "Failed to load session data"}
    
    # Get laps data
    laps_df = fastf1_service.get_laps_dataframe(session)
    
    # Convert to positions format
    positions = []
    drivers_data = []
    
    if not laps_df.empty:
        # Get final lap for each driver
        final_laps = laps_df.groupby('Driver').last().reset_index()
        final_laps = final_laps.sort_values('Position')
        
        for idx, lap in final_laps.iterrows():
            driver_abbr = str(lap['Driver'])
            position = int(lap['Position']) if pd.notna(lap['Position']) else 99
            
            positions.append({
                "position": position,
                "driver_number": lap.get('DriverNumber', idx),
                "acronym": driver_abbr,
                "team_name": lap.get('Team', 'Unknown'),
                "team_colour": "FF0000",  # Default red
                "lap_number": int(lap['LapNumber']) if pd.notna(lap['LapNumber']) else 0,
            })
            
            drivers_data.append({
                "driver_number": lap.get('DriverNumber', idx),
                "broadcast_name": driver_abbr,
                "full_name": driver_abbr,
                "name_acronym": driver_abbr,
                "team_name": lap.get('Team', 'Unknown'),
            })
    
    # Convert laps to list format - get laps for top 5 drivers
    laps_list = []
    if not laps_df.empty:
        # Get top 5 drivers by position
        top_drivers = final_laps.head(5)['DriverNumber'].tolist()
        
        # Filter laps for these drivers
        top_driver_laps = laps_df[laps_df['DriverNumber'].isin(top_drivers)]
        
        for idx, lap in top_driver_laps.iterrows():
            laps_list.append({
                "lap_number": int(lap['LapNumber']) if pd.notna(lap['LapNumber']) else 0,
                "driver_number": lap.get('DriverNumber', 0),
                "lap_duration": float(lap['LapTime'].total_seconds()) if pd.notna(lap.get('LapTime')) else None,
                "compound": lap.get('Compound', 'UNKNOWN'),
            })
    
    return {
        "session": {
            "session_key": session_key,
            "session_name": "Race",
            "country_name": race["country"],
            "circuit_short_name": race["circuit"],
            "meeting_name": f"{race['name']} Grand Prix",
        },
        "is_live": is_live,
        "drivers": drivers_data,
        "positions": positions,
        "laps": laps_list,
        "stints": [],
        "pit_stops": [],
        "intervals": [],
        "weather": [],
        "race_control": [],
    }


@router.get("/{session_key}/drivers")
async def get_drivers(session_key: str):
    """Get drivers in a session."""
    try:
        year = int(session_key[:4])
        round_num = int(session_key[4:])
    except:
        return []
    
    races = RACES_BY_YEAR.get(year, [])
    race = next((r for r in races if r["round"] == round_num), None)
    if not race:
        return []
    
    session = fastf1_service.get_session(year, race["name"], "Race")
    if not session:
        return []
    
    results = fastf1_service.get_race_results(session)
    return results


@router.get("/{session_key}/laps")
async def get_laps(
    session_key: str,
    driver_number: Optional[int] = Query(None),
):
    """Get lap data for a session."""
    try:
        year = int(session_key[:4])
        round_num = int(session_key[4:])
    except:
        return []
    
    races = RACES_BY_YEAR.get(year, [])
    race = next((r for r in races if r["round"] == round_num), None)
    if not race:
        return []
    
    session = fastf1_service.get_session(year, race["name"], "Race")
    if not session:
        return []
    
    laps_df = fastf1_service.get_laps_dataframe(session)
    if laps_df.empty:
        return []
    
    # Convert to list
    laps_list = []
    for idx, lap in laps_df.head(200).iterrows():
        laps_list.append({
            "lap_number": int(lap['LapNumber']) if pd.notna(lap['LapNumber']) else 0,
            "driver_number": lap.get('DriverNumber', 0),
            "lap_duration": float(lap['LapTime'].total_seconds()) if pd.notna(lap.get('LapTime')) else None,
        })
    
    return laps_list


@router.get("/{session_key}/stints")
async def get_stints(session_key: int):
    """Get tyre stint data."""
    return []


@router.get("/{session_key}/intervals")
async def get_intervals(session_key: int):
    """Get gap/interval data."""
    return []

"""
PitWall AI — Strategy API Router
Endpoints for AI-powered strategy advice, what-if scenarios, and strategy overview.
"""
from fastapi import APIRouter
import pandas as pd
from app.models.schemas import (
    StrategyAskRequest,
    StrategyAskResponse,
    WhatIfRequest,
    WhatIfResponse,
    StrategyOverviewResponse,
)
from app.engines.strategy import strategy_engine
# OpenF1 service not used - using FastF1 exclusively
# from app.services.openf1 import openf1_service

router = APIRouter(prefix="/api/strategy", tags=["strategy"])


@router.post("/ask", response_model=StrategyAskResponse)
async def ask_strategy(request: StrategyAskRequest):
    """Ask an AI-powered strategy question about a race."""
    result = await strategy_engine.ask(
        session_key=request.session_key,
        question=request.question,
        driver_number=request.driver_number,
    )
    return StrategyAskResponse(
        answer=result["answer"],
        data_points=result.get("data_points", []),
        recommendation=result.get("recommendation"),
    )


@router.post("/whatif", response_model=WhatIfResponse)
async def what_if(request: WhatIfRequest):
    """Run a what-if strategy scenario."""
    import logging
    logger = logging.getLogger(__name__)
    
    # Using FastF1 exclusively for all race data
    from app.services.fastf1_svc import fastf1_service
    
    # Parse session_key to get year and round
    try:
        session_key_str = str(request.session_key)
        year = int(session_key_str[:4])
        round_num = int(session_key_str[4:])
    except Exception as e:
        logger.error(f"Failed to parse session key: {e}")
        return WhatIfResponse(explanation="Invalid session key format")
    
    # Get race info
    from app.routers.races import RACES_BY_YEAR
    races = RACES_BY_YEAR.get(year, [])
    race = next((r for r in races if r["round"] == round_num), None)
    if not race:
        return WhatIfResponse(explanation="Race not found")
    
    # Load FastF1 session
    session = fastf1_service.get_session(year, race["name"], "Race")
    if not session:
        return WhatIfResponse(explanation="Failed to load session data")
    
    # Get laps dataframe and convert to list format
    laps_df = fastf1_service.get_laps_dataframe(session)
    if laps_df.empty:
        return WhatIfResponse(explanation="No lap data available")
    
    # Filter for specific driver and convert to list
    # FastF1 stores driver numbers as strings, so convert for comparison
    driver_laps_df = laps_df[laps_df['DriverNumber'] == str(request.driver_number)]
    
    laps = []
    for idx, lap in driver_laps_df.iterrows():
        lap_data = {
            "lap_number": int(lap['LapNumber']) if pd.notna(lap['LapNumber']) else 0,
            "driver_number": lap.get('DriverNumber', 0),
            "lap_duration": float(lap['LapTime'].total_seconds()) if pd.notna(lap.get('LapTime')) else None,
            "compound": lap.get('Compound', 'UNKNOWN'),
        }
        laps.append(lap_data)
    
    # Stints data (empty for now as FastF1 doesn't provide this easily)
    stints = []

    result = strategy_engine.what_if_scenario(
        laps=laps,
        stints=stints,
        driver_number=request.driver_number,
        pit_lap=request.pit_lap,
        new_compound=request.compound,
    )

    if "error" in result:
        return WhatIfResponse(explanation=result["error"])
    
    return WhatIfResponse(
        projected_time_delta=f"{result['time_delta_seconds']:+.2f}s ({result['faster_or_slower']})",
        comparison=result,
        explanation=f"Pitting on lap {request.pit_lap} for {request.compound} would be approximately {abs(result['time_delta_seconds']):.1f}s {result['faster_or_slower']} than the actual strategy.",
    )


# NOTE: Overview endpoint not implemented yet
# Can be implemented with FastF1 data if needed
# @router.get("/{session_key}/overview", response_model=StrategyOverviewResponse)
# async def strategy_overview(session_key: int):
#     """Get strategy overview with tyre degradation, pit windows, and gap analysis."""
#     result = await strategy_engine.get_overview(session_key)
#     return StrategyOverviewResponse(**result)


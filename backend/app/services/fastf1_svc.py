"""
PitWall AI — FastF1 Service
Wraps the FastF1 library for deep historical telemetry data (2018-2025).
Primary data source for race analysis and strategy recommendations.
"""
import fastf1
import pandas as pd
import logging
import os
from app.config import settings

logger = logging.getLogger(__name__)

# Enable FastF1 cache
os.makedirs(settings.FASTF1_CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(settings.FASTF1_CACHE_DIR)


class FastF1Service:
    """Wrapper for the FastF1 library — historical F1 telemetry data."""

    def get_session(self, year: int, gp: str, session_type: str = "Race", live: bool = False):
        """
        Load a session (Race, Qualifying, Sprint, etc.).
        gp can be a name like 'Bahrain' or a round number.
        live: If True, enables live timing for ongoing sessions.
        """
        try:
            session = fastf1.get_session(year, gp, session_type)
            
            # Load with live data if requested
            if live:
                logger.info(f"Loading live session: {year} {gp} {session_type}")
                session.load(livedata=True)
            else:
                session.load()
            
            return session
        except Exception as e:
            logger.error(f"FastF1 error loading {year} {gp} {session_type}: {e}")
            return None
    
    def is_session_live(self, year: int, gp: str, session_type: str = "Race") -> bool:
        """
        Check if a session is currently live.
        Only returns True if the session date is today and within race time window.
        """
        try:
            from datetime import datetime, timezone, timedelta
            
            # Get current time
            now = datetime.now(timezone.utc)
            
            # Historical races (before 2026) are never live
            if year < 2026:
                return False
            
            # Get session info
            session = fastf1.get_session(year, gp, session_type)
            
            # Check if session date exists and is valid
            if hasattr(session, 'date') and session.date:
                session_date = session.date
                
                # Convert to timezone-aware datetime if needed
                if not hasattr(session_date, 'tzinfo') or session_date.tzinfo is None:
                    session_date = session_date.replace(tzinfo=timezone.utc)
                
                # Check if session is today
                if session_date.date() != now.date():
                    return False
                
                # Check if within reasonable time window (session time ± 4 hours)
                time_diff = abs((now - session_date).total_seconds())
                if time_diff < 4 * 3600:  # Within 4 hours of session start
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Error checking if session is live: {e}")
            return False

    def get_laps_dataframe(self, session) -> pd.DataFrame:
        """Get all laps as a DataFrame."""
        if session is None:
            return pd.DataFrame()
        return session.laps

    def get_driver_laps(self, session, driver: str) -> pd.DataFrame:
        """Get laps for a specific driver (3-letter code like 'VER', 'NOR')."""
        if session is None:
            return pd.DataFrame()
        return session.laps.pick_driver(driver)

    def get_tyre_stints(self, session, driver: str) -> list:
        """Get tyre stint info for a driver."""
        laps = self.get_driver_laps(session, driver)
        if laps.empty:
            return []

        stints = []
        current_compound = None
        stint_start = None

        for _, lap in laps.iterrows():
            compound = lap.get("Compound", "Unknown")
            if compound != current_compound:
                if current_compound is not None:
                    stints.append({
                        "compound": current_compound,
                        "start_lap": stint_start,
                        "end_lap": int(lap["LapNumber"]) - 1,
                    })
                current_compound = compound
                stint_start = int(lap["LapNumber"])

        if current_compound is not None:
            stints.append({
                "compound": current_compound,
                "start_lap": stint_start,
                "end_lap": int(laps.iloc[-1]["LapNumber"]),
            })

        return stints

    def get_race_results(self, session) -> list:
        """Get final race results."""
        if session is None:
            return []
        results = session.results
        if results is None or results.empty:
            return []

        # Convert to list with proper field names
        results_list = []
        for idx, row in results.iterrows():
            results_list.append({
                "position": int(row["Position"]) if pd.notna(row["Position"]) else 99,
                "driver_name": str(row["Abbreviation"]),
                "driver_number": int(row["DriverNumber"]) if "DriverNumber" in row and pd.notna(row["DriverNumber"]) else idx,
                "team": str(row["TeamName"]),
                "grid_position": int(row["GridPosition"]) if pd.notna(row["GridPosition"]) else 0,
                "status": str(row["Status"]) if pd.notna(row["Status"]) else "Unknown",
                "points": float(row["Points"]) if pd.notna(row["Points"]) else 0.0,
                # Keep original field names for compatibility
                "Position": int(row["Position"]) if pd.notna(row["Position"]) else 99,
                "Abbreviation": str(row["Abbreviation"]),
                "TeamName": str(row["TeamName"]),
                "GridPosition": int(row["GridPosition"]) if pd.notna(row["GridPosition"]) else 0,
                "Status": str(row["Status"]) if pd.notna(row["Status"]) else "Unknown",
                "Points": float(row["Points"]) if pd.notna(row["Points"]) else 0.0,
            })
        
        return results_list


# Singleton
fastf1_service = FastF1Service()

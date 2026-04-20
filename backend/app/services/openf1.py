"""
PitWall AI — OpenF1 API Client
Fetches live and recent F1 data from the free OpenF1 API.
Docs: https://openf1.org/docs
"""
import httpx
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

BASE_URL = "https://api.openf1.org/v1"


class OpenF1Service:
    """Client for the OpenF1 REST API — free, no auth required."""

    def __init__(self):
        self.base_url = BASE_URL

    async def _get(self, endpoint: str, params: dict = None) -> list:
        """Make a GET request to OpenF1 API."""
        url = f"{self.base_url}/{endpoint}"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenF1 HTTP error: {e.response.status_code} for {url}")
            return []
        except Exception as e:
            logger.error(f"OpenF1 request failed: {e}")
            return []

    # ── Sessions & Meetings ────────────────────────────────

    async def get_sessions(
        self,
        year: Optional[int] = None,
        country_name: Optional[str] = None,
        session_name: Optional[str] = None,
    ) -> list:
        """List available sessions (Practice, Qualifying, Race, Sprint, etc.)."""
        params = {}
        if year:
            params["year"] = year
        if country_name:
            params["country_name"] = country_name
        if session_name:
            params["session_name"] = session_name
        return await self._get("sessions", params)

    async def get_meetings(self, year: Optional[int] = None) -> list:
        """List race meetings (Grand Prix weekends)."""
        params = {}
        if year:
            params["year"] = year
        return await self._get("meetings", params)

    # ── Drivers ────────────────────────────────────────────

    async def get_drivers(self, session_key: int) -> list:
        """Get drivers participating in a session."""
        return await self._get("drivers", {"session_key": session_key})

    # ── Lap Data ───────────────────────────────────────────

    async def get_laps(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
        lap_number: Optional[int] = None,
    ) -> list:
        """Get lap timing data (sector times, lap duration, etc.)."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        if lap_number:
            params["lap_number"] = lap_number
        return await self._get("laps", params)

    # ── Intervals (Gaps) ───────────────────────────────────

    async def get_intervals(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> list:
        """Get interval/gap data between drivers."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        return await self._get("intervals", params)

    # ── Stints (Tyre Data) ─────────────────────────────────

    async def get_stints(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> list:
        """Get tyre stint data (compound, age, stint number)."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        return await self._get("stints", params)

    # ── Pit Stops ──────────────────────────────────────────

    async def get_pit_stops(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> list:
        """Get pit stop data (duration, lap)."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        return await self._get("pit", params)

    # ── Positions ──────────────────────────────────────────

    async def get_positions(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> list:
        """Get position data updated every ~4 seconds during session."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        return await self._get("position", params)

    # ── Race Control ───────────────────────────────────────

    async def get_race_control(self, session_key: int) -> list:
        """Get race control messages (flags, safety car, incidents)."""
        return await self._get("race_control", {"session_key": session_key})

    # ── Weather ────────────────────────────────────────────

    async def get_weather(self, session_key: int) -> list:
        """Get weather data (track temp, air temp, humidity, rain)."""
        return await self._get("weather", {"session_key": session_key})

    # ── Convenience: Full Race State ───────────────────────

    async def get_race_state(self, session_key: int) -> dict:
        """
        Fetch complete race state — used by the strategy engine.
        Fetches all relevant data in parallel-ish sequence.
        """
        import asyncio

        drivers, laps, stints, pit_stops, positions, intervals, weather, race_control = (
            await asyncio.gather(
                self.get_drivers(session_key),
                self.get_laps(session_key),
                self.get_stints(session_key),
                self.get_pit_stops(session_key),
                self.get_positions(session_key),
                self.get_intervals(session_key),
                self.get_weather(session_key),
                self.get_race_control(session_key),
            )
        )

        return {
            "drivers": drivers,
            "laps": laps,
            "stints": stints,
            "pit_stops": pit_stops,
            "positions": positions,
            "intervals": intervals,
            "weather": weather,
            "race_control": race_control,
        }


# Singleton
openf1_service = OpenF1Service()

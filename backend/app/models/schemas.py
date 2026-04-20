"""
PitWall AI — Pydantic Schemas
Request/Response models for all API endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal


# ── Race Data ──────────────────────────────────────────────

class SessionInfo(BaseModel):
    session_key: int
    session_name: str
    session_type: Optional[str] = None
    country_name: str
    circuit_short_name: Optional[str] = None
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    year: int
    meeting_name: Optional[str] = None


class DriverInfo(BaseModel):
    driver_number: int
    broadcast_name: str
    full_name: Optional[str] = None
    name_acronym: str
    team_name: Optional[str] = None
    team_colour: Optional[str] = None
    headshot_url: Optional[str] = None
    country_code: Optional[str] = None


class RaceStateResponse(BaseModel):
    session: SessionInfo
    drivers: list[DriverInfo]
    positions: list[dict]
    stints: list[dict]
    laps: list[dict]
    pit_stops: list[dict]
    weather: list[dict]
    race_control: list[dict]
    intervals: list[dict]


# ── Strategy ───────────────────────────────────────────────

class StrategyAskRequest(BaseModel):
    session_key: int
    question: str
    driver_number: Optional[int] = None


class StrategyAskResponse(BaseModel):
    answer: str
    data_points: list[dict] = Field(default_factory=list)
    recommendation: Optional[str] = None


class WhatIfRequest(BaseModel):
    session_key: int
    driver_number: int
    pit_lap: int
    compound: Literal["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"]


class WhatIfResponse(BaseModel):
    projected_position: Optional[int] = None
    projected_time_delta: Optional[str] = None
    comparison: dict = Field(default_factory=dict)
    explanation: str = ""


class StrategyOverviewResponse(BaseModel):
    tyre_degradation: dict = Field(default_factory=dict)
    pit_windows: list[dict] = Field(default_factory=list)
    gap_analysis: list[dict] = Field(default_factory=list)

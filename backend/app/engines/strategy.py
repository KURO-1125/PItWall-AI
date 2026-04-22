"""
PitWall AI — Strategy Engine
Core calculations + LLM-powered race strategy analysis.
"""
import logging
import json
import numpy as np
from typing import Optional
from app.services.llm import llm_service
# from app.services.openf1 import openf1_service  # Not used - using FastF1 instead

logger = logging.getLogger(__name__)

# Average pit stop time loss in seconds (pit lane + stationary)
PIT_LOSS_SECONDS = 24.0


class StrategyEngine:
    """F1 strategy calculations and AI-powered recommendations."""

    # ── Data Helpers ───────────────────────────────────────

    def _build_driver_map(self, drivers: list) -> dict:
        """Map driver_number -> driver info."""
        dmap = {}
        for d in drivers:
            num = d.get("driver_number")
            if num:
                dmap[num] = {
                    "name": d.get("broadcast_name", d.get("name_acronym", str(num))),
                    "acronym": d.get("name_acronym", ""),
                    "team": d.get("team_name", ""),
                    "team_colour": d.get("team_colour", ""),
                }
        return dmap

    def _get_latest_positions(self, positions: list, drivers: list) -> list:
        """Get the latest position for each driver."""
        driver_map = self._build_driver_map(drivers)
        latest = {}
        for p in positions:
            num = p.get("driver_number")
            if num:
                latest[num] = p

        result = []
        for num, p in sorted(latest.items(), key=lambda x: x[1].get("position", 99)):
            info = driver_map.get(num, {})
            result.append({
                "position": p.get("position"),
                "driver_number": num,
                "name": info.get("name", str(num)),
                "acronym": info.get("acronym", ""),
                "team": info.get("team", ""),
            })
        return result

    def _get_driver_stints(self, stints: list, driver_number: int) -> list:
        """Get all stints for a driver, sorted by stint_number."""
        driver_stints = [s for s in stints if s.get("driver_number") == driver_number]
        return sorted(driver_stints, key=lambda s: s.get("stint_number", 0))

    # ── Tyre Degradation ───────────────────────────────────

    def calculate_tyre_degradation(self, laps: list, driver_number: int) -> dict:
        """
        Calculate tyre degradation rate per compound.
        Returns: { compound: { rate, avg_pace, laps_on_tyre } }
        """
        driver_laps = [l for l in laps if l.get("driver_number") == driver_number]
        if not driver_laps:
            return {}

        # Group laps by approximate stint (detect compound changes via stint data)
        compounds = {}
        for lap in driver_laps:
            lap_dur = lap.get("lap_duration")
            if lap_dur is None or lap_dur <= 0:
                continue
            # Use a simple grouping — lap_number as proxy for tyre age
            lap_num = lap.get("lap_number", 0)
            compound = "UNKNOWN"
            compounds.setdefault(compound, []).append({
                "lap": lap_num,
                "time": lap_dur,
            })

        result = {}
        for compound, lap_data in compounds.items():
            if len(lap_data) < 2:
                continue
            times = [l["time"] for l in lap_data]
            laps_arr = list(range(1, len(times) + 1))

            # Linear regression for degradation rate
            if len(laps_arr) >= 2:
                coeffs = np.polyfit(laps_arr, times, 1)
                rate = round(float(coeffs[0]), 4)  # seconds per lap of degradation
            else:
                rate = 0.0

            result[compound] = {
                "degradation_rate_per_lap": rate,
                "average_lap_time": round(float(np.mean(times)), 3),
                "total_laps": len(times),
                "fastest_lap": round(float(np.min(times)), 3),
                "slowest_lap": round(float(np.max(times)), 3),
            }

        return result

    def calculate_tyre_degradation_with_stints(
        self, laps: list, stints: list, driver_number: int
    ) -> dict:
        """
        Calculate tyre degradation per compound using actual stint data.
        """
        driver_laps = sorted(
            [l for l in laps if l.get("driver_number") == driver_number],
            key=lambda l: l.get("lap_number", 0),
        )
        driver_stints = self._get_driver_stints(stints, driver_number)

        if not driver_laps or not driver_stints:
            return self.calculate_tyre_degradation(laps, driver_number)

        result = {}
        for stint in driver_stints:
            compound = stint.get("compound", "UNKNOWN")
            lap_start = stint.get("lap_start", 0)
            lap_end = stint.get("lap_end", 999)
            tyre_age_start = stint.get("tyre_age_at_start", 0)

            stint_laps = [
                l for l in driver_laps
                if lap_start <= l.get("lap_number", 0) <= lap_end
                and l.get("lap_duration") is not None
                and l.get("lap_duration", 0) > 0
            ]

            if len(stint_laps) < 2:
                continue

            times = [l["lap_duration"] for l in stint_laps]
            tyre_ages = list(range(tyre_age_start + 1, tyre_age_start + len(times) + 1))

            coeffs = np.polyfit(tyre_ages, times, 1)
            rate = round(float(coeffs[0]), 4)

            key = f"{compound}_stint{stint.get('stint_number', '?')}"
            result[key] = {
                "compound": compound,
                "stint_number": stint.get("stint_number"),
                "degradation_rate_per_lap": rate,
                "average_lap_time": round(float(np.mean(times)), 3),
                "total_laps": len(times),
                "fastest_lap": round(float(np.min(times)), 3),
                "lap_range": f"{lap_start}-{lap_end}",
                "tyre_age_start": tyre_age_start,
            }

        return result

    # ── Pit Windows ────────────────────────────────────────

    def calculate_pit_windows(self, laps: list, stints: list, driver_number: int) -> list:
        """
        Identify optimal pit windows based on tyre degradation crossover.
        """
        deg_data = self.calculate_tyre_degradation_with_stints(laps, stints, driver_number)
        if not deg_data:
            return []

        windows = []
        for key, data in deg_data.items():
            if data["degradation_rate_per_lap"] > 0.03:
                # Significant degradation — suggest pit window
                optimal_lap = int(data["lap_range"].split("-")[0]) + int(data["total_laps"] * 0.7)
                windows.append({
                    "suggested_pit_lap": optimal_lap,
                    "compound": data["compound"],
                    "stint_number": data.get("stint_number"),
                    "reason": f"Tyre degradation rate of {data['degradation_rate_per_lap']}s/lap on {data['compound']} suggests pitting around lap {optimal_lap}",
                    "degradation_rate": data["degradation_rate_per_lap"],
                })

        return windows

    # ── Gap Analysis ───────────────────────────────────────

    def analyze_gaps(self, intervals: list, driver_number: int) -> dict:
        """
        Analyze gaps to cars ahead and behind.
        Determines undercut/overcut feasibility.
        """
        # Get latest interval data for all drivers
        latest_intervals = {}
        for iv in intervals:
            num = iv.get("driver_number")
            if num and iv.get("gap_to_leader") is not None:
                latest_intervals[num] = iv

        driver_iv = latest_intervals.get(driver_number, {})
        gap_to_leader = driver_iv.get("gap_to_leader")
        interval = driver_iv.get("interval")

        result = {
            "driver_number": driver_number,
            "gap_to_leader": gap_to_leader,
            "interval_to_car_ahead": interval,
            "undercut_viable": False,
            "overcut_viable": False,
        }

        # Undercut is viable if gap to car ahead < pit loss time
        if interval is not None:
            try:
                gap_val = float(interval) if not isinstance(interval, str) else None
                if gap_val and gap_val < PIT_LOSS_SECONDS:
                    result["undercut_viable"] = True
                    result["undercut_note"] = f"Gap of {gap_val}s is within pit window ({PIT_LOSS_SECONDS}s loss). Undercut could work."
                if gap_val and gap_val > PIT_LOSS_SECONDS * 0.5:
                    result["overcut_viable"] = True
                    result["overcut_note"] = f"Gap of {gap_val}s may allow overcut if tyres hold up."
            except (ValueError, TypeError):
                pass

        return result

    # ── What-If Scenarios ──────────────────────────────────

    def what_if_scenario(
        self, laps: list, stints: list, driver_number: int,
        pit_lap: int, new_compound: str
    ) -> dict:
        """
        Project race outcome with an alternative pit strategy.
        """
        # Filter laps for the driver - handle both string and int driver numbers
        driver_laps = sorted(
            [l for l in laps if str(l.get("driver_number")) == str(driver_number) and l.get("lap_duration")],
            key=lambda l: l.get("lap_number", 0),
        )

        if not driver_laps:
            return {"error": "No lap data available for this driver"}

        total_laps_count = max(l.get("lap_number", 0) for l in driver_laps)

        # Estimate lap times before and after proposed pit
        pre_pit_laps = [l for l in driver_laps if l.get("lap_number", 0) < pit_lap]
        post_pit_laps = [l for l in driver_laps if l.get("lap_number", 0) >= pit_lap]

        pre_pit_avg = np.mean([l["lap_duration"] for l in pre_pit_laps]) if pre_pit_laps else 0
        post_pit_avg = np.mean([l["lap_duration"] for l in post_pit_laps]) if post_pit_laps else 0

        # Compound performance estimates (relative to MEDIUM baseline)
        compound_factors = {
            "SOFT": -0.8,       # ~0.8s faster per lap but degrades faster
            "MEDIUM": 0.0,      # Baseline
            "HARD": 0.4,        # ~0.4s slower but more durable
            "INTERMEDIATE": 1.5,
            "WET": 3.0,
        }

        compound_adj = compound_factors.get(new_compound, 0.0)
        projected_post_pit_avg = post_pit_avg + compound_adj

        # Calculate projected total time
        actual_total = sum(l["lap_duration"] for l in driver_laps) if driver_laps else 0
        projected_total = (
            sum(l["lap_duration"] for l in pre_pit_laps)
            + PIT_LOSS_SECONDS  # pit stop time
            + projected_post_pit_avg * (total_laps_count - pit_lap + 1)
        )

        time_diff = projected_total - actual_total

        return {
            "scenario": f"Pit on lap {pit_lap} for {new_compound}",
            "total_laps": total_laps_count,
            "actual_total_time": round(actual_total, 2),
            "projected_total_time": round(projected_total, 2),
            "time_delta_seconds": round(time_diff, 2),
            "faster_or_slower": "faster" if time_diff < 0 else "slower",
            "pre_pit_avg_lap": round(pre_pit_avg, 3),
            "projected_post_pit_avg_lap": round(projected_post_pit_avg, 3),
            "pit_loss": PIT_LOSS_SECONDS,
            "compound_adjustment": compound_adj,
        }

    # ── LLM Strategy Advisor ──────────────────────────────

    async def ask(
        self, session_key: int, question: str, driver_number: Optional[int] = None
    ) -> dict:
        """
        Answer a strategy question using race data + LLM reasoning.
        """
        # Using FastF1 for all race data
        from app.services.fastf1_svc import fastf1_service
        
        try:
            # Get race state from FastF1
            race_state = fastf1_service.get_race_state(session_key)
            
            # Build context from FastF1 data
            context_parts = []
            
            # Current positions
            if race_state.get("positions"):
                pos_text = "\n".join(
                    f"  P{p['position']}: {p['driver_name']} ({p['team']})"
                    for p in race_state["positions"][:10]
                )
                context_parts.append(f"CURRENT STANDINGS (Top 10):\n{pos_text}")
            
            # Lap times and pace
            if race_state.get("positions"):
                pace_text = "\n".join(
                    f"  {p['driver_name']}: Last lap {p.get('last_lap_time', 'N/A')}, Gap: {p.get('gap_to_leader', 'N/A')}"
                    for p in race_state["positions"][:5]
                )
                context_parts.append(f"PACE DATA (Top 5):\n{pace_text}")
            
            # Tire compounds
            if race_state.get("positions"):
                tire_text = "\n".join(
                    f"  {p['driver_name']}: {p.get('compound', 'Unknown')} (Age: {p.get('tyre_life', 'N/A')} laps)"
                    for p in race_state["positions"][:10]
                )
                context_parts.append(f"TIRE STATUS:\n{tire_text}")
            
            context = "\n\n".join(context_parts) if context_parts else "Limited race data available."
            
        except Exception as e:
            logger.error(f"Error fetching FastF1 data: {e}")
            context = "Unable to fetch current race data. Please try again."

        # LLM prompt
        system_prompt = """You are an expert Formula 1 race strategist working on the pit wall. 
You analyze telemetry data, tyre degradation, gaps, and race conditions to provide strategic recommendations.

Your advice should be:
- Data-driven: Reference specific lap times, gaps, and tyre data
- Actionable: Give clear recommendations with specific lap numbers and compounds
- Risk-aware: Mention potential risks and alternatives
- Professional but accessible: Expert-level analysis in understandable language

Format your response with clear sections using markdown:
### 1. Recommendation
Your primary strategic advice with **bold** key points

### 2. Key Data
The data points supporting your recommendation

### 3. Risks
What could go wrong

### 4. Alternative
A backup strategy if conditions change"""

        user_prompt = f"""RACE DATA CONTEXT:
{context}

STRATEGIST QUESTION: {question}

Provide your strategic analysis based on the data above."""

        # Generate response
        answer = await llm_service.generate(user_prompt, system=system_prompt)

        return {
            "answer": answer,
            "data_points": [],
            "recommendation": answer.split("\n")[0] if answer else "",
        }

    # ── Strategy Overview ──────────────────────────────────

    # NOTE: Overview endpoint not implemented yet
    # Can be implemented with FastF1 data if needed


# Singleton
strategy_engine = StrategyEngine()

"use client";

import { motion } from "framer-motion";
import { TYRE_COLORS } from "../../lib/constants";

export default function RaceStateCard({ session, data, loading }) {
    if (loading || !data) {
        return (
            <div className="race-state-card glass-card h-64 animate-pulse flex items-center justify-center">
                <span className="text-muted text-sm">Loading telemetry...</span>
            </div>
        );
    }

    const { positions, weather, race_control } = data;
    const currentLap = positions && positions.length > 0 ? positions[0].lap_number : 0;
    const totalLaps = session?.total_laps || 57; // Default or from session info

    const top5 = positions ? positions.slice(0, 5) : [];
    const trackTemp = weather && weather.length > 0 ? weather[weather.length - 1].track_temperature : "--";

    return (
        <div className="race-state-card glass-card">
            <div className="race-state-header flex justify-between items-center mb-4">
                <div>
                    <h2 className="race-state-title text-lg font-bold">
                        {session?.circuit_short_name || "Grand Prix"}
                    </h2>
                    <div className="text-xs text-muted flex items-center gap-2">
                        <span>Lap {currentLap} / {totalLaps}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                        <span>{trackTemp}°C Track</span>
                    </div>
                </div>
            </div>

            <div className="race-state-positions space-y-2">
                {top5.length === 0 ? (
                    <div className="text-center text-muted py-4">No position data available</div>
                ) : (
                    top5.map((pos, i) => (
                    <motion.div
                        key={pos.driver_number}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="position-row flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors"
                    >
                        <div className={`position-number font-mono font-bold w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-zinc-500"
                            }`}>
                            {pos.position}
                        </div>

                        <div
                            className="position-team-color w-1 h-8 rounded-full"
                            style={{ backgroundColor: `#${pos.team_colour}` }}
                        />

                        <div className="flex-1">
                            <div className="font-bold text-sm">{pos.acronym || pos.driver_number}</div>
                            <div className="text-xs text-muted truncate max-w-[100px]">{pos.team_name}</div>
                        </div>

                        {/* Gap */}
                        <div className="text-xs font-mono text-zinc-400">
                            {i === 0 ? "Leader" : pos.gap_to_leader || "+--"}
                        </div>

                        {/* Tyre Icon */}
                        {/* Find current tyre from stints if available, mock for now */}
                        <div className="position-tyre w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center text-[8px] font-bold text-yellow-400" title="Medium">M</div>
                    </motion.div>
                ))
                )}
            </div>
        </div>
    );
}

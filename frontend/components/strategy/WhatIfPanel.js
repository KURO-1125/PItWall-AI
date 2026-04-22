"use client";

import { useState } from "react";
import { whatIfStrategy } from "../../lib/api";
import { COMPOUNDS, TYRE_COLORS } from "../../lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatIfPanel({ sessionKey, drivers }) {
    const [selectedDriver, setSelectedDriver] = useState("");
    const [pitLap, setPitLap] = useState(20);
    const [compound, setCompound] = useState("MEDIUM");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // If no drivers loaded yet, show empty state or loading
    if (!drivers || drivers.length === 0) {
        return (
            <div className="whatif-panel glass-card opacity-50 pointer-events-none">
                <h3>Strategy Simulator</h3>
                <p className="text-xs text-muted">Awaiting race data...</p>
            </div>
        );
    }

    const handleRunSimulation = async () => {
        if (!sessionKey || !selectedDriver) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await whatIfStrategy(sessionKey, parseInt(selectedDriver), pitLap, compound);
            
            // Check if there's an error in the explanation
            if (data.explanation && data.explanation.includes("No lap data")) {
                setResult({
                    time_delta_seconds: 0,
                    faster_or_slower: 'error',
                    error: data.explanation
                });
                return;
            }
            
            // Backend returns: { projected_time_delta, comparison: {time_delta_seconds, faster_or_slower}, explanation }
            // Extract the actual values from comparison object
            let resultData;
            if (data.comparison && (data.comparison.time_delta_seconds !== undefined || data.comparison.faster_or_slower)) {
                // Use the comparison object which has the actual numeric values
                resultData = {
                    time_delta_seconds: data.comparison.time_delta_seconds,
                    faster_or_slower: data.comparison.faster_or_slower,
                    explanation: data.explanation
                };
            } else if (data.time_delta_seconds !== undefined || data.faster_or_slower) {
                // Direct format (fallback)
                resultData = data;
            } else {
                // Unexpected format
                resultData = {
                    time_delta_seconds: 0,
                    faster_or_slower: 'unknown',
                    explanation: data.explanation || 'Unable to calculate strategy difference',
                    error: 'Unexpected API response format'
                };
            }
            
            setResult(resultData);
        } catch (e) {
            console.error("Simulation failed", e);
            setResult({
                faster_or_slower: 'error',
                time_delta_seconds: 0,
                error: e.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="whatif-panel glass-card">
            <h3>Strategy Simulator</h3>

            <div className="whatif-controls space-y-4">
                {/* Driver Selection */}
                <div className="whatif-control">
                    <div className="whatif-label">Driver</div>
                    <select
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1 text-sm"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        <option value="">Select Driver</option>
                        {drivers.map(d => (
                            <option key={d.driver_number} value={d.driver_number}>
                                {d.broadcast_name || d.full_name} ({d.name_acronym})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pit Lap Slider */}
                <div className="whatif-control">
                    <div className="flex justify-between">
                        <div className="whatif-label">Pit Lap</div>
                        <span className="text-xs font-mono text-f1-red">{pitLap}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="70"
                        value={pitLap}
                        onChange={(e) => setPitLap(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                </div>

                {/* Compound Selector */}
                <div className="whatif-control">
                    <div className="whatif-label" style={{ marginBottom: '1rem' }}>Tyre Compound</div>
                    <div className="flex gap-4 justify-start items-center" style={{ padding: '0.5rem 0' }}>
                        {COMPOUNDS.map(c => (
                            <button
                                key={c}
                                onClick={() => setCompound(c)}
                                className={`w-14 h-14 rounded-full border-3 flex items-center justify-center text-base font-bold transition-all hover:scale-110
                  ${compound === c ? 'scale-125 ring-4 ring-offset-2 ring-offset-zinc-900' : 'opacity-60'}
                `}
                                style={{
                                    borderWidth: '3px',
                                    borderColor: TYRE_COLORS[c],
                                    color: TYRE_COLORS[c],
                                    background: compound === c ? TYRE_COLORS[c] : 'transparent',
                                    padding: '1rem',
                                    ...(compound === c && { color: '#000', ringColor: TYRE_COLORS[c] })
                                }}
                                title={c}
                            >
                                {c[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleRunSimulation}
                    disabled={loading || !selectedDriver}
                    className="whatif-run-btn bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50"
                >
                    {loading ? "Simulating..." : "Run Scenario"}
                </button>
            </div>

            {/* Results Area */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-4 p-4 rounded-xl border-l-4 ${result.faster_or_slower === 'faster' ? 'border-l-green-500 bg-green-900/20' : 'border-l-red-500 bg-red-900/20'
                            }`}
                        style={{
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div className="text-xs text-muted mb-2 uppercase tracking-widest font-bold">Projection</div>
                        <div className={`text-4xl font-bold font-mono mb-2 ${result.faster_or_slower === 'faster' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {(() => {
                                // Try different possible field names
                                const delta = result.time_delta_seconds ?? result.time_delta ?? result.delta_seconds ?? result.delta;
                                if (delta !== undefined && delta !== null) {
                                    return `${delta > 0 ? '+' : ''}${Number(delta).toFixed(2)}s`;
                                }
                                return 'N/A';
                            })()}
                        </div>
                        <p className="text-sm text-secondary">
                            {result.faster_or_slower === 'faster' ? '✓ Faster' : '✗ Slower'} than current strategy via pit on Lap {pitLap} with {compound} tyres.
                        </p>
                        {result.explanation && (
                            <p className="text-xs text-zinc-400 mt-2 italic">{result.explanation}</p>
                        )}
                        {result.error && (
                            <p className="text-xs text-red-400 mt-2">⚠ {result.error}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getRaces } from "../../lib/api";

export default function RaceSelector({ onSelect }) {
    const [sessions, setSessions] = useState([]);
    const [years] = useState([2026, 2025, 2024, 2023]);
    const [selectedYear, setSelectedYear] = useState(2026); // Start with 2026 (current year)
    const [selectedRaceKey, setSelectedRaceKey] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch sessions when year changes
    useEffect(() => {
        async function loadSessions() {
            setLoading(true);
            try {
                const data = await getRaces(selectedYear, "Race");
                
                if (!data || data.length === 0) {
                    console.warn("No races found for year:", selectedYear);
                    setSessions([]);
                    return;
                }
                
                // Filter for Races only (simpler MVP)
                const races = data.reverse();
                setSessions(races);
                
                // Clear selection when year changes
                setSelectedRaceKey(null);
            } catch (err) {
                console.error("Failed to load sessions", err);
                setSessions([]);
            } finally {
                setLoading(false);
            }
        }
        loadSessions();
    }, [selectedYear]); // Only depend on selectedYear

    const handleRaceChange = (e) => {
        const keyStr = e.target.value;
        const keyInt = parseInt(keyStr);
        setSelectedRaceKey(keyInt);
        
        // Try both string and int comparison
        const race = sessions.find(s => s.session_key === keyInt || s.session_key === keyStr || String(s.session_key) === keyStr);
        
        if (race && onSelect) {
            onSelect(keyInt, race);
        }
    };

    return (
        <div className="race-selector glass-card">
            <h3>Select Race Session</h3>
            <div className="race-selector-row">
                {/* Year Dropdown */}
                <select
                    className="race-select"
                    style={{ width: '120px' }}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Race Dropdown */}
                <select
                    className="race-select flex-1"
                    value={selectedRaceKey || ''}
                    onChange={handleRaceChange}
                    disabled={loading}
                >
                    <option value="">Select a race...</option>
                    {loading ? (
                        <option disabled>Loading races...</option>
                    ) : sessions.length === 0 ? (
                        <option disabled>No races found</option>
                    ) : (
                        sessions.map(s => (
                            <option key={s.session_key} value={s.session_key}>
                                {s.country_name} GP - {s.circuit_short_name}
                            </option>
                        ))
                    )}
                </select>
            </div>
        </div>
    );
}

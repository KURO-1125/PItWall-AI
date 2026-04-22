"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../lib/animations";
import { 
    getRaces, 
    getCommentaryPersonalities, 
    generateCommentary, 
    generateHighlightReel 
} from "../../lib/api";

export default function CommentaryPage() {
    const [sessions, setSessions] = useState([]);
    const [personalities, setPersonalities] = useState({});
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedPersonality, setSelectedPersonality] = useState("professional");
    const [commentary, setCommentary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("full"); // "full" or "highlight"
    
    const years = [2026, 2025, 2024, 2023];

    // Load personalities and races
    useEffect(() => {
        async function loadData() {
            try {
                const [personalitiesData, racesData] = await Promise.all([
                    getCommentaryPersonalities(),
                    getRaces(selectedYear, "Race")
                ]);
                setPersonalities(personalitiesData.personalities || {});
                setSessions(racesData.reverse() || []);
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }
        loadData();
    }, [selectedYear]);

    const handleGenerate = async () => {
        if (!selectedSession) return;

        setLoading(true);
        setCommentary(null);

        try {
            let result;
            if (mode === "highlight") {
                result = await generateHighlightReel(selectedSession, selectedPersonality);
            } else {
                result = await generateCommentary(selectedSession, selectedPersonality);
            }
            setCommentary(result);
        } catch (error) {
            console.error("Error generating commentary:", error);
            setCommentary({
                commentary: "Failed to generate commentary. Please try again.",
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // Format markdown in commentary
    const formatCommentary = (text) => {
        if (!text) return null;
        
        return text.split('\n').map((line, idx) => {
            // Handle bold text
            if (line.trim()) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={idx} style={{ marginBottom: '1rem', lineHeight: '1.8', fontSize: '1.05rem' }}>
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i} style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            }
            return <br key={idx} />;
        });
    };

    return (
        <div className="page-container commentary-page">
            {/* Header */}
            <motion.header
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="commentary-header"
            >
                <motion.div 
                    className="commentary-title"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div 
                        className="commentary-title-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        🎙️
                    </motion.div>
                    <div>
                        <h1>AI COMMENTARY GENERATOR</h1>
                        <p className="text-sm text-muted">Generate race commentary with AI personalities</p>
                    </div>
                </motion.div>
            </motion.header>

            {/* Main Content */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="commentary-body"
            >
                {/* Control Panel */}
                <div className="commentary-controls glass-card">
                    <h3 className="controls-title">Commentary Settings</h3>
                    
                    {/* Mode Toggle */}
                    <div className="mode-toggle">
                        <button
                            className={`mode-btn ${mode === "full" ? "active" : ""}`}
                            onClick={() => setMode("full")}
                        >
                            📻 Full Commentary
                        </button>
                        <button
                            className={`mode-btn ${mode === "highlight" ? "active" : ""}`}
                            onClick={() => setMode("highlight")}
                        >
                            ⭐ Highlight Reel
                        </button>
                    </div>

                    {/* Race Selection */}
                    <div className="control-group">
                        <label className="control-label">Select Race</label>
                        <div className="race-selector-row">
                            <select
                                className="race-select"
                                style={{ width: '120px' }}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <select
                                className="race-select flex-1"
                                value={selectedSession || ''}
                                onChange={(e) => setSelectedSession(parseInt(e.target.value))}
                            >
                                <option value="">Select a race...</option>
                                {sessions.map(s => (
                                    <option key={s.session_key} value={s.session_key}>
                                        {s.country_name} GP - {s.circuit_short_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Personality Selection */}
                    <div className="control-group">
                        <label className="control-label">Commentary Style</label>
                        <div className="personality-grid">
                            {Object.entries(personalities).map(([key, info]) => (
                                <button
                                    key={key}
                                    className={`personality-card ${selectedPersonality === key ? "active" : ""}`}
                                    onClick={() => setSelectedPersonality(key)}
                                >
                                    <div className="personality-name">{info.name}</div>
                                    <div className="personality-desc">{info.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={!selectedSession || loading}
                    >
                        {loading ? "⏳ Generating..." : "🎙️ Generate Commentary"}
                    </button>
                </div>

                {/* Commentary Display */}
                {commentary && (
                    <motion.div
                        className="commentary-result glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="result-header">
                            <h3 className="result-title">
                                {mode === "highlight" ? "🎬 Highlight Reel" : "📻 Race Commentary"}
                            </h3>
                            {commentary.race_info && (
                                <div className="result-meta">
                                    <span className="meta-badge">{commentary.race_info.country}</span>
                                    <span className="meta-badge">{commentary.personality_name}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="commentary-text">
                            {formatCommentary(commentary.commentary)}
                        </div>

                        {commentary.error && (
                            <div className="error-message">
                                ⚠️ {commentary.error}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Empty State */}
                {!commentary && !loading && (
                    <motion.div
                        className="commentary-empty glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="empty-icon">🎙️</div>
                        <h3>Ready to Generate Commentary</h3>
                        <p>Select a race and personality style, then click generate to create AI-powered race commentary.</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

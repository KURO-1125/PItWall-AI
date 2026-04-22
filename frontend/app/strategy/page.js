"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, buttonHover } from "../../lib/animations";
import { getRaceState, askStrategy, whatIfStrategy } from "../../lib/api";
import RaceSelector from "../../components/strategy/RaceSelector";
import ChatPanel from "../../components/strategy/ChatPanel";
import StrategyChart from "../../components/strategy/StrategyChart";
import WhatIfPanel from "../../components/strategy/WhatIfPanel";
import RaceStateCard from "../../components/strategy/RaceStateCard";

export default function StrategyPage() {
    // State
    const [selectedRace, setSelectedRace] = useState(null);
    const [sessionKey, setSessionKey] = useState(null);
    const [raceState, setRaceState] = useState(null);
    const [loadingState, setLoadingState] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Load race state when session changes
    useEffect(() => {
        if (!sessionKey) return;

        async function loadData() {
            setLoadingState(true);
            try {
                const data = await getRaceState(sessionKey);
                setRaceState(data);
                setIsLive(data?.is_live || false);
            } catch (e) {
                console.error("Failed to load race state", e);
            } finally {
                setLoadingState(false);
            }
        }

        loadData();
        // Poll for live data every 30s only if race is active
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [sessionKey]);

    return (
        <div className="page-container strategy-page">
            {/* Header */}
            <motion.header
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="strategy-header"
            >
                <motion.div 
                    className="strategy-title"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div 
                        className="strategy-title-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        🏁
                    </motion.div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>STRATEGY COMMAND CENTER</h1>
                            {isLive && (
                                <motion.div
                                    className="live-indicator"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.span
                                        className="live-dot"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [1, 0.7, 1],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    LIVE
                                </motion.div>
                            )}
                        </div>
                        <p className="text-sm text-muted">AI-Powered Race Analysis & Predictions</p>
                    </div>
                </motion.div>

                {/* Race Selector Component */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <RaceSelector
                        onSelect={(key, race) => {
                            setSessionKey(key);
                            setSelectedRace(race);
                        }}
                    />
                </motion.div>
            </motion.header>

            {/* Main Content Grid */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="strategy-body"
            >
                {!sessionKey ? (
                    /* Empty State - No Race Selected */
                    <motion.div
                        className="strategy-empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            className="empty-state-icon"
                            animate={{ 
                                rotate: [0, -10, 10, -10, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                        >
                            🏎️
                        </motion.div>
                        <h2 className="empty-state-title">Ready to Analyze</h2>
                        <p className="empty-state-description">
                            Select a race from the dropdown above to start analyzing strategy, 
                            tyre management, and race performance.
                        </p>
                        <div className="empty-state-features">
                            <div className="empty-state-feature">
                                <span className="feature-icon">📊</span>
                                <span className="feature-text">Live Race Data</span>
                            </div>
                            <div className="empty-state-feature">
                                <span className="feature-icon">🔮</span>
                                <span className="feature-text">What-If Scenarios</span>
                            </div>
                            <div className="empty-state-feature">
                                <span className="feature-icon">💬</span>
                                <span className="feature-text">AI Strategy Assistant</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Left Side: What-If Panel */}
                        <motion.div
                            className="strategy-left-column"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <WhatIfPanel
                                sessionKey={sessionKey}
                                drivers={raceState?.drivers || []}
                            />
                        </motion.div>

                        {/* Right Side: Race State + Strategy Chart */}
                        <motion.div
                            className="strategy-right-column"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {/* Race Info Card */}
                            {raceState && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <RaceStateCard
                                        session={selectedRace}
                                        data={raceState}
                                        loading={loadingState}
                                    />
                                </motion.div>
                            )}

                            {/* Tyre Degradation Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <StrategyChart
                                    sessionKey={sessionKey}
                                    data={raceState}
                                />
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </motion.div>

            {/* Floating Chat Button */}
            <motion.button
                className="floating-chat-btn"
                onClick={() => setIsChatOpen(true)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="chat-btn-icon">💬</span>
                <span className="chat-btn-text">AI Assistant</span>
            </motion.button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        className="chat-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsChatOpen(false)}
                    >
                        <motion.div
                            className="chat-modal-content"
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="chat-modal-close"
                                onClick={() => setIsChatOpen(false)}
                            >
                                ✕
                            </button>
                            <ChatPanel
                                sessionKey={sessionKey}
                                raceState={raceState}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

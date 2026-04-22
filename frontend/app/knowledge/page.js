"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../lib/animations";
import { askKnowledge, searchKnowledge, getKnowledgeStats, getAvailableYears, getRegulationTypes } from "../../lib/api";

export default function KnowledgePage() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [years, setYears] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [mode, setMode] = useState("ask"); // "ask" or "search"
    const [searchResults, setSearchResults] = useState([]);

    // Format markdown text
    const formatMarkdown = (text) => {
        if (!text) return null;
        
        return text.split('\n').map((line, idx) => {
            // Handle headers with ###
            if (line.trim().startsWith('###')) {
                return (
                    <h3 key={idx} style={{
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        color: 'var(--accent-purple)',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid rgba(196, 77, 255, 0.3)',
                        paddingBottom: '0.5rem'
                    }}>
                        {line.replace(/^###\s*/, '').trim()}
                    </h3>
                );
            }
            
            // Handle subheaders with ##
            if (line.trim().startsWith('##')) {
                return (
                    <h4 key={idx} style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        marginTop: '1rem',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.5px'
                    }}>
                        {line.replace(/^##\s*/, '').trim()}
                    </h4>
                );
            }
            
            // Handle bullet points with * or -
            if (line.trim().match(/^[\*\-]\s+/)) {
                const content = line.replace(/^[\*\-]\s+/, '').trim();
                const parts = content.split(/(\*\*.*?\*\*)/g);
                return (
                    <li key={idx} style={{
                        marginLeft: '1.5rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-secondary)',
                        listStyleType: 'disc'
                    }}>
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i} style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </li>
                );
            }
            
            // Handle horizontal rules
            if (line.trim() === '---' || line.trim() === '***') {
                return (
                    <hr key={idx} style={{
                        border: 'none',
                        borderTop: '2px solid rgba(196, 77, 255, 0.3)',
                        margin: '1.5rem 0'
                    }} />
                );
            }
            
            // Handle regular text with bold
            if (line.trim()) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={idx} style={{ marginBottom: '0.75rem', lineHeight: '1.7' }}>
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i} style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            }
            
            // Empty lines
            return <br key={idx} />;
        });
    };

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, yearsData, typesData] = await Promise.all([
                    getKnowledgeStats(),
                    getAvailableYears(),
                    getRegulationTypes()
                ]);
                setStats(statsData);
                setYears(yearsData.years || []);
                setTypes(typesData.types || []);
            } catch (error) {
                console.error("Failed to load knowledge base data:", error);
            }
        }
        loadData();
    }, []);

    const handleAsk = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setAnswer(null);
        setSources([]);
        setSearchResults([]);

        try {
            if (mode === "ask") {
                const response = await askKnowledge(
                    question,
                    selectedYear || null,
                    selectedType || null
                );
                setAnswer(response.answer);
                setSources(response.sources || []);
            } else {
                const results = await searchKnowledge(
                    question,
                    selectedYear || null,
                    selectedType || null,
                    10
                );
                setSearchResults(results);
            }
        } catch (error) {
            console.error("Error:", error);
            setAnswer("Sorry, there was an error processing your request.");
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "What are the technical regulations for 2026?",
        "Explain the DRS rules",
        "What are the financial regulations?",
        "How does the cost cap work?",
        "What changed in 2024 regulations?"
    ];

    return (
        <div className="page-container knowledge-page">
            {/* Header */}
            <motion.header
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="knowledge-header"
            >
                <motion.div 
                    className="knowledge-title"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div 
                        className="knowledge-title-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        📚
                    </motion.div>
                    <div>
                        <h1>F1 KNOWLEDGE BASE</h1>
                        <p className="text-sm text-muted">FIA Regulations 2023-2026</p>
                    </div>
                </motion.div>

                {/* Stats */}
                {stats && (
                    <motion.div
                        className="knowledge-stats"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="stat-item">
                            <div className="stat-value">{stats.total_documents?.toLocaleString() || 0}</div>
                            <div className="stat-label">Documents</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{Object.keys(stats.by_year || {}).length}</div>
                            <div className="stat-label">Years</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{Object.keys(stats.by_type || {}).length}</div>
                            <div className="stat-label">Types</div>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            {/* Main Content */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="knowledge-body"
            >
                {/* Search Panel */}
                <div className="knowledge-search-panel glass-card">
                    {/* Mode Toggle */}
                    <div className="mode-toggle">
                        <button
                            className={`mode-btn ${mode === "ask" ? "active" : ""}`}
                            onClick={() => setMode("ask")}
                        >
                            🤖 Ask AI
                        </button>
                        <button
                            className={`mode-btn ${mode === "search" ? "active" : ""}`}
                            onClick={() => setMode("search")}
                        >
                            🔍 Search
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="knowledge-filters">
                        <select
                            className="race-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            className="race-select"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="knowledge-input-area">
                        <textarea
                            className="knowledge-input"
                            placeholder={mode === "ask" ? "Ask a question about F1 regulations..." : "Search regulations..."}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAsk();
                                }
                            }}
                            rows={3}
                        />
                        <button
                            className="knowledge-submit-btn"
                            onClick={handleAsk}
                            disabled={loading || !question.trim()}
                        >
                            {loading ? "⏳" : mode === "ask" ? "Ask" : "Search"}
                        </button>
                    </div>

                    {/* Suggested Questions */}
                    {!answer && !searchResults.length && (
                        <div className="suggested-questions">
                            <p className="text-xs text-muted mb-2">Try asking:</p>
                            <div className="suggestions-grid">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        className="suggestion-btn"
                                        onClick={() => setQuestion(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                {(answer || searchResults.length > 0) && (
                    <motion.div
                        className="knowledge-results glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {mode === "ask" && answer && (
                            <>
                                <h3 className="results-title">Answer</h3>
                                <div className="answer-text">{formatMarkdown(answer)}</div>

                                {sources.length > 0 && (
                                    <>
                                        <h4 className="sources-title">Sources</h4>
                                        <div className="sources-list">
                                            {sources.map((source, i) => (
                                                <div key={i} className="source-item">
                                                    <div className="source-meta">
                                                        <span className="source-badge">{source.metadata.year}</span>
                                                        <span className="source-badge">{source.metadata.type}</span>
                                                        <span className="source-badge">Issue {source.metadata.issue}</span>
                                                    </div>
                                                    <div className="source-text">{source.text.substring(0, 200)}...</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {mode === "search" && searchResults.length > 0 && (
                            <>
                                <h3 className="results-title">Search Results ({searchResults.length})</h3>
                                <div className="search-results-list">
                                    {searchResults.map((result, i) => (
                                        <div key={i} className="search-result-item">
                                            <div className="source-meta">
                                                <span className="source-badge">{result.metadata.year}</span>
                                                <span className="source-badge">{result.metadata.type}</span>
                                                <span className="source-badge">Issue {result.metadata.issue}</span>
                                                {result.distance && (
                                                    <span className="source-badge score">
                                                        Score: {(1 - result.distance).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="source-text">{result.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

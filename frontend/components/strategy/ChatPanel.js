"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askStrategy } from "../../app/lib/api";
import { SUGGESTED_QUESTIONS } from "../../app/lib/constants";

export default function ChatPanel({ sessionKey, raceState }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Send message handler
    const handleSend = async (text) => {
        if (!text.trim() || !sessionKey) return;

        // Optimistic UI update
        setMessages(prev => [...prev, { role: "user", text }]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await askStrategy(sessionKey, text);
            // Wait a moment for UX effect
            await new Promise(r => setTimeout(r, 600));

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: response.answer,
                    visuals: response.visuals // Future: inline charts
                }
            ]);
        } catch (e) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: "⚠️ Sorry, I encountered an error checking the strategy systems. Please try again."
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chat-panel glass-card">
            {/* Chat Header */}
            <div className="chat-panel-header">
                <div className="chat-panel-title">
                    <span className="chat-icon">💬</span>
                    <h3>AI Strategy Assistant</h3>
                </div>
                <div className="chat-panel-subtitle">
                    Ask questions about race strategy, tyre management, and more
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                            style={{ minHeight: '250px' }}
                        >
                            <motion.div 
                                className="text-5xl mb-4"
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                🏎️
                            </motion.div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '0.75rem',
                                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-cyan))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Ready to Analyze
                            </h2>
                            <p style={{
                                fontSize: '0.95rem',
                                color: 'var(--text-secondary)',
                                maxWidth: '350px',
                                lineHeight: '1.5'
                            }}>
                                {sessionKey 
                                    ? "Ask me about race strategy, tyre management, or pit stop timing."
                                    : "Select a race above to start analyzing strategy."}
                            </p>
                        </motion.div>
                    )}

                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`chat-message flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`chat-avatar w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                ${msg.role === "user" ? "bg-blue-600" : "bg-red-600"}`}
                            >
                                {msg.role === "user" ? "YOU" : "AI"}
                            </div>
                            <div className={`chat-bubble p-4 rounded-xl max-w-[80%] text-sm leading-relaxed
                ${msg.role === "user" ? "bg-blue-900/40 border border-blue-500/30" : "bg-zinc-800/80 border border-zinc-700"}`}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {msg.text.split('\n').map((line, idx) => {
                                    // Handle headers with ###
                                    if (line.trim().startsWith('###')) {
                                        return (
                                            <h3 key={idx} style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 900,
                                                color: 'var(--accent-cyan)',
                                                marginTop: '1.5rem',
                                                marginBottom: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid rgba(0, 229, 255, 0.3)',
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
                                                color: 'var(--accent-purple)',
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
                                        // Process bold within bullets
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
                                                        return <strong key={i} style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
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
                                                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                                                margin: '1rem 0'
                                            }} />
                                        );
                                    }
                                    
                                    // Handle regular text with bold
                                    if (line.trim()) {
                                        const parts = line.split(/(\*\*.*?\*\*)/g);
                                        return (
                                            <p key={idx} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
                                                {parts.map((part, i) => {
                                                    if (part.match(/^\*\*.*\*\*$/)) {
                                                        return <strong key={i} style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                                                    }
                                                    return part;
                                                })}
                                            </p>
                                        );
                                    }
                                    
                                    // Empty lines
                                    return <br key={idx} />;
                                })}
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 ml-12 items-center">
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150" />
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-300" />
                            <span className="text-xs text-zinc-500 ml-2">Analyzing data...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="chat-input-area p-4 border-t border-glass">
                {/* Quick Suggestions */}
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide" style={{ margin: '0.5rem 0', padding: '0.5rem 0' }}>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="text-xs rounded-full whitespace-nowrap transition-all hover:scale-105"
                            style={{
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                padding: '0.75rem 1.25rem',
                                background: 'rgba(196, 77, 255, 0.1)',
                                border: '2px solid rgba(196, 77, 255, 0.3)',
                                color: 'var(--accent-purple)',
                                fontFamily: 'var(--font-body)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(196, 77, 255, 0.2)';
                                e.target.style.borderColor = 'var(--accent-purple)';
                                e.target.style.boxShadow = '0 0 20px rgba(196, 77, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(196, 77, 255, 0.1)';
                                e.target.style.borderColor = 'rgba(196, 77, 255, 0.3)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        className="flex-1 focus:outline-none transition-all"
                        placeholder="Ask about strategy (e.g., 'Is the undercut viable?')"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isTyping || !sessionKey}
                        style={{
                            fontFamily: 'var(--font-body)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(0, 229, 255, 0.3)',
                            color: 'var(--text-primary)',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent-cyan)';
                            e.target.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping || !sessionKey}
                        className="transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        style={{
                            background: 'linear-gradient(135deg, var(--f1-red), var(--f1-red-dark))',
                            color: 'white',
                            boxShadow: '0 0 20px rgba(255, 0, 80, 0.4)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            if (!e.target.disabled) {
                                e.target.style.boxShadow = '0 0 30px rgba(255, 0, 80, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = '0 0 20px rgba(255, 0, 80, 0.4)';
                        }}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}

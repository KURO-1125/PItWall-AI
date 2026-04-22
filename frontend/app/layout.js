"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getHealth } from "../lib/api";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [llmStatus, setLlmStatus] = useState(null);

  useEffect(() => {
    getHealth()
      .then((data) => setLlmStatus(data?.llm))
      .catch(() => setLlmStatus(null));
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠", active: true },
    { href: "/strategy", label: "Strategy Advisor", icon: "🧠", active: true },
    { href: "/commentary", label: "AI Commentary", icon: "🎙️", active: true },
    { href: "/knowledge", label: "Knowledge Base", icon: "📚", active: true },
  ];

  return (
    <html lang="en">
      <head>
        <title>PitWall AI — F1 GenAI Command Center</title>
        <meta name="description" content="AI-powered Formula 1 strategy analysis, commentary, and knowledge base" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {isLanding ? (
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        ) : (
          <div className="app-layout">
            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            {/* Sidebar overlay */}
            {sidebarOpen && (
              <div
                className="sidebar-overlay open"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <div className="sidebar-logo">
                <div className="sidebar-logo-icon">P</div>
                <div className="sidebar-logo-text">
                  Pit<span>Wall</span> AI
                </div>
              </div>

              <div className="sidebar-section-title">Navigation</div>

              <nav className="sidebar-nav">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.active ? link.href : "#"}
                    className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sidebar-link-icon">{link.icon}</span>
                    {link.label}
                    {link.comingSoon && (
                      <span className="coming-soon">Soon</span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="sidebar-divider" />

              <div className="sidebar-section-title">System</div>
              <nav className="sidebar-nav">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener"
                  className="sidebar-link"
                >
                  <span className="sidebar-link-icon">📄</span>
                  API Docs
                </a>
              </nav>

              <div className="sidebar-status">
                <span
                  className={`sidebar-status-dot ${llmStatus?.active ? "online" : "offline"
                    }`}
                />
                <span className="sidebar-status-text">
                  {llmStatus?.active
                    ? `LLM: ${llmStatus.active}`
                    : "LLM: Offline"}
                </span>
              </div>
            </aside>

            {/* Main content */}
            <AnimatePresence mode="wait">
              <motion.main
                key={pathname}
                className="main-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        )}
      </body>
    </html>
  );
}

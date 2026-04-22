"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  fadeInUp,
  staggerContainer,
  staggerChild,
  scaleIn,
  buttonHover,
  buttonTap,
} from "../lib/animations";

const drivers2026 = [
  {
    name: "Charles Leclerc",
    number: "16",
    team: "Ferrari",
    color: "#E80020",
    carImage: "/ferrari.webp",
    driverImage: "/drivers/leclerc.avif",
    teammate: "Lewis Hamilton"
  },
  {
    name: "Lewis Hamilton",
    number: "44",
    team: "Ferrari",
    color: "#E80020",
    carImage: "/ferrari.webp",
    driverImage: "/drivers/hamilton.avif",
    teammate: "Charles Leclerc"
  },
  {
    name: "George Russell",
    number: "63",
    team: "Mercedes",
    color: "#27F4D2",
    carImage: "/mercedes.webp",
    driverImage: "/drivers/russell.avif",
    teammate: "Kimi Antonelli"
  },
  {
    name: "Kimi Antonelli",
    number: "12",
    team: "Mercedes",
    color: "#27F4D2",
    carImage: "/mercedes.webp",
    driverImage: "/drivers/antonelli.avif",
    teammate: "George Russell"
  },
  {
    name: "Max Verstappen",
    number: "3",
    team: "Red Bull Racing",
    color: "#3671C6",
    carImage: "/redbull.webp",
    driverImage: "/drivers/verstappen.avif",
    teammate: "Isack Hadjar"
  },
  {
    name: "Isack Hadjar",
    number: "6",
    team: "Red Bull Racing",
    color: "#3671C6",
    carImage: "/redbull.webp",
    driverImage: "/drivers/hadjar.avif",
    teammate: "Max Verstappen"
  },
  {
    name: "Lando Norris",
    number: "1",
    team: "McLaren",
    color: "#FF8000",
    carImage: "/maclaren.webp",
    driverImage: "/drivers/norris.avif",
    teammate: "Oscar Piastri"
  },
  {
    name: "Oscar Piastri",
    number: "81",
    team: "McLaren",
    color: "#FF8000",
    carImage: "/maclaren.webp",
    driverImage: "/drivers/piastri.avif",
    teammate: "Lando Norris"
  },
  {
    name: "Fernando Alonso",
    number: "14",
    team: "Aston Martin",
    color: "#229971",
    carImage: "/aston.webp",
    driverImage: "/drivers/alonso.avif",
    teammate: "Lance Stroll"
  },
  {
    name: "Lance Stroll",
    number: "18",
    team: "Aston Martin",
    color: "#229971",
    carImage: "/aston.webp",
    driverImage: "/drivers/stroll.avif",
    teammate: "Fernando Alonso"
  },
  {
    name: "Pierre Gasly",
    number: "10",
    team: "Alpine",
    color: "#FF87BC",
    carImage: "/alpine.webp",
    driverImage: "/drivers/gasly.avif",
    teammate: "Franco Colapinto"
  },
  {
    name: "Franco Colapinto",
    number: "43",
    team: "Alpine",
    color: "#FF87BC",
    carImage: "/alpine.webp",
    driverImage: "/drivers/colapinto.avif",
    teammate: "Pierre Gasly"
  },
  {
    name: "Esteban Ocon",
    number: "31",
    team: "Haas F1",
    color: "#B6BABD",
    carImage: "/hass.webp",
    driverImage: "/drivers/ocon.avif",
    teammate: "Oliver Bearman"
  },
  {
    name: "Oliver Bearman",
    number: "87",
    team: "Haas F1",
    color: "#B6BABD",
    carImage: "/hass.webp",
    driverImage: "/drivers/bearman.avif",
    teammate: "Esteban Ocon"
  },
  {
    name: "Carlos Sainz",
    number: "55",
    team: "Williams",
    color: "#64C4FF",
    carImage: "/williams.webp",
    driverImage: "/drivers/sainz.avif",
    teammate: "Alexander Albon"
  },
  {
    name: "Alexander Albon",
    number: "23",
    team: "Williams",
    color: "#64C4FF",
    carImage: "/williams.webp",
    driverImage: "/drivers/albon.avif",
    teammate: "Carlos Sainz"
  },
  {
    name: "Liam Lawson",
    number: "40",
    team: "Racing Bulls",
    color: "#6692FF",
    carImage: "/racingbulls.webp",
    driverImage: "/drivers/lawson.avif",
    teammate: "Arvid Lindblad"
  },
  {
    name: "Arvid Lindblad",
    number: "41",
    team: "Racing Bulls",
    color: "#6692FF",
    carImage: "/racingbulls.webp",
    driverImage: "/drivers/lindblad.avif",
    teammate: "Liam Lawson"
  },
  {
    name: "Nico Hülkenberg",
    number: "27",
    team: "Audi",
    color: "#FF1E00",
    carImage: "/audi.webp",
    driverImage: "/drivers/hulkenberg.avif",
    teammate: "Gabriel Bortoleto"
  },
  {
    name: "Gabriel Bortoleto",
    number: "5",
    team: "Audi",
    color: "#FF1E00",
    carImage: "/audi.webp",
    driverImage: "/drivers/bortoleto.avif",
    teammate: "Nico Hülkenberg"
  },
  {
    name: "Sergio Pérez",
    number: "11",
    team: "Cadillac",
    color: "#1E3A8A",
    carImage: "/cadillac.webp",
    driverImage: "/drivers/perez.avif",
    teammate: "Valtteri Bottas"
  },
  {
    name: "Valtteri Bottas",
    number: "77",
    team: "Cadillac",
    color: "#1E3A8A",
    carImage: "/cadillac.webp",
    driverImage: "/drivers/bottas.avif",
    teammate: "Sergio Pérez"
  },
];

export default function LandingPage() {
  const [activeDriver, setActiveDriver] = useState(0);

  return (
    <div className="landing-page">
      {/* ── Hero Section - Modern Full Width ─────────────── */}
      <section className="hero-section-modern">
        <div className="hero-bg-wrapper">
          <Image
            src="/hero-f1.jpg"
            alt="F1 Racing Car"
            fill
            className="hero-bg-main"
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="hero-gradient-overlay"></div>
        </div>
        
        <div className="hero-content-wrapper">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div 
              className="f1-logo-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="f1-logo">F1</div>
              <span>POWERED</span>
            </motion.div>

            <motion.h1 
              className="hero-title-modern"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="hero-title-small">PitWall AI</span>
              <span className="hero-title-main">COMMAND CENTER</span>
            </motion.h1>

            <motion.p 
              className="hero-description-modern"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Experience Formula 1 strategy like never before with comprehensive race
              telemetry analysis, AI-powered predictions, and real-time insights.
            </motion.p>

            <motion.div 
              className="hero-cta-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Link href="/strategy" className="btn-f1-primary">
                  <span>LAUNCH STRATEGY</span>
                  <span className="btn-arrow">→</span>
                </Link>
              </motion.div>
              <motion.a
                href="http://localhost:8000/docs"
                target="_blank"
                className="btn-f1-secondary"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                API DOCS
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated accent elements */}
        <div className="hero-accent-line hero-accent-top"></div>
        <div className="hero-accent-line hero-accent-bottom"></div>
      </section>

      {/* ── 2026 Drivers & Cars Section ──────────────────── */}
      <section className="drivers-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="section-header-f1"
        >
          <div className="section-badge">2026 SEASON</div>
          <h2 className="section-title-f1">DRIVERS & TEAMS</h2>
          <p className="section-subtitle-f1">
            Meet the champions competing for glory on the world's greatest circuits
          </p>
        </motion.div>

        <div className="drivers-carousel">
          <div className="driver-main-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDriver}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="driver-card-large"
                style={{ borderColor: drivers2026[activeDriver].color }}
              >
                <div className="driver-card-bg" style={{ background: `linear-gradient(135deg, ${drivers2026[activeDriver].color}22, transparent)` }}></div>
                
                <div className="driver-info-main">
                  <div className="driver-image-container">
                    <Image
                      src={drivers2026[activeDriver].driverImage}
                      alt={drivers2026[activeDriver].name}
                      width={200}
                      height={200}
                      className="driver-image"
                    />
                  </div>
                  <div className="driver-number" style={{ color: drivers2026[activeDriver].color }}>
                    {drivers2026[activeDriver].number}
                  </div>
                  <div className="driver-details">
                    <h3 className="driver-name">{drivers2026[activeDriver].name}</h3>
                    <p className="driver-team" style={{ color: drivers2026[activeDriver].color }}>
                      {drivers2026[activeDriver].team}
                    </p>
                  </div>
                </div>

                <div className="driver-car-visual">
                  <div className="car-image-container">
                    <Image
                      src={drivers2026[activeDriver].carImage}
                      alt={`${drivers2026[activeDriver].team} F1 Car`}
                      width={600}
                      height={300}
                      className="car-image"
                      priority
                    />
                  </div>
                  <div className="team-color-bar" style={{ background: drivers2026[activeDriver].color }}></div>
                  <div className="teammate-info">
                    <span className="teammate-label">TEAMMATE:</span>
                    <span className="teammate-name">{drivers2026[activeDriver].teammate}</span>
                  </div>
                </div>

                <div className="driver-nav-arrows">
                  <motion.button
                    className="nav-arrow nav-prev"
                    onClick={() => setActiveDriver((prev) => (prev === 0 ? drivers2026.length - 1 : prev - 1))}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>←</span>
                  </motion.button>
                  <motion.button
                    className="nav-arrow nav-next"
                    onClick={() => setActiveDriver((prev) => (prev === drivers2026.length - 1 ? 0 : prev + 1))}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>→</span>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div 
            className="drivers-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {drivers2026.map((driver, index) => (
              <motion.div
                key={driver.name}
                variants={staggerChild}
                className={`driver-card-small ${index === activeDriver ? 'active' : ''}`}
                onClick={() => setActiveDriver(index)}
                whileHover={{ scale: 1.08, y: -10 }}
                whileTap={{ scale: 0.98 }}
                style={{ borderColor: driver.color }}
              >
                <div className="driver-card-small-bg" style={{ background: `${driver.color}22` }}></div>
                <div className="driver-card-small-image">
                  <Image
                    src={driver.driverImage}
                    alt={driver.name}
                    width={80}
                    height={80}
                    className="driver-small-img"
                  />
                </div>
                <div className="driver-number-small" style={{ color: driver.color }}>
                  {driver.number}
                </div>
                <div className="driver-name-small">{driver.name.split(' ')[1]}</div>
                <div className="team-indicator" style={{ background: driver.color }}></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────── */}
      <section className="features-section-f1">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="section-header-f1"
        >
          <div className="section-badge">CAPABILITIES</div>
          <h2 className="section-title-f1">BUILT FOR CHAMPIONS</h2>
          <p className="section-subtitle-f1">
            Powered by state-of-the-art AI and real-time telemetry data
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="features-grid-f1"
        >
          <FeatureCardF1
            title="STRATEGY ADVISOR"
            description="Real-time tyre degradation modeling, pit window analysis, and undercut predictions powered by AI."
            icon="🧠"
            color="#e10600"
            status="LIVE"
            link="/strategy"
          />
          <FeatureCardF1
            title="LIVE COMMENTARY"
            description="AI-generated play-by-play commentary in multiple styles: Classic, Technical, or Casual."
            icon="🎙️"
            color="#00d4ff"
            status="SOON"
          />
          <FeatureCardF1
            title="KNOWLEDGE BASE"
            description="Ask anything about F1 regulations, history, or technical specs. Powered by RAG."
            icon="📚"
            color="#b44dff"
            status="LIVE"
            link="/knowledge"
          />
        </motion.div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="cta-section-f1">
        <div className="cta-glow-red"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="cta-content"
        >
          <h2 className="cta-title-f1">READY TO RACE?</h2>
          <p className="cta-subtitle-f1">
            Join the future of F1 analysis. Completely free. No subscription required.
          </p>
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Link href="/strategy" className="btn-f1-cta">
              <span>START ANALYZING NOW</span>
              <motion.span 
                className="btn-arrow"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

function FeatureCardF1({ title, description, icon, color, status, link }) {
  const CardContent = (
    <motion.div
      variants={staggerChild}
      whileHover={{ y: -15, scale: 1.02, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      className="feature-card-f1"
      style={{ borderColor: `${color}44` }}
    >
      <div className="feature-status" style={{ background: status === 'LIVE' ? '#00ff88' : '#666' }}>
        {status}
      </div>
      <motion.div 
        className="feature-icon-f1" 
        style={{ background: `${color}22`, color: color }}
        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
      >
        {icon}
      </motion.div>
      <h3 className="feature-title-f1">{title}</h3>
      <p className="feature-desc-f1">{description}</p>
      <motion.div 
        className="feature-arrow" 
        style={{ color: color }}
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        →
      </motion.div>
    </motion.div>
  );

  return link ? <Link href={link}>{CardContent}</Link> : CardContent;
}

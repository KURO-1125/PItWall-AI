/**
 * PitWall AI — Constants
 * F1 team colors, driver data, tyre info.
 */

export const TEAM_COLORS = {
    "Red Bull Racing": "#3671C6",
    "Ferrari": "#E80020",
    "McLaren": "#FF8000",
    "Mercedes": "#27F4D2",
    "Aston Martin": "#229971",
    "Alpine": "#FF87BC",
    "Williams": "#64C4FF",
    "Haas F1 Team": "#B6BABD",
    "RB": "#6692FF",
    "Kick Sauber": "#52E252",
    // Aliases
    "Red Bull": "#3671C6",
    "AlphaTauri": "#6692FF",
    "Alfa Romeo": "#52E252",
};

export const TYRE_COLORS = {
    SOFT: "#ff3333",
    MEDIUM: "#ffd700",
    HARD: "#e0e0e0",
    INTERMEDIATE: "#00cc00",
    WET: "#0066ff",
};

export const TYRE_LABELS = {
    SOFT: "S",
    MEDIUM: "M",
    HARD: "H",
    INTERMEDIATE: "I",
    WET: "W",
};

export const COMPOUNDS = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];

export const YEARS = [2025, 2024, 2023];

export const SUGGESTED_QUESTIONS = [
    "What's the optimal pit strategy for the race leader?",
    "Should the driver on softs pit now or extend the stint?",
    "Is an undercut viable with the current gaps?",
    "Compare the tyre degradation between the top 3 drivers",
    "What are the risks of switching to hard tyres?",
];

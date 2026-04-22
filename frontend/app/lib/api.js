/**
 * PitWall AI — API Client
 * Communicates with the FastAPI backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.text().catch(() => "Unknown error");
        throw new Error(`API Error ${response.status}: ${error}`);
    }

    return response.json();
}

// ── Races ─────────────────────────────────────────────────

export async function getRaces(year, sessionName) {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (sessionName) params.set("session_name", sessionName);
    return request(`/api/races?${params}`);
}

export async function getMeetings(year) {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    return request(`/api/races/meetings?${params}`);
}

export async function getRaceState(sessionKey) {
    return request(`/api/races/${sessionKey}/state`);
}

export async function getDrivers(sessionKey) {
    return request(`/api/races/${sessionKey}/drivers`);
}

export async function getLaps(sessionKey, driverNumber) {
    const params = new URLSearchParams();
    if (driverNumber) params.set("driver_number", driverNumber);
    return request(`/api/races/${sessionKey}/laps?${params}`);
}

export async function getStints(sessionKey) {
    return request(`/api/races/${sessionKey}/stints`);
}

export async function getIntervals(sessionKey) {
    return request(`/api/races/${sessionKey}/intervals`);
}

// ── Strategy ──────────────────────────────────────────────

export async function askStrategy(sessionKey, question, driverNumber) {
    return request("/api/strategy/ask", {
        method: "POST",
        body: JSON.stringify({
            session_key: sessionKey,
            question,
            driver_number: driverNumber || null,
        }),
    });
}

export async function whatIfStrategy(sessionKey, driverNumber, pitLap, compound) {
    return request("/api/strategy/whatif", {
        method: "POST",
        body: JSON.stringify({
            session_key: sessionKey,
            driver_number: driverNumber,
            pit_lap: pitLap,
            compound,
        }),
    });
}

export async function getStrategyOverview(sessionKey) {
    return request(`/api/strategy/${sessionKey}/overview`);
}

// ── Knowledge Base ────────────────────────────────────────

export async function searchKnowledge(query, year, type, nResults = 5) {
    return request("/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({
            query,
            year: year || null,
            type: type || null,
            n_results: nResults,
        }),
    });
}

export async function askKnowledge(question, year, type) {
    return request("/api/knowledge/ask", {
        method: "POST",
        body: JSON.stringify({
            question,
            year: year || null,
            type: type || null,
        }),
    });
}

export async function getKnowledgeStats() {
    return request("/api/knowledge/stats");
}

export async function ingestPDFs(force = false) {
    return request(`/api/knowledge/ingest?force=${force}`, {
        method: "POST",
    });
}

export async function getAvailableYears() {
    return request("/api/knowledge/years");
}

export async function getRegulationTypes() {
    return request("/api/knowledge/types");
}

// ── Commentary ────────────────────────────────────────────

export async function getCommentaryPersonalities() {
    return request("/api/commentary/personalities");
}

export async function generateCommentary(sessionKey, personality, startLap, endLap, focusDriver) {
    return request("/api/commentary/generate", {
        method: "POST",
        body: JSON.stringify({
            session_key: sessionKey,
            personality: personality || "professional",
            start_lap: startLap || null,
            end_lap: endLap || null,
            focus_driver: focusDriver || null,
        }),
    });
}

export async function generateHighlightReel(sessionKey, personality) {
    return request("/api/commentary/highlight-reel", {
        method: "POST",
        body: JSON.stringify({
            session_key: sessionKey,
            personality: personality || "dramatic",
        }),
    });
}

// ── Health ────────────────────────────────────────────────

export async function getHealth() {
    return request("/health");
}

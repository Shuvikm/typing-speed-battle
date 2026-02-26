/**
 * Centralized API service for all REST calls to the backend.
 * Base URL is driven by the REACT_APP_API_URL env variable (default: http://localhost:3001).
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/**
 * Fetch the global leaderboard (top 50 players by best WPM).
 * @returns {Promise<Array>}
 */
export const fetchLeaderboard = () =>
    fetch(`${BASE_URL}/api/leaderboard`).then(handleResponse);

// ─── Player ───────────────────────────────────────────────────────────────────

/**
 * Fetch a single player's stats by name.
 * @param {string} name
 * @returns {Promise<Object>}
 */
export const fetchPlayer = (name) =>
    fetch(`${BASE_URL}/api/player/${encodeURIComponent(name)}`).then(handleResponse);

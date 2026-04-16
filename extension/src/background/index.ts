import { io, Socket } from 'socket.io-client';
import type { Match, TeamRanking } from '@sportsbook/types';

/**
 * Background Service Worker
 *
 * Maintains a persistent WebSocket connection to the backend.
 * Relays real-time match and standings updates to the popup/side-panel UI
 * via chrome.runtime messaging. Uses chrome.alarms as a keep-alive heartbeat.
 */

const BACKEND_URL = 'http://127.0.0.1:3000';
const HEARTBEAT_ALARM = 'socket-heartbeat';
const HEARTBEAT_INTERVAL_MINUTES = 0.5;

let socket: Socket | null = null;

/** Initializes the WebSocket connection if not already active. */
function initSocket() {
    if (socket?.connected) return;

    socket = io(BACKEND_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
        console.log('[FL-Sports] WebSocket connected');
    });

    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            socket?.connect();
        }
    });

    socket.on('connect_error', (error) => {
        console.error('[FL-Sports] WebSocket error:', error.message);
    });

    // Relay match updates to the extension UI
    socket.on('MATCH_UPDATE', (data: Match) => {
        chrome.storage.local.set({ [`match_${data.id}`]: data });
        chrome.runtime.sendMessage({ type: 'MATCH_UPDATE', data }).catch(() => {
            // Popup/panel closed — no listener active
        });
    });

    // Relay standings updates to the extension UI
    socket.on('STANDINGS_UPDATE', (data: TeamRanking[]) => {
        chrome.runtime.sendMessage({ type: 'STANDINGS_UPDATE', data }).catch(() => {
            // Popup/panel closed — no listener active
        });
    });
}

// Extension lifecycle: first install / update
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error('[FL-Sports] Side panel error:', error));

    chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: HEARTBEAT_INTERVAL_MINUTES });
    initSocket();
});

// Keep-alive heartbeat: reconnect if the socket dropped
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === HEARTBEAT_ALARM) {
        if (!socket || !socket.connected) {
            initSocket();
        }
    }
});

// Ensure socket starts when the service worker wakes for any event
initSocket();

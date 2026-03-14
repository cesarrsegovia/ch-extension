import { io, Socket } from 'socket.io-client';
import type { Match, Odds, TeamRanking } from '@sportsbook/types';

/**
 * Background Service Worker:
 * Manages WebSocket persistence, handles real-time updates from the backend,
 * and synchronizes state between the background script and frontend UI.
 */

let socket: Socket | null = null;

/**
 * Initializes the WebSocket connection and sets up message listeners.
 */
function initSocket() {
    if (socket?.connected) return;

    socket = io('http://127.0.0.1:3000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
        // Connected to backend
    });

    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            // the disconnection was initiated by the server, you need to reconnect manually
            socket?.connect();
        }
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
    });

    // Data relay listeners: 
    // Captures updates from backend and forwards them to the extension UI.
    socket.on('MATCH_UPDATE', (data: Match) => {
        chrome.storage.local.set({ [`match_${data.id}`]: data });
        chrome.runtime.sendMessage({ type: 'MATCH_UPDATE', data }).catch(() => {
            // UI closed, no action needed
        });
    });

    socket.on('ODDS_UPDATE', (data: Odds) => {
        chrome.storage.local.set({ [`odds_${data.matchId}`]: data });
        chrome.runtime.sendMessage({ type: 'ODDS_UPDATE', data }).catch(() => {
            // UI closed, no action needed
        });
    });

    socket.on('STANDINGS_UPDATE', (data: TeamRanking[]) => {
        chrome.runtime.sendMessage({ type: 'STANDINGS_UPDATE', data }).catch(() => {
            // UI closed, no action needed
        });
    });
}

// Extension Lifecycle: Initialization
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error('Error setting panel behavior:', error));

    chrome.alarms.create('socket-heartbeat', { periodInMinutes: 0.5 });
    initSocket();
});

// Keep-alive mechanisms via alarms (Heartbeat)
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'socket-heartbeat') {
        if (!socket || !socket.connected) {
            initSocket();
        }
    }
});

// Asegurar que el socket se inicie al despertar el worker por cualquier evento
initSocket();

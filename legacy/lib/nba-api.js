// lib/nba-api.js

/**
 * NBA API module — fetches scores, odds and team logos
 * Uses The Odds API (v4) for scores/odds
 * Uses ESPN CDN for reliable team logos
 * Uses TheSportsDB (v1) for league badge
 */

const NBA_ODDS_API_KEY = "bad96ac3db0872eaeabc81e726a0b3f4";
const NBA_ODDS_API_URL = "https://api.the-odds-api.com/v4";
const NBA_SPORTS_DB_URL = "https://www.thesportsdb.com/api/v1/json/3";
const NBA_LEAGUE_ID = "4387";

/**
 * NBA team logos from ESPN CDN — reliable, no rate limits.
 * Keys match The Odds API team names exactly.
 * URL pattern: https://a.espncdn.com/i/teamlogos/nba/500/{abbr}.png
 */
const NBA_TEAM_LOGOS = {
    "Atlanta Hawks": "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
    "Boston Celtics": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    "Brooklyn Nets": "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
    "Charlotte Hornets": "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
    "Chicago Bulls": "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    "Cleveland Cavaliers": "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
    "Dallas Mavericks": "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
    "Denver Nuggets": "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
    "Detroit Pistons": "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
    "Golden State Warriors": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    "Houston Rockets": "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
    "Indiana Pacers": "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
    "Los Angeles Clippers": "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
    "Los Angeles Lakers": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    "Memphis Grizzlies": "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
    "Miami Heat": "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    "Milwaukee Bucks": "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
    "Minnesota Timberwolves": "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
    "New Orleans Pelicans": "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
    "New York Knicks": "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    "Oklahoma City Thunder": "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
    "Orlando Magic": "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
    "Philadelphia 76ers": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    "Phoenix Suns": "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
    "Portland Trail Blazers": "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
    "Sacramento Kings": "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
    "San Antonio Spurs": "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
    "Toronto Raptors": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    "Utah Jazz": "https://a.espncdn.com/i/teamlogos/nba/500/utah.png",
    "Washington Wizards": "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png"
};

/**
 * Fetch NBA matches (scores + odds) with team logos.
 * Uses ESPN Scoreboard API.
 * Returns live matches and today's upcoming matches.
 * @returns {Promise<Array>} Array of match objects
 */
async function getNbaMatches() {
    try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        const events = data.events || [];
        const allMatches = [];

        for (const event of events) {
            const comp = event.competitions[0];
            const home = comp.competitors.find(c => c.homeAway === 'home');
            const away = comp.competitors.find(c => c.homeAway === 'away');

            // Status logic
            const statusType = event.status.type.name; // e.g. "STATUS_SCHEDULED", "STATUS_IN_PROGRESS", "STATUS_HALFTIME", "STATUS_END_PERIOD", "STATUS_FINAL"
            const isCompleted = event.status.type.completed;
            const isScheduled = statusType === "STATUS_SCHEDULED";
            const isPostponedOrCanceled = statusType === "STATUS_POSTPONED" || statusType === "STATUS_CANCELED";
            const isLive = !isCompleted && !isScheduled && !isPostponedOrCanceled;

            // Skip completed/postponed
            if (isCompleted || isPostponedOrCanceled) continue;

            // Odds mapping
            let matchOdds = null;
            if (comp.odds && comp.odds.length > 0) {
                const odd = comp.odds[0];
                matchOdds = {
                    home: odd.homeTeamOdds?.moneyLine || odd.details || '-',
                    away: odd.awayTeamOdds?.moneyLine || '-',
                    bookmaker: odd.provider?.name || "ESPN BET"
                };
            }

            allMatches.push({
                id: event.id,
                league: "NBA",
                homeTeam: home.team.displayName,
                awayTeam: away.team.displayName,
                homeScore: parseInt(home.score) || 0,
                awayScore: parseInt(away.score) || 0,
                homeLogo: home.team.logo || NBA_TEAM_LOGOS[home.team.displayName] || null,
                awayLogo: away.team.logo || NBA_TEAM_LOGOS[away.team.displayName] || null,
                date: event.date,
                status: isLive ? "Live" : "Upcoming",
                isLive,
                clock: event.status.displayClock || '',
                periodDetail: event.status.type.shortDetail || '',
                odds: matchOdds
            });
        }

        allMatches.sort((a, b) => {
            if (a.isLive && !b.isLive) return -1;
            if (!a.isLive && b.isLive) return 1;
            return new Date(a.date) - new Date(b.date);
        });

        return allMatches;

    } catch (error) {
        console.error("Error fetching NBA matches from ESPN:", error);
        return [];
    }
}

/**
 * Get the NBA league badge from TheSportsDB.
 * @returns {Promise<string|null>} Badge URL or null
 */
async function getNbaLeagueBadge() {
    try {
        const response = await fetch(`${NBA_SPORTS_DB_URL}/lookupleague.php?id=${NBA_LEAGUE_ID}`);
        const data = await response.json();
        return data.leagues?.[0]?.strBadge || null;
    } catch (error) {
        return null;
    }
}
/**
 * Fetches NBA conference standings from ESPN public API.
 * @returns {Promise<{east: Array, west: Array}>}
 */
async function getNbaStandings() {
    try {
        const response = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
        const data = await response.json();

        const result = { east: [], west: [] };

        if (!data.children) return result;

        data.children.forEach(conference => {
            const isEast = conference.abbreviation === 'East';
            const entries = conference.standings?.entries || [];

            const teams = entries.map(entry => {
                const team = entry.team || {};
                const stats = entry.stats || [];

                const getStat = (type) => {
                    const s = stats.find(st => st.type === type);
                    return s ? s : null;
                };

                return {
                    name: team.displayName || team.name || 'Unknown',
                    abbreviation: team.abbreviation || '',
                    logo: team.logos?.[0]?.href || '',
                    seed: getStat('playoffseed')?.value || 0,
                    wins: getStat('wins')?.value || 0,
                    losses: getStat('losses')?.value || 0,
                    winPct: getStat('winpercent')?.displayValue || '.000',
                    gb: getStat('gamesbehind')?.displayValue || '-',
                    streak: getStat('streak')?.displayValue || '-',
                    l10: stats.find(s => s.type === 'lasttengames')?.summary || '-',
                    record: stats.find(s => s.type === 'total')?.summary || '-'
                };
            });

            // Sort by seed
            teams.sort((a, b) => a.seed - b.seed);

            if (isEast) {
                result.east = teams;
            } else {
                result.west = teams;
            }
        });

        return result;
    } catch (error) {
        console.error('Error fetching NBA standings:', error);
        return { east: [], west: [] };
    }
}

/**
 * Fetches NBA schedule/scoreboard for a specific date from ESPN.
 * @param {string} dateStr - Date in YYYYMMDD format
 * @returns {Promise<Array>} Array of game objects
 */
async function getNbaSchedule(dateStr) {
    try {
        const response = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`
        );
        const data = await response.json();

        if (!data.events) return [];

        return data.events.map(event => {
            const comp = event.competitions?.[0] || {};
            const home = comp.competitors?.find(c => c.homeAway === 'home') || {};
            const away = comp.competitors?.find(c => c.homeAway === 'away') || {};
            const status = event.status || comp.status || {};

            return {
                id: event.id,
                name: event.shortName || event.name,
                date: event.date,
                homeTeam: {
                    name: home.team?.displayName || '',
                    abbreviation: home.team?.abbreviation || '',
                    logo: home.team?.logo || '',
                    record: home.records?.[0]?.summary || '',
                    score: home.score || '0'
                },
                awayTeam: {
                    name: away.team?.displayName || '',
                    abbreviation: away.team?.abbreviation || '',
                    logo: away.team?.logo || '',
                    record: away.records?.[0]?.summary || '',
                    score: away.score || '0'
                },
                venue: comp.venue?.fullName || '',
                broadcast: comp.broadcasts?.[0]?.names?.[0] || '',
                statusDetail: status.type?.shortDetail || status.type?.detail || '',
                statusState: status.type?.state || 'pre', // pre, in, post
                completed: status.type?.completed || false,
                clock: status.displayClock || '',
                period: status.period || 0
            };
        });
    } catch (error) {
        console.error('Error fetching NBA schedule:', error);
        return [];
    }
}

// Export globally
window.NbaAPI = {
    getNbaMatches,
    getNbaLeagueBadge,
    getNbaStandings,
    getNbaSchedule
};

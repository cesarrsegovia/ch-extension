/**
 * Manual Sync Script
 *
 * Synchronizes all league matches and standings from ESPN.
 * Run with: npx ts-node scripts/sync.ts
 *
 * Supports optional filters:
 *   npx ts-node scripts/sync.ts --soccer     (only soccer leagues)
 *   npx ts-node scripts/sync.ts --us         (only NBA, NHL, MLB)
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface LeagueConfig {
    sport: string;
    espnSlug: string;
    dbKey: string;
    group: 'us' | 'soccer';
}

const LEAGUES: LeagueConfig[] = [
    { sport: 'basketball', espnSlug: 'nba',                    dbKey: 'NBA',              group: 'us' },
    { sport: 'hockey',     espnSlug: 'nhl',                    dbKey: 'NHL',              group: 'us' },
    { sport: 'baseball',   espnSlug: 'mlb',                    dbKey: 'MLB',              group: 'us' },
    { sport: 'soccer',     espnSlug: 'arg.1',                  dbKey: 'SOCCER',           group: 'soccer' },
    { sport: 'soccer',     espnSlug: 'uefa.champions',         dbKey: 'CHAMPIONS-LEAGUE', group: 'soccer' },
    { sport: 'soccer',     espnSlug: 'conmebol.libertadores',  dbKey: 'LIBERTADORES',     group: 'soccer' },
    { sport: 'soccer',     espnSlug: 'conmebol.sudamericana',  dbKey: 'SUDAMERICANA',     group: 'soccer' },
    { sport: 'soccer',     espnSlug: 'fifa.world',             dbKey: 'WORLD-CUP',        group: 'soccer' },
];

function buildSyncDates(): string[] {
    const today = new Date();
    return [-1, 0, 1].map(offset => {
        const date = new Date(today.getTime() + offset * 86_400_000);
        return date.toISOString().split('T')[0].replace(/-/g, '');
    });
}

function resolveMatchStatus(event: any): { status: string; clock: string } {
    const state = event.status?.type?.state;
    const completed = event.status?.type?.completed;
    const status = state === 'in' ? 'LIVE' : completed ? 'FINISHED' : 'SCHEDULED';
    const clock = status === 'FINISHED' ? 'FINAL' : (event.status?.displayClock || '');
    return { status, clock };
}

async function syncMatches(league: LeagueConfig): Promise<number> {
    const dates = buildSyncDates();
    let total = 0;

    for (const dateStr of dates) {
        const url = `https://site.api.espn.com/apis/site/v2/sports/${league.sport}/${league.espnSlug}/scoreboard?dates=${dateStr}`;
        try {
            const { data } = await axios.get(url);
            const events = data.events || [];
            total += events.length;

            for (const event of events) {
                const comp = event.competitions?.[0];
                if (!comp) continue;

                const home = comp.competitors?.find((c: any) => c.homeAway === 'home');
                const away = comp.competitors?.find((c: any) => c.homeAway === 'away');
                if (!home || !away) continue;

                const { status, clock } = resolveMatchStatus(event);

                await prisma.match.upsert({
                    where: { externalId: event.id },
                    update: {
                        homeScore: parseInt(home.score) || 0,
                        awayScore: parseInt(away.score) || 0,
                        homeLogo: home.team.logo || null,
                        awayLogo: away.team.logo || null,
                        status, currentClock: clock,
                        updatedAt: new Date(),
                    },
                    create: {
                        externalId: event.id,
                        sport: league.sport,
                        league: league.dbKey,
                        homeTeam: home.team.displayName,
                        awayTeam: away.team.displayName,
                        homeLogo: home.team.logo || null,
                        awayLogo: away.team.logo || null,
                        homeScore: parseInt(home.score) || 0,
                        awayScore: parseInt(away.score) || 0,
                        status,
                        startTime: new Date(event.date),
                        currentClock: clock,
                    },
                });
            }
        } catch (err: any) {
            console.error(`  ✗ Matches ${league.dbKey} ${dateStr}: ${err.message}`);
        }
    }
    return total;
}

function getStatValue(stats: any[], name: string): number {
    return stats.find((s: any) => s.name === name)?.value || 0;
}

async function syncStandings(league: LeagueConfig): Promise<number> {
    const url = `https://site.api.espn.com/apis/v2/sports/${league.sport}/${league.espnSlug}/standings`;
    try {
        const { data } = await axios.get(url);
        const groups = data.children || (data.standings ? [data] : []);
        let teamCount = 0;

        for (const group of groups) {
            const conference = group.name || 'General';
            const entries = (group.standings?.entries || group.entries) || [];
            teamCount += entries.length;

            for (const entry of entries) {
                const team = entry.team;
                const stats = entry.stats;

                const wins = getStatValue(stats, 'wins');
                const losses = getStatValue(stats, 'losses');
                const draws = getStatValue(stats, 'ties') || getStatValue(stats, 'draws');
                const goalsFor = getStatValue(stats, 'pointsFor') || getStatValue(stats, 'goalsFor');
                const goalsAgainst = getStatValue(stats, 'pointsAgainst') || getStatValue(stats, 'goalsAgainst');
                const points = getStatValue(stats, 'points');
                const pct = stats.find((s: any) => ['winPercent', 'points'].includes(s.name))?.value || 0;
                const seed = stats.find((s: any) => ['rank', 'playoffSeed'].includes(s.name))?.value || 0;
                const gamesBehind = getStatValue(stats, 'gamesBehind');
                const streak = stats.find((s: any) => s.name === 'streak')?.displayValue || '';

                const shared = {
                    wins: Math.floor(wins), draws: Math.floor(draws), losses: Math.floor(losses),
                    goalsFor: Math.floor(goalsFor), goalsAgainst: Math.floor(goalsAgainst),
                    points: Math.floor(points), pct: parseFloat(pct.toString()),
                    seed: Math.floor(seed), gamesBehind: parseFloat(gamesBehind.toString()),
                    streak, teamAbbr: team.abbreviation,
                    teamLogo: team.logos?.[0]?.href || null,
                };

                await prisma.teamRanking.upsert({
                    where: { league_teamName: { league: league.dbKey, teamName: team.displayName } },
                    update: { ...shared, lastUpdateAt: new Date() },
                    create: { league: league.dbKey, conference, teamName: team.displayName, ...shared },
                });
            }
        }
        return teamCount;
    } catch (err: any) {
        console.error(`  ✗ Standings ${league.dbKey}: ${err.message}`);
        return 0;
    }
}

async function run() {
    const filter = process.argv[2];
    const leagues = filter === '--soccer' ? LEAGUES.filter(l => l.group === 'soccer')
                  : filter === '--us'     ? LEAGUES.filter(l => l.group === 'us')
                  : LEAGUES;

    console.log(`\n⚡ Syncing ${leagues.length} leagues...\n`);

    for (const league of leagues) {
        const matchCount = await syncMatches(league);
        const standingCount = await syncStandings(league);
        console.log(`  ✓ ${league.dbKey.padEnd(18)} ${matchCount} matches, ${standingCount} standings`);
    }

    console.log('\n✅ Sync complete.\n');
}

run().finally(() => prisma.$disconnect());

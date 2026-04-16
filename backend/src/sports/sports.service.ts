import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { OddsGateway } from '../websocket/odds/odds.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Match, Odds, TeamRanking } from '@sportsbook/types';

interface LeagueConfig {
    sport: string;
    espnSlug: string;
    dbKey: string;
}

/**
 * Central service for ESPN data ingestion, persistence, and real-time broadcasting.
 *
 * All supported leagues are defined once in LEAGUES. Cron jobs iterate over
 * this configuration to keep matches and standings up-to-date.
 */
@Injectable()
export class SportsService {
    private readonly logger = new Logger(SportsService.name);

    private static readonly LEAGUES: LeagueConfig[] = [
        { sport: 'basketball', espnSlug: 'nba',                    dbKey: 'NBA' },
        { sport: 'hockey',     espnSlug: 'nhl',                    dbKey: 'NHL' },
        { sport: 'baseball',   espnSlug: 'mlb',                    dbKey: 'MLB' },
        { sport: 'soccer',     espnSlug: 'arg.1',                  dbKey: 'SOCCER' },
        { sport: 'soccer',     espnSlug: 'uefa.champions',         dbKey: 'CHAMPIONS-LEAGUE' },
        { sport: 'soccer',     espnSlug: 'conmebol.libertadores',  dbKey: 'LIBERTADORES' },
        { sport: 'soccer',     espnSlug: 'conmebol.sudamericana',  dbKey: 'SUDAMERICANA' },
        { sport: 'soccer',     espnSlug: 'fifa.world',             dbKey: 'WORLD-CUP' },
    ];

    constructor(
        private prisma: PrismaService,
        private wsGateway: OddsGateway,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    // ─── Public API ──────────────────────────────────────────────

    /**
     * Returns recent matches for a league (or all soccer matches for the hub view).
     * Results are cached for 1 minute.
     */
    async findAll(league: string): Promise<Match[]> {
        const cacheKey = `${league.toLowerCase()}_matches_dashboard`;
        const cached = await this.cacheManager.get<Match[]>(cacheKey);
        if (cached) return cached;

        const twoDaysAgo = this.daysAgo(2);
        const isAllSoccer = league.toLowerCase() === 'soccer_all';

        const where = isAllSoccer
            ? { sport: 'soccer', startTime: { gte: twoDaysAgo } }
            : { league: league.toUpperCase(), startTime: { gte: twoDaysAgo } };

        const matches = await this.prisma.match.findMany({
            where,
            include: { odds: true },
            orderBy: { startTime: 'asc' },
        });

        const results = matches.map(m => ({
            ...m,
            startTime: m.startTime.toISOString(),
        })) as unknown as Match[];

        await this.cacheManager.set(cacheKey, results, 60_000);
        return results;
    }

    /**
     * Returns standings for a specific league.
     * Returns empty for the soccer hub view. Cached for 5 minutes.
     */
    async getStandings(league: string): Promise<TeamRanking[]> {
        if (league.toLowerCase() === 'soccer_all') return [];

        const cacheKey = `${league.toLowerCase()}_standings_dashboard`;
        const cached = await this.cacheManager.get<TeamRanking[]>(cacheKey);
        if (cached) return cached;

        const rankings = await this.prisma.teamRanking.findMany({
            where: { league: league.toUpperCase() },
            orderBy: [{ conference: 'asc' }, { seed: 'asc' }],
        });

        const results = rankings as unknown as TeamRanking[];
        await this.cacheManager.set(cacheKey, results, 300_000);
        return results;
    }

    // ─── Cron Jobs ───────────────────────────────────────────────

    @Cron(CronExpression.EVERY_MINUTE)
    async syncAllMatches() {
        for (const league of SportsService.LEAGUES) {
            await this.syncLeague(league);
        }
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    async syncAllStandings() {
        for (const league of SportsService.LEAGUES) {
            await this.syncStandings(league);
        }
    }

    // ─── Private Sync Logic ──────────────────────────────────────

    private async syncLeague({ sport, espnSlug, dbKey }: LeagueConfig) {
        try {
            const dates = this.buildSyncDates();

            for (const dateStr of dates) {
                const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${espnSlug}/scoreboard?dates=${dateStr}`;
                const { data } = await axios.get(url);

                for (const event of data.events || []) {
                    await this.processEvent(event, sport, dbKey);
                }
            }

            await this.cacheManager.del(`${dbKey.toLowerCase()}_matches_dashboard`);
        } catch (error) {
            this.logger.error(`Error syncing ${dbKey}: ${error.message}`);
        }
    }

    private async processEvent(event: any, sport: string, dbKey: string) {
        const comp = event.competitions?.[0];
        if (!comp) return;

        const home = comp.competitors?.find((c) => c.homeAway === 'home');
        const away = comp.competitors?.find((c) => c.homeAway === 'away');
        if (!home || !away) return;

        const { status, clock } = this.resolveMatchStatus(event, dbKey);
        const homeLinescores = (home.linescores || []).map((l, i) => ({ period: i + 1, value: l.value }));
        const awayLinescores = (away.linescores || []).map((l, i) => ({ period: i + 1, value: l.value }));
        const leaders = this.extractLeaders(comp);

        const match = await this.prisma.match.upsert({
            where: { externalId: event.id },
            update: {
                homeScore: parseInt(home.score) || 0,
                awayScore: parseInt(away.score) || 0,
                homeLogo: home.team.logo || null,
                awayLogo: away.team.logo || null,
                status, currentClock: clock,
                homeLinescores: homeLinescores as any,
                awayLinescores: awayLinescores as any,
                leaders: leaders as any,
                updatedAt: new Date(),
            },
            create: {
                externalId: event.id,
                sport, league: dbKey,
                homeTeam: home.team.displayName,
                awayTeam: away.team.displayName,
                homeLogo: home.team.logo || null,
                awayLogo: away.team.logo || null,
                homeScore: parseInt(home.score) || 0,
                awayScore: parseInt(away.score) || 0,
                status, currentClock: clock,
                startTime: new Date(event.date),
                homeLinescores: homeLinescores as any,
                awayLinescores: awayLinescores as any,
                leaders: leaders as any,
            },
        });

        this.wsGateway.broadcastMatchUpdate(match as unknown as Match);
        await this.syncOdds(comp, match);
    }

    private async syncOdds(comp: any, match: any) {
        const oddData = comp.odds?.[0];
        if (!oddData) return;

        const provider = oddData.provider?.name || 'ESPN BET';
        const homeWin = parseFloat(oddData.homeTeamOdds?.moneyLine || oddData.home?.moneyLine) || null;
        const awayWin = parseFloat(oddData.awayTeamOdds?.moneyLine || oddData.away?.moneyLine) || null;
        const draw = parseFloat(oddData.drawOdds?.moneyLine || oddData.draw?.moneyLine) || null;

        await this.prisma.odds.upsert({
            where: { matchId_provider: { matchId: match.id, provider } },
            update: { homeWin, awayWin, draw },
            create: { matchId: match.id, provider, homeWin, awayWin, draw },
        });

        this.wsGateway.broadcastOddsUpdate({ matchId: match.id, provider, homeWin, awayWin, draw });
    }

    private async syncStandings({ sport, espnSlug, dbKey }: LeagueConfig) {
        try {
            const url = `https://site.api.espn.com/apis/v2/sports/${sport}/${espnSlug}/standings`;
            const { data } = await axios.get(url);
            const groups = data.children || (data.standings ? [data] : []);

            for (const group of groups) {
                const conference = group.name || 'General';
                const entries = (group.standings?.entries || group.entries) || [];

                for (const entry of entries) {
                    await this.upsertTeamRanking(entry, dbKey, conference);
                }
            }

            await this.cacheManager.del(`${dbKey.toLowerCase()}_standings_dashboard`);
        } catch (error) {
            this.logger.error(`Error syncing standings ${dbKey}: ${error.message}`);
        }
    }

    private async upsertTeamRanking(entry: any, dbKey: string, conference: string) {
        const { team, stats } = entry;
        const val = (name: string) => stats.find(s => s.name === name)?.value || 0;

        const shared = {
            wins: Math.floor(val('wins')),
            losses: Math.floor(val('losses')),
            draws: Math.floor(val('ties') || val('draws')),
            goalsFor: Math.floor(val('pointsFor') || val('goalsFor')),
            goalsAgainst: Math.floor(val('pointsAgainst') || val('goalsAgainst')),
            points: Math.floor(val('points')),
            pct: parseFloat((stats.find(s => s.name === 'winPercent')?.value || stats.find(s => s.name === 'points')?.value || 0).toString()),
            seed: Math.floor((stats.find(s => ['rank', 'playoffSeed'].includes(s.name))?.value || 0)),
            gamesBehind: parseFloat((val('gamesBehind')).toString()),
            streak: stats.find(s => s.name === 'streak')?.displayValue || '',
            teamAbbr: team.abbreviation,
            teamLogo: team.logos?.[0]?.href || null,
        };

        await this.prisma.teamRanking.upsert({
            where: { league_teamName: { league: dbKey, teamName: team.displayName } },
            update: { ...shared, lastUpdateAt: new Date() },
            create: { league: dbKey, conference, teamName: team.displayName, ...shared },
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────

    private resolveMatchStatus(event: any, dbKey: string): { status: string; clock: string } {
        const state = event.status?.type?.state;
        const completed = event.status?.type?.completed;
        const status = state === 'in' ? 'LIVE' : completed ? 'FINISHED' : 'SCHEDULED';

        let clock = status === 'FINISHED' ? 'FINAL' : (event.status?.displayClock || '');
        if (status === 'LIVE' && dbKey === 'NBA') {
            const period = event.status?.period;
            if (period) clock = `Q${period} ${clock}`;
        }
        return { status, clock };
    }

    private extractLeaders(comp: any) {
        return (comp.leaders || [])
            .map(cat => ({
                name: cat.name,
                value: cat.leaders?.[0]?.displayValue || '',
                athlete: {
                    displayName: cat.leaders?.[0]?.athlete?.displayName || '',
                    headshot: cat.leaders?.[0]?.athlete?.headshot || '',
                    position: cat.leaders?.[0]?.athlete?.position?.abbreviation || '',
                },
            }))
            .filter(l => l.athlete.displayName);
    }

    private buildSyncDates(): string[] {
        const today = new Date();
        return [-1, 0, 1].map(offset => {
            const date = new Date(today.getTime() + offset * 86_400_000);
            return date.toISOString().split('T')[0].replace(/-/g, '');
        });
    }

    private daysAgo(n: number): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return new Date(d.getTime() - n * 86_400_000);
    }
}

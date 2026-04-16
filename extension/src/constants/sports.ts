/** Shared sport & league configuration for the extension UI. */

export interface LeagueOption {
  id: string;
  label: string;
}

export interface SportOption {
  id: string;
  icon: string;
  label: string;
  sub?: LeagueOption[];
}

/** All soccer league identifiers (lowercase). */
export const SOCCER_LEAGUE_IDS = [
  'soccer_all', 'soccer', 'champions-league',
  'libertadores', 'sudamericana', 'world-cup',
] as const;

/** Sports grid configuration rendered in the selector. */
export const SPORTS: SportOption[] = [
  { id: 'NBA', icon: '🏀', label: 'NBA' },
  {
    id: 'SOCCER_GROUP',
    icon: '⚽',
    label: 'Soccer',
    sub: [
      { id: 'WORLD-CUP', label: 'World Cup 2026' },
      { id: 'Soccer', label: 'Argentine Soccer' },
      { id: 'CHAMPIONS-LEAGUE', label: 'Champions' },
      { id: 'LIBERTADORES', label: 'Libertadores' },
      { id: 'SUDAMERICANA', label: 'Sudamericana' },
    ],
  },
  { id: 'MLB', icon: '⚾', label: 'MLB' },
  { id: 'NHL', icon: '🏒', label: 'NHL' },
];

/** Determines if a sport key represents a soccer league. */
export function isSoccerLeague(sport: string): boolean {
  return SOCCER_LEAGUE_IDS.includes(sport.toLowerCase() as any);
}

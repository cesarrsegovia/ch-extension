import { create } from 'zustand'
import type { Match, Odds, TeamRanking } from '@sportsbook/types'
import en from '../locales/en.json'
import de from '../locales/de.json'
import fr from '../locales/fr.json'

const locales: Record<string, any> = { en, de, fr };

interface SportsStore {
    matches: Match[];
    standings: TeamRanking[];
    odds: Record<string, Odds>;
    selectedMatchId: string | null;
    selectedSport: string;
    selectedSection: 'home' | 'sportsbook' | 'games' | 'profile';
    language: 'en' | 'de' | 'fr';
    t: (key: string) => string;
    setMatches: (matches: Match[]) => void;
    setStandings: (standings: TeamRanking[]) => void;
    updateMatch: (match: Partial<Match> & { id: string }) => void;
    updateOdds: (odds: Odds) => void;
    setSelectedMatchId: (id: string | null) => void;
    setSelectedSport: (sport: string) => void;
    setSelectedSection: (section: 'home' | 'sportsbook' | 'games' | 'profile') => void;
    setLanguage: (lang: 'en' | 'de' | 'fr') => void;
}

export const useStore = create<SportsStore>((set, get) => ({
    matches: [],
    standings: [],
    odds: {},
    selectedMatchId: null,
    selectedSport: 'NBA',
    selectedSection: 'sportsbook',
    language: (localStorage.getItem('user_lang') as any) || 'en',
    t: (key: string) => {
        const lang = get().language;
        const messages = locales[lang] || locales['en'];
        return messages[key]?.message || key;
    },
    setMatches: (matches) => set({ matches }),
    setStandings: (standings) => set({ standings }),
    updateMatch: (updatedMatch) => set((state) => ({
        matches: state.matches.map((m) =>
            m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m
        )
    })),
    updateOdds: (newOdds) => set((state) => ({
        odds: { ...state.odds, [newOdds.matchId]: newOdds }
    })),
    setSelectedMatchId: (id) => set({ selectedMatchId: id }),
    setSelectedSport: (sport) => set({ selectedSport: sport, selectedMatchId: null }),
    setSelectedSection: (section) => set({ selectedSection: section, selectedMatchId: null }),
    setLanguage: (lang) => {
        localStorage.setItem('user_lang', lang);
        set({ language: lang });
    },
}))
